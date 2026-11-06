/**
 * AI Website Consultant Orchestrator
 * Connects visitor conversation with the deterministic calculator, knowledge retrieval and Gemini.
 */

import { logger } from "@/lib/logger";
import { calculateProjectEstimate, resolveCategoryKey, type ProjectEstimateResult } from "./calculator";
import {
  getPricingCalculationConfig,
  getPricingData,
  DEFAULT_BACKEND_PRICING_DATA,
} from "@/lib/services/pricing";
import type { EstimatorCalculationConfig } from "@/lib/pricing.config";
import { detectPromptAbuse, generateGeminiReply, isGeminiConfigured } from "@/lib/services/gemini";
import { formatRetrievedKnowledgeForPrompt, retrieveRelevantKnowledge } from "./knowledge-retrieval";
import {
  detectCategoryFromText,
  detectVisitorLanguage,
  isBiographyQuery,
  isComparisonQuery,
  isFeatureInquiry,
  isGeneralCompanyQuery,
  isGreetingQuery,
  isInquiryPreparationQuery,
  isProposalAcceptance,
  isScopingOrBudgetQuery,
} from "./intents";
import { extractConsultantParams } from "./requirements";
import {
  buildAcceptanceNote,
  buildBiographyNote,
  buildComparisonNote,
  buildCompanyNote,
  buildConsultantSystemPrompt,
  buildEstimateNote,
  buildFeatureNote,
  buildGreetingNote,
  buildInquiryNote,
} from "./prompts";
import {
  buildAcceptanceResponse,
  buildBiographyResponse,
  buildComparisonResponse,
  buildCompanyResponse,
  buildDefaultResponse,
  buildDeterministicConsultantResponse,
  buildDeterministicInquiryResponse,
  buildFeatureInquiryResponse,
  buildGreetingResponse,
  generateFollowUpSuggestions,
} from "./responses";
import type {
  ChatHistoryMessage,
  ConsultantResponse,
  PricingFacts,
  ProjectState,
  VisitorInfo,
} from "./types";

export * from "./intents";
export * from "./types";
export { extractConsultantParams, extractConsultantParams as extractProjectRequirements } from "./requirements";
export {
  buildDeterministicConsultantResponse,
  buildDeterministicInquiryResponse,
  generateFollowUpSuggestions,
} from "./responses";

async function loadPricing(): Promise<{ config: EstimatorCalculationConfig; facts: PricingFacts }> {
  let pricing = DEFAULT_BACKEND_PRICING_DATA;
  try {
    pricing = await getPricingData();
  } catch (err) {
    logger.warn("[AIConsultant] Could not load live pricing, using defaults", { error: String(err) });
  }

  return {
    config: getPricingCalculationConfig(pricing),
    facts: {
      startingPriceINR: pricing.categories.find((c) => c.id === "business")?.startingPrice ?? 0,
      dynamicAddOnINR: pricing.types.find((t) => t.id === "dynamic")?.additionalCost ?? 0,
      expressPercent: Math.round((pricing.settings.expressMultiplier ?? 0.2) * 100),
    },
  };
}

export async function processConsultantMessage({
  messages,
  visitorInfo,
  priorProjectState,
  temperature = 0.5,
}: {
  messages: ChatHistoryMessage[];
  visitorInfo?: VisitorInfo;
  priorProjectState?: ProjectState;
  temperature?: number;
}): Promise<ConsultantResponse> {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

  if (detectPromptAbuse(lastUserMessage).isAbusive) {
    return {
      messageText:
        "I am Webgent's AI consultant. I can help with scoping web projects, pricing and tech stacks. Tell me about the project you'd like to build!",
      followUpSuggestions: [
        "What services does Webgent offer?",
        "How do you calculate website cost?",
        "Can I book a discovery call?",
      ],
    };
  }

  const isGreeting = isGreetingQuery(lastUserMessage);
  const isGeneralCompany = isGeneralCompanyQuery(lastUserMessage);
  const isComparison = isComparisonQuery(lastUserMessage);
  const isBiography = isBiographyQuery(lastUserMessage);
  const isInquiry = isInquiryPreparationQuery(lastUserMessage);
  const isAcceptance = !isInquiry && isProposalAcceptance(lastUserMessage);
  const isFeatureQuery = isFeatureInquiry(lastUserMessage);
  const isScoping = isScopingOrBudgetQuery(lastUserMessage) && !isFeatureQuery && !isAcceptance && !isInquiry;
  const detectedCategory = detectCategoryFromText(lastUserMessage);
  const hasActiveProject = Boolean(priorProjectState?.isActivelyQuoting);
  const isDepositQuery = /\b(deposit|advance|payment|pay)\b/i.test(lastUserMessage);

  const extractedParams = extractConsultantParams(messages, priorProjectState);

  const shouldQuote =
    !isGreeting &&
    !isGeneralCompany &&
    !isComparison &&
    !isBiography &&
    !isAcceptance &&
    !isInquiry &&
    !isFeatureQuery &&
    (Boolean(detectedCategory) || isScoping || (hasActiveProject && Boolean(extractedParams.userBudgetINR)));

  const { config: pricingConfig, facts } = await loadPricing();

  // Acceptances and feature questions only refer to a project the visitor has already scoped.
  const needsEstimate =
    shouldQuote || isInquiry || ((isAcceptance || isFeatureQuery) && (hasActiveProject || Boolean(detectedCategory)));
  const estimate: ProjectEstimateResult | undefined = needsEstimate
    ? calculateProjectEstimate(extractedParams, pricingConfig)
    : undefined;

  const categoryKey = estimate?.categoryKey || resolveCategoryKey(extractedParams.categoryKey);
  const followUpSuggestions = generateFollowUpSuggestions(categoryKey, estimate, lastUserMessage);
  const language = detectVisitorLanguage(lastUserMessage);

  const updatedProjectState: ProjectState = {
    categoryKey,
    pageCount: (extractedParams.pageCount ?? estimate?.pages.count) || priorProjectState?.pageCount || 5,
    userBudgetINR: extractedParams.userBudgetINR ?? priorProjectState?.userBudgetINR,
    deliverySpeed: extractedParams.deliverySpeed ?? priorProjectState?.deliverySpeed ?? "standard",
    selectedFeatureIds: extractedParams.selectedFeatureIds ?? priorProjectState?.selectedFeatureIds,
    architecture: estimate?.architecture ?? priorProjectState?.architecture ?? "static",
    isActivelyQuoting: shouldQuote || hasActiveProject,
  };

  const respond = (messageText: string, attachEstimate = false): ConsultantResponse => ({
    messageText,
    estimate: attachEstimate ? estimate : undefined,
    followUpSuggestions,
    categoryKey,
    updatedProjectState,
  });

  /** Used when no language model is available, in the same priority order as the prompts below. */
  const buildFallback = (): ConsultantResponse => {
    if (estimate && shouldQuote) {
      return respond(buildDeterministicConsultantResponse(estimate, visitorInfo), true);
    }
    if (isInquiry) return respond(buildDeterministicInquiryResponse(categoryKey, estimate, extractedParams));
    if (isAcceptance) return respond(buildAcceptanceResponse(estimate, language));
    if (isFeatureQuery) {
      return respond(buildFeatureInquiryResponse(estimate, isDepositQuery, language, pricingConfig));
    }
    if (isGreeting) return respond(buildGreetingResponse(language));
    if (isGeneralCompany) return respond(buildCompanyResponse(language, facts));
    if (isBiography) return respond(buildBiographyResponse(language));
    if (isComparison) return respond(buildComparisonResponse(language));
    return respond(buildDefaultResponse(language, facts));
  };

  if (!isGeminiConfigured()) {
    logger.info("[AIConsultant] Operating in deterministic offline fallback mode");
    return buildFallback();
  }

  let contextNote = "";
  if (isGreeting) contextNote = buildGreetingNote(lastUserMessage, language);
  else if (isGeneralCompany) contextNote = buildCompanyNote(lastUserMessage, language);
  else if (isComparison) contextNote = buildComparisonNote(lastUserMessage, language);
  else if (isBiography) contextNote = buildBiographyNote(lastUserMessage, language);
  else if (isInquiry) contextNote = buildInquiryNote(lastUserMessage, estimate, extractedParams);
  else if (isAcceptance) contextNote = buildAcceptanceNote(lastUserMessage, estimate, language);
  else if (isFeatureQuery) {
    contextNote = buildFeatureNote(lastUserMessage, estimate, isDepositQuery, language, pricingConfig);
  } else if (estimate && shouldQuote) contextNote = buildEstimateNote(estimate, language);

  const relevantDocs = await retrieveRelevantKnowledge(lastUserMessage, 3);
  const systemInstruction = [
    buildConsultantSystemPrompt(facts),
    formatRetrievedKnowledgeForPrompt(relevantDocs),
    contextNote,
  ]
    .filter(Boolean)
    .join("\n\n");

  const reply = await generateGeminiReply({ messages, systemInstruction, temperature });
  if (reply) {
    return respond(reply, shouldQuote);
  }

  logger.warn("[AIConsultant] Live Gemini calls failed, using structured fallback");
  return buildFallback();
}

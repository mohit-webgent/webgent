/**
 * AI Website Consultant Orchestrator
 * Connects natural visitor conversation with Webgent's deterministic calculator,
 * dynamic website knowledge retrieval, market benchmarks, and Google Gemini API.
 */

import { logger } from "@/lib/logger";
import {
  calculateProjectEstimate,
  resolveCategoryKey,
  ProjectEstimateResult,
  CalculatorInput,
} from "./calculator";
import {
  detectPromptAbuse,
  getGeminiClient,
  SUPPORTED_GEMINI_MODELS,
} from "@/lib/services/gemini";
import {
  retrieveRelevantKnowledge,
  formatRetrievedKnowledgeForPrompt,
} from "./knowledge-retrieval";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface VisitorInfo {
  name?: string;
  email?: string;
}

export interface ProjectState {
  categoryKey?: string;
  pageCount?: number;
  userBudgetINR?: number;
  deliverySpeed?: "standard" | "express";
  selectedFeatureIds?: string[];
  architecture?: "static" | "dynamic";
  isActivelyQuoting?: boolean;
}

export interface ConsultantResponse {
  messageText: string;
  estimate?: ProjectEstimateResult;
  followUpSuggestions: string[];
  categoryKey?: string;
  updatedProjectState?: ProjectState;
}

export const AI_CONSULTANT_SYSTEM_PROMPT = `You are Mohit Verma, Founder & Lead Web Architect at Webgent (webgent.com), an elite next-generation digital engineering agency.

### MISSION & ROLE
You act as an expert technical consultant, smart cost estimator, and trusted advisor to visitors and prospective clients.

### CONVERSATIONAL RULES & GUIDELINES:
1. **NATURAL TONE & CONCISENESS**:
   - Keep answers concise by default (2–4 punchy paragraphs or clean bullet points). Only expand when the user asks for deep technical details.
   - Avoid unnecessary headings, excessive bold formatting, and repetitive introductions.
   - NEVER start every message with "I am Mohit Verma, Founder & Lead Web Architect at Webgent...". The chat header already displays your name, photo, and verified badge.
   - Greetings must be brief, friendly, and natural:
     * English ("Hi", "Hello") -> A short, warm greeting (e.g., "Hey! How can I help you today?").
     * Hindi/Hinglish ("Kaise ho?", "Kya haal hai") -> A natural response in Hinglish (e.g., "Main badhiya hoon! Aap bataiye, aaj kaise madad kar sakta hoon aapki?").
2. **MATCH THE VISITOR'S LANGUAGE NATURALLY**:
   - If the visitor speaks Hindi or Hinglish (e.g., "Webgent ke baare mein batao", "mujhe gym website banwani hai"), respond naturally in warm, professional Hinglish.
   - If the visitor speaks English, respond in English.
3. **GENERAL QUESTIONS & COMPARISONS**:
   - For general questions (e.g. "Webgent ke baare mein batao"), answer directly from Webgent's business knowledge. Explain our focus on next-gen engineering (Next.js 14, React, Node.js, PostgreSQL), sub-second page speeds, clean UI, and 100% source code ownership.
   - For market comparison questions (e.g. "Tumhare price aur market price mein kya difference hai?"):
     * Explain clearly: Webgent provides transparent milestone pricing (50% advance / 50% upon launch review) with clean custom Next.js code, sub-second speeds, zero hidden renewal fees, 100% source code ownership, and 15 days free post-launch support. Traditional agencies often charge ₹30,000–₹60,000+ for slow, off-the-shelf WordPress templates with recurring lock-ins.
     * DO NOT repeat a full website proposal or re-pitch when answering comparison questions.
4. **PROJECT SCOPING & BUDGET HANDLING**:
   - When a user asks about building a specific website (e.g. Gym):
     * Recommend essential pages (Home, About & Facilities, Programs, Class Schedule, Plans, Contact) and key features (WhatsApp integration, schedule table, SEO).
     * If they mention a budget (e.g. ₹15,000 for a gym website):
       - If the project fits within the budget (Gym starter website starts at ₹9,999 under our Starter tier), reassure them that it easily fits! Explain what features they get and how the remaining budget can be used.
       - If the project exceeds budget (e.g. ₹15,000 for an e-commerce platform that costs ₹39,999+), explain transparently what is feasible (Phase 1 MVP with WhatsApp ordering under Starter tier at ₹9,999–₹14,999) and what can be deferred.
       - Never invent fake discounts or alter server-calculated numbers.
5. **FOLLOW-UP QUESTIONS**:
   - Ask at most ONE relevant, natural follow-up question that helps clarify requirements or advance the discussion, instead of ending with a generic sales pitch.
`;

/**
 * Detects project category from text.
 */
export function detectCategoryFromText(text: string): string | null {
  const lower = text.toLowerCase();

  if (/\b(gym|fitness|crossfit|workout|trainer|bodybuilding|powerlifting)\b/i.test(lower)) {
    return "gym";
  }
  if (/\b(jewel|jewellery|jewelry|ecom|ecommerce|e-commerce|online store|shopping cart|clothing|fashion|d2c)\b/i.test(lower)) {
    return "ecommerce";
  }
  if (/\b(restaurant|cafe|dining|food|menu|cloud kitchen|bakery|diner)\b/i.test(lower)) {
    return "restaurant";
  }
  if (/\b(employee|staff|attendance|payroll|internal tool|hr portal)\b/i.test(lower)) {
    return "employee_management";
  }
  if (/\b(book|booking|appointment|salon|clinic|doctor|dentist|schedul)\b/i.test(lower)) {
    return "booking_platform";
  }
  if (/\b(portfolio|resume|personal brand|freelancer|photographer)\b/i.test(lower)) {
    return "portfolio";
  }
  if (/\b(saas|software app|web app|cloud tool)\b/i.test(lower)) {
    return "saas";
  }
  if (/\b(real estate|property|builder|broker|architect)\b/i.test(lower)) {
    return "realestate";
  }
  if (/\b(coaching|academy|education|institute|course|school|tutor)\b/i.test(lower)) {
    return "education";
  }

  return null;
}

/**
 * Detects visitor language intent (Hinglish/Hindi vs English).
 */
export function detectVisitorLanguage(text: string): "hinglish" | "english" {
  const lower = text.toLowerCase();
  const hinglishPatterns = [
    /\b(kaise|kya|hai|batao|banwani|banwana|chahiye|kitna|kitne|mera|meri|tumhare|humara|mein|karo|hoga|bhi|shukriya|namaste|haan|nahi|karna|lagta)\b/i,
  ];

  if (hinglishPatterns.some((pattern) => pattern.test(lower))) {
    return "hinglish";
  }
  return "english";
}

/**
 * Checks whether user message is a simple greeting.
 */
export function isGreetingQuery(text: string): boolean {
  const clean = text.toLowerCase().trim().replace(/[!?.,;]/g, "");
  const greetings = [
    "hi",
    "hello",
    "hey",
    "heya",
    "namaste",
    "namaskar",
    "kaise ho",
    "kya hal hai",
    "kya haal hai",
    "who are you",
    "who r u",
    "who is this",
    "good morning",
    "good afternoon",
    "good evening",
  ];

  if (greetings.includes(clean)) return true;
  return clean.split(/\s+/).length <= 3 && greetings.some((g) => clean.startsWith(g));
}

/**
 * Checks whether user message is asking general information about Webgent.
 */
export function isGeneralCompanyQuery(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const patterns = [
    /webgent\s+ke\s+baare\s+mein/i,
    /about\s+webgent/i,
    /what\s+is\s+webgent/i,
    /who\s+is\s+webgent/i,
    /who\s+are\s+you/i,
    /who\s+r\s+u/i,
    /founder\s+kaun\s+hai/i,
    /who\s+is\s+the\s+founder/i,
    /what\s+services\s+do\s+you/i,
    /tell\s+me\s+about\s+(your\s+)?(agency|company|team|services)/i,
    /aapke\s+services\s+kya\s+hai/i,
    /tech\s+stack\s+kya\s+hai/i,
    /which\s+tech\s+stack/i,
  ];
  return patterns.some((p) => p.test(lower));
}

/**
 * Checks whether user message is asking for a market comparison or pricing difference.
 */
export function isComparisonQuery(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const patterns = [
    /market\s+price/i,
    /market\s+rate/i,
    /difference\s+hai/i,
    /kya\s+difference/i,
    /kya\s+farq/i,
    /compare/i,
    /comparison/i,
    /other\s+agencies/i,
    /dusri\s+agency/i,
    /baki\s+agencies/i,
  ];
  return patterns.some((p) => p.test(lower));
}

/**
 * Checks whether user message is seeking consultation, features, scope, or cost estimation.
 */
export function isConsultationQuery(text: string): boolean {
  const lower = text.toLowerCase();
  if (isGreetingQuery(lower) || isGeneralCompanyQuery(lower) || isComparisonQuery(lower)) {
    return false;
  }

  const keywords = [
    "website",
    "web site",
    "cost",
    "price",
    "pricing",
    "how much",
    "features",
    "pages",
    "gym",
    "fitness",
    "store",
    "jewellery",
    "jewelry",
    "ecommerce",
    "e-commerce",
    "booking",
    "appointment",
    "employee",
    "portal",
    "restaurant",
    "portfolio",
    "saas",
    "build",
    "create",
    "develop",
    "banwani",
    "banwana",
    "timeline",
    "estimate",
    "quote",
    "quotation",
    "budget",
    "recommend",
  ];

  return keywords.some((kw) => lower.includes(kw));
}

/**
 * Checks whether user message is explicitly modifying budget or requesting project scope.
 */
export function isScopingOrBudgetQuery(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (isGreetingQuery(lower) || isGeneralCompanyQuery(lower) || isComparisonQuery(lower)) {
    return false;
  }

  // Budget mentions
  if (/(?:budget|under|around|below|max|within|₹|rs\.?|inr|\d+k)\s*(\d+)?/i.test(lower)) {
    return true;
  }
  // Explicit project creation or category mentions
  if (
    /\b(banwani|banwana|build|create|develop|need|want|chahiye)\b/i.test(lower) &&
    /\b(website|web app|app|portal|store|gym|ecommerce|restaurant|saas|site)\b/i.test(lower)
  ) {
    return true;
  }
  // Feature addition/modification
  if (
    /\b(add|include|features?|pages?|with|without)\b/i.test(lower) &&
    /\b(payment|cart|login|dashboard|inventory|booking|calendar)\b/i.test(lower)
  ) {
    return true;
  }

  return false;
}

/**
 * Extracts and merges project signals and parameters from user conversation and prior state.
 */
export function extractConsultantParams(
  messages: ChatHistoryMessage[],
  priorState?: ProjectState,
): CalculatorInput {
  const latestMessage = messages[messages.length - 1]?.content || "";
  const latestLower = latestMessage.toLowerCase();

  // 1. Detect Category: check latest message first
  const detectedCategoryInLatest = detectCategoryFromText(latestMessage);

  let isProjectSwitch = false;
  let categoryKey: string | undefined = undefined;

  if (detectedCategoryInLatest) {
    if (priorState?.categoryKey && priorState.categoryKey !== detectedCategoryInLatest) {
      isProjectSwitch = true;
    }
    categoryKey = detectedCategoryInLatest;
  } else {
    // If not in latest message, check recent user messages in reverse
    const userMessages = messages.filter((m) => m.role === "user").reverse();
    for (const msg of userMessages) {
      const cat = detectCategoryFromText(msg.content);
      if (cat) {
        categoryKey = cat;
        break;
      }
    }
    if (!categoryKey) {
      categoryKey = priorState?.categoryKey || "business";
    }
  }

  // 2. Resolve features: If project switch occurred, reset old features!
  const featureSet = new Set<string>(
    isProjectSwitch ? [] : priorState?.selectedFeatureIds || [],
  );

  // Scan text for feature additions (MUST only scan user messages, never assistant replies)
  const userTextForFeatures = isProjectSwitch
    ? latestLower
    : messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(" ")
        .toLowerCase();

  if (/\b(payment|razorpay|stripe|upi gateway|checkout|pay online)\b/i.test(userTextForFeatures)) {
    featureSet.add("payment_gateway");
  }
  if (/\b(online booking|appointment booking|booking calendar|book appointments|slot booking)\b/i.test(userTextForFeatures)) {
    featureSet.add("booking_calendar");
  }
  if (/\b(whatsapp alert|sms alert|instant notification)\b/i.test(userTextForFeatures)) {
    featureSet.add("whatsapp_alerts");
  }
  if (/\b(whatsapp|chat button)\b/i.test(userTextForFeatures)) {
    featureSet.add("whatsapp_chat");
  }
  if (/\b(user login|member portal|client portal|user account|signup|auth)\b/i.test(userTextForFeatures)) {
    featureSet.add("user_login");
  }
  if (/\b(admin dashboard|custom admin|leads portal)\b/i.test(userTextForFeatures)) {
    featureSet.add("admin_dashboard");
  }
  if (/\b(inventory|stock counter|low stock)\b/i.test(userTextForFeatures)) {
    featureSet.add("inventory_stock");
  }
  if (/\b(invoice|gst bill|pdf invoice)\b/i.test(userTextForFeatures)) {
    featureSet.add("invoice_generation");
  }
  if (/\b(blog|articles|news section)\b/i.test(userTextForFeatures)) {
    featureSet.add("blog");
  }
  if (/\b(photo gallery|gallery showcase|photos|lightbox)\b/i.test(userTextForFeatures)) {
    featureSet.add("gallery_showcase");
  }
  if (/\b(seo|google ranking|search console)\b/i.test(userTextForFeatures)) {
    featureSet.add("seo_basic");
  }
  if (/\b(smooth animations|gsap|kinetic)\b/i.test(userTextForFeatures)) {
    featureSet.add("animations_smooth");
  }

  // 3. Page Count: if project switch, reset to category default unless explicitly given in latest message
  let pageCount: number | undefined = isProjectSwitch ? undefined : priorState?.pageCount;
  const pageMatch = latestLower.match(/(\d+)\s*(?:-|to)?\s*(?:\d+)?\s*(?:pages|page|screens)/i);
  if (pageMatch && pageMatch[1]) {
    pageCount = parseInt(pageMatch[1], 10);
  }

  // 4. Budget: detect in latest message first, then fall back to priorState if not switched
  let userBudgetINR: number | undefined = isProjectSwitch ? undefined : priorState?.userBudgetINR;
  const budgetMatch = latestLower.match(
    /(?:budget|under|around|below|max|within|have|got|₹|rs\.?|inr)\s*(?:of|is|:)?\s*(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d+)\s*(k|thousand|hazar|hazaar)?/i,
  );

  if (budgetMatch && budgetMatch[1]) {
    let rawNum = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
    if (
      budgetMatch[2] &&
      (budgetMatch[2].toLowerCase() === "k" ||
        budgetMatch[2].toLowerCase() === "thousand" ||
        budgetMatch[2].toLowerCase() === "hazar" ||
        budgetMatch[2].toLowerCase() === "hazaar")
    ) {
      rawNum *= 1000;
    }
    if (rawNum >= 1000 && rawNum <= 5000000) {
      userBudgetINR = rawNum;
    }
  }

  // 5. Delivery Speed
  let deliverySpeed: "standard" | "express" | undefined = isProjectSwitch
    ? "standard"
    : priorState?.deliverySpeed;
  if (
    latestLower.includes("urgent") ||
    latestLower.includes("express") ||
    latestLower.includes("asap") ||
    latestLower.includes("fast") ||
    latestLower.includes("in 3 days") ||
    latestLower.includes("in 5 days")
  ) {
    deliverySpeed = "express";
  }

  return {
    categoryKey,
    pageCount,
    userBudgetINR,
    deliverySpeed: deliverySpeed || "standard",
    selectedFeatureIds: Array.from(featureSet),
    architecture: isProjectSwitch ? undefined : priorState?.architecture,
  };
}

export const extractProjectRequirements = extractConsultantParams;

/**
 * Generates context-sensitive follow-up quick suggestions.
 */
export function generateFollowUpSuggestions(
  categoryKey: string,
  estimate?: ProjectEstimateResult,
  lastQuery = "",
): string[] {
  const lower = lastQuery.toLowerCase();
  const chips: string[] = [];

  if (estimate && estimate.budgetAnalysis && !estimate.budgetAnalysis.fitsBudget) {
    chips.push("How can we reduce scope to fit my budget?");
    chips.push("Can we postpone optional features for Phase 2?");
    chips.push("What is included in the Starter MVP scope?");
    return chips;
  }

  if (categoryKey === "ecommerce") {
    chips.push("Can we integrate Razorpay & UPI QR payments?");
    chips.push("How does product inventory management work?");
    chips.push("Can customers order directly on WhatsApp?");
  } else if (categoryKey === "gym") {
    chips.push("Can members view class timings and reserve slots?");
    chips.push("Can we add trainers profiles and client transformations?");
    chips.push("How do we receive WhatsApp membership inquiries?");
  } else if (categoryKey === "restaurant") {
    chips.push("Can customers view an interactive digital food menu?");
    chips.push("Can we accept table reservations directly?");
    chips.push("Does it include Google Maps location directions?");
  } else if (categoryKey === "booking_platform") {
    chips.push("Can clients pay advance deposits during booking?");
    chips.push("Does it send automated WhatsApp reminders?");
    chips.push("Can I manage multiple staff calendars?");
  } else if (categoryKey === "employee_management") {
    chips.push("How does role-based access (Admin vs Employee) work?");
    chips.push("Can we export attendance reports to Excel/PDF?");
    chips.push("Is our employee data securely hosted?");
  } else if (categoryKey === "saas") {
    chips.push("Does it include recurring Stripe subscription billing?");
    chips.push("What is the timeline for a production SaaS MVP?");
    chips.push("Can you build an interactive ROI calculator?");
  } else {
    if (!lower.includes("budget")) {
      chips.push("Can we adjust features to fit my target budget?");
    }
    chips.push("What services does Webgent offer?");
    chips.push("How does Webgent calculate project milestones?");
  }

  return chips.slice(0, 3);
}

/**
 * Builds a deterministic, structured consultant response when running in offline fallback mode.
 */
export function buildDeterministicConsultantResponse(
  estimate: ProjectEstimateResult,
  visitorInfo?: VisitorInfo,
): string {
  const greeting = visitorInfo?.name ? `Hello ${visitorInfo.name}! ` : "Hello! ";

  const essentialNames = estimate.features.essential.map((f) => f.name).join(", ");
  const recommendedNames = estimate.features.recommended.map((f) => f.name).join(", ");

  let text = `${greeting}Here is our architectural recommendation for your **${estimate.categoryDisplayName}** project:\n\n`;

  text += `### Recommended Pages (${estimate.pages.count} Pages)\n`;
  estimate.pages.list.slice(0, 5).forEach((page, idx) => {
    text += `${idx + 1}. **${page.name}** (\`${page.slug}\`): ${page.purpose}\n`;
  });

  text += `\n### Feature Architecture\n`;
  text += `- **Essential**: ${essentialNames || "Contact form, WhatsApp chat, Mobile responsive, Basic SEO"}\n`;
  if (recommendedNames) {
    text += `- **Recommended**: ${recommendedNames}\n`;
  }
  text += `- **Architecture**: **${estimate.architecture === "dynamic" ? "Dynamic (PostgreSQL + Editable Backend)" : "Static Website (Ultra-Fast, Zero DB Cost)"}**\n`;

  text += `\n### Transparent Cost & Timeline\n`;
  text += `- **Development Fee**: **₹${estimate.cost.oneTimeTotalINR.toLocaleString("en-IN")}** (Milestone: 50% upfront, 50% upon final launch)\n`;
  text += `- **Estimated Delivery**: **${estimate.estimatedTimeline}**\n`;

  if (estimate.budgetAnalysis) {
    text += `\n### Budget Assessment\n`;
    text += `- **Target Budget**: ₹${estimate.budgetAnalysis.userBudgetINR.toLocaleString("en-IN")}\n`;
    text += `- **Status**: ${estimate.budgetAnalysis.fitsBudget ? "Within Budget" : "Exceeds Budget"}\n`;
    text += `- ${estimate.budgetAnalysis.recommendation}\n`;
  }

  return text;
}

/**
 * Main AI Consultant Orchestrator.
 * Interprets visitor queries, performs semantic retrieval, calculates authoritative pricing,
 * and calls Gemini with intelligent fallback.
 */
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

  // 1. Check prompt abuse / injection
  const abuseCheck = detectPromptAbuse(lastUserMessage);
  if (abuseCheck.isAbusive) {
    return {
      messageText:
        "I am Webgent's AI engineering consultant. I can assist with scoping modern web applications, architectural design, pricing breakdowns, and tech stacks. Let me know about the project you'd like to build!",
      followUpSuggestions: [
        "What services does Webgent offer?",
        "How do you calculate website cost?",
        "Can I book a discovery call?",
      ],
    };
  }

  // 2. Classify intent: Greeting vs. General Company vs. Market Comparison vs. Project Scoping
  const isGreeting = isGreetingQuery(lastUserMessage);
  const isGeneralCompany = isGeneralCompanyQuery(lastUserMessage);
  const isComparison = isComparisonQuery(lastUserMessage);
  const isScoping = isScopingOrBudgetQuery(lastUserMessage);
  const detectedCategoryInLatest = detectCategoryFromText(lastUserMessage);

  // 3. Extract and accumulate project parameters across conversation turns
  const extractedParams = extractConsultantParams(messages, priorProjectState);

  // Only quote if actively scoping/asking for a project, not on greetings, general company Q&A, or comparisons
  const shouldQuote =
    !isGreeting &&
    !isGeneralCompany &&
    !isComparison &&
    (Boolean(detectedCategoryInLatest) || isScoping || (Boolean(priorProjectState?.isActivelyQuoting) && Boolean(extractedParams.userBudgetINR)));

  let estimate: ProjectEstimateResult | undefined = undefined;
  if (shouldQuote && (extractedParams.categoryKey || isScoping)) {
    estimate = calculateProjectEstimate(extractedParams);
  }

  const categoryKey = estimate?.categoryKey || resolveCategoryKey(extractedParams.categoryKey);
  const followUpSuggestions = generateFollowUpSuggestions(categoryKey, estimate, lastUserMessage);
  const visitorLanguage = detectVisitorLanguage(lastUserMessage);

  const updatedProjectState: ProjectState = {
    categoryKey,
    pageCount: (extractedParams.pageCount ?? estimate?.pages.count) || undefined,
    userBudgetINR: extractedParams.userBudgetINR ?? undefined,
    deliverySpeed: extractedParams.deliverySpeed ?? undefined,
    selectedFeatureIds: extractedParams.selectedFeatureIds ?? undefined,
    architecture: estimate?.architecture,
    isActivelyQuoting: shouldQuote,
  };

  // 4. Retrieve authoritative Webgent ground truth for the user's specific query
  const relevantDocs = await retrieveRelevantKnowledge(lastUserMessage, 3);
  const retrievedGroundTruth = formatRetrievedKnowledgeForPrompt(relevantDocs);

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const isKeyMissingOrPlaceholder =
    !apiKey ||
    apiKey.startsWith("your_") ||
    apiKey.startsWith("sk-") ||
    apiKey === "placeholder";

  // 5. Deterministic fallback if API key is not configured
  if (isKeyMissingOrPlaceholder) {
    logger.info("[AIConsultant] Operating in deterministic offline fallback mode");
    if (estimate && shouldQuote) {
      return {
        messageText: buildDeterministicConsultantResponse(estimate, visitorInfo),
        estimate,
        followUpSuggestions,
        categoryKey,
        updatedProjectState,
      };
    }

    if (isGreeting) {
      return {
        messageText:
          visitorLanguage === "hinglish"
            ? "Main badhiya hoon! Aap bataiye, aaj Webgent ke saath kaunsa project discuss karna chahte hain?"
            : "Hey! How can I help you today? Feel free to ask about our web development services, tech stack, or tell me about a website you're looking to build!",
        followUpSuggestions,
        categoryKey,
        updatedProjectState,
      };
    }

    if (isGeneralCompany) {
      return {
        messageText:
          visitorLanguage === "hinglish"
            ? "Webgent ek next-generation web engineering agency hai. Hum high-performance web applications, dynamic business websites aur SaaS products banate hain using Next.js 14, React aur PostgreSQL. Hum sub-second speed, clean architecture aur 100% source code ownership dete hain with milestone pricing starting from ₹9,999. Aap kis type ka website plan kar rahe hain?"
            : "Webgent is a next-generation web engineering agency building high-performance web applications, dynamic business platforms, and SaaS MVPs using Next.js 14, React, Node.js, and PostgreSQL. We focus on sub-second page speed, conversion-focused UI/UX, and 100% source code ownership. What kind of project are you looking to create?",
        followUpSuggestions,
        categoryKey,
        updatedProjectState,
      };
    }

    if (isComparison) {
      return {
        messageText:
          visitorLanguage === "hinglish"
            ? "Market mein traditional agencies aksar slow WordPress templates ke liye ₹30,000–₹60,000+ charge karti hain aur annual lock-in fees leti hain.\n\nWebgent mein hum:\n1. **Transparent Milestone Pricing**: 50% upfront aur 50% final launch review par. Zero hidden charges.\n2. **Modern Next.js 14 Stack**: Ultra-fast sub-second loading speed jo Google ranking aur conversions boost karta hai.\n3. **100% Code Ownership**: Sara source code aapka hota hai plus 15 din ka free post-launch support.\n\nKya aap chahenge ki hum aapke project ke specific features discuss karein?"
            : "Traditional agencies often charge ₹30,000–₹60,000+ for slow, off-the-shelf WordPress themes with recurring maintenance lock-ins.\n\nAt Webgent, we provide:\n1. **Transparent Milestone Pricing**: 50% upfront and 50% upon final launch review with zero hidden fees.\n2. **Modern Next.js 14 Stack**: Sub-second page speeds built from scratch for maximum SEO and conversions.\n3. **100% Code Ownership**: Full intellectual property transferred to you, plus 15 days free post-launch bug warranty.\n\nWould you like to explore what scope suits your upcoming project?",
        followUpSuggestions,
        categoryKey,
        updatedProjectState,
      };
    }

    return {
      messageText:
        visitorLanguage === "hinglish"
          ? "Welcome to Webgent! Hum custom web applications aur business websites develop karte hain starting from ₹9,999. Aap apne business (jaise gym, store, clinic, SaaS) ya budget ke baare mein batayein, aur main poora scope breakdown share kar dunga!"
          : "Welcome to Webgent! We build next-generation web applications, cloud infrastructure, and conversion-focused digital platforms starting from ₹9,999. Tell me about your business type or target budget to get an exact scope recommendation!",
      followUpSuggestions,
      categoryKey,
      updatedProjectState,
    };
  }

  // 6. Assemble context-augmented system instruction for Gemini
  let contextualSystemPrompt = `${AI_CONSULTANT_SYSTEM_PROMPT}\n\n${retrievedGroundTruth}`;

  if (isGreeting) {
    contextualSystemPrompt += `\n\n### CONTEXT NOTE:
The visitor is sending a simple greeting ("${lastUserMessage}").
Reply warmly, briefly, and conversationally in ${
      visitorLanguage === "hinglish"
        ? "natural Hinglish (e.g. 'Main badhiya hoon! Aap bataiye, kaise madad kar sakta hoon aapki?')"
        : "natural English (e.g. 'Hey there! How can I help you today?')"
    }.
DO NOT repeat your full title/bio, DO NOT introduce yourself as 'Mohit Verma Founder & Lead Web Architect' again, and DO NOT pitch an unprompted project proposal. Keep it under 2 lines.`;
  } else if (isGeneralCompany) {
    contextualSystemPrompt += `\n\n### CONTEXT NOTE:
The visitor is asking about Webgent generally ("${lastUserMessage}").
Answer in ${visitorLanguage === "hinglish" ? "clean, natural Hinglish" : "clear English"} using the authoritative Webgent business facts provided above.
Summarize what we do (elite digital engineering agency, Next.js 14, React, Node.js, PostgreSQL, sub-second speed, 100% source code ownership, milestone pricing starting from ₹9,999).
Keep the answer concise (2–3 short paragraphs or clean bullet points).
End with ONE relevant question asking what kind of project or business they are planning.
DO NOT provide an estimate card or proposal.`;
  } else if (isComparison) {
    contextualSystemPrompt += `\n\n### CONTEXT NOTE:
The visitor is asking how Webgent compares to market prices or other agencies ("${lastUserMessage}").
Answer in ${visitorLanguage === "hinglish" ? "clean, natural Hinglish" : "clear English"}.
Explain the genuine differences clearly in 3 concise bullet points:
1. Transparent milestone pricing (50% upfront, 50% upon final launch, zero hidden surprises or recurring lock-in fees).
2. Modern Next.js 14 & React engineering (sub-second loading speeds), unlike agencies charging ₹25,000–₹50,000+ for slow, off-the-shelf WordPress templates.
3. 100% complete source code and IP ownership transferred to the client, plus 15-day free post-launch bug warranty.
End with one simple follow-up question.
DO NOT repeat an entire project proposal or dump pricing cards.`;
  } else if (estimate && shouldQuote) {
    contextualSystemPrompt += `\n\n### SERVER-CALCULATED PROJECT ESTIMATE (STRICT AUTHORITATIVE GROUND TRUTH - DO NOT ALTER NUMBERS):
- Category: ${estimate.categoryDisplayName}
- Recommended Pages: ${estimate.pages.count} (${estimate.pages.list.map((p) => p.name).join(", ")})
- Page details:
${estimate.pages.list.map((p) => `  * ${p.name} (${p.slug}): ${p.purpose}`).join("\n")}
- Architecture: ${estimate.architecture === "dynamic" ? "Dynamic (PostgreSQL Database + Editable Backend)" : "Static Website (Fast, Zero Database Cost)"}
- Essential Features: ${estimate.features.essential.map((f) => f.name).join(", ")}
- Recommended Features: ${estimate.features.recommended.map((f) => f.name).join(", ")}
- Calculated Webgent Development Fee: ₹${estimate.cost.oneTimeTotalINR.toLocaleString("en-IN")}
- Delivery SLA: ${estimate.estimatedTimeline}
${
  estimate.budgetAnalysis
    ? `- BUDGET ANALYSIS & FEASIBILITY:
  * User Target Budget: ₹${estimate.budgetAnalysis.userBudgetINR.toLocaleString("en-IN")}
  * Status: ${estimate.budgetAnalysis.fitsBudget ? "WITHIN BUDGET (Comfortably Affordable)" : "EXCEEDS BUDGET"}
  * Recommendation: ${estimate.budgetAnalysis.recommendation}
  ${
    estimate.budgetAnalysis.fitsBudget
      ? "Instruct the visitor that their budget comfortably covers this project, highlight what is included in our starter package (₹9,999), and explain how the remaining budget can be utilized."
      : "Instruct the visitor on what is feasible at their budget (e.g. Starter tier MVP) and what can be deferred to Phase 2."
  }`
    : ""
}

INSTRUCTION: Discuss this specific project in ${visitorLanguage === "hinglish" ? "natural, conversational Hinglish" : "natural, conversational English"}.
Structure the response cleanly with bullet points for readability. Avoid repetitive introductions.
Ask at most ONE relevant follow-up question.`;
  }

  // 7. Format conversation messages for Gemini
  const formattedMessages: { role: "user" | "model"; content: string }[] = [];

  for (const msg of messages) {
    if (!msg.content || !msg.content.trim()) continue;
    const role = msg.role === "assistant" ? ("model" as const) : ("user" as const);
    const last = formattedMessages[formattedMessages.length - 1];
    if (last && last.role === role) {
      last.content += `\n\n${msg.content.trim()}`;
    } else {
      formattedMessages.push({ role, content: msg.content.trim() });
    }
  }

  if (formattedMessages.length === 0 || formattedMessages[0].role !== "user") {
    formattedMessages.unshift({ role: "user", content: lastUserMessage || "Hello" });
  }

  const contents = formattedMessages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  // 8. Invoke Gemini with cascading model fallback
  const ai = getGeminiClient(apiKey);
  const modelsToTry = Array.from(new Set(SUPPORTED_GEMINI_MODELS));

  let replyText: string | null = null;
  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Gemini timeout after 15s on model ${model}`)),
          15000,
        ),
      );

      const generatePromise = ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: contextualSystemPrompt,
          temperature,
          maxOutputTokens: 900,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const text = response.text?.trim();

      if (text) {
        replyText = text;
        break;
      }
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errMsg = lastError.message.toLowerCase();

      const isTransient =
        errMsg.includes("503") ||
        errMsg.includes("404") ||
        errMsg.includes("unavailable") ||
        errMsg.includes("not found") ||
        errMsg.includes("demand") ||
        errMsg.includes("timeout") ||
        errMsg.includes("resource_exhausted") ||
        errMsg.includes("rate limit") ||
        errMsg.includes("quota");

      if (isTransient) {
        logger.warn(`[AIConsultant] Model ${model} unavailable, trying fallback: ${lastError.message}`);
        continue;
      }

      logger.error(`[AIConsultant] Unexpected error with model ${model}`, { error: lastError.message });
      break;
    }
  }

  if (replyText) {
    return {
      messageText: replyText,
      estimate: shouldQuote ? estimate : undefined,
      followUpSuggestions,
      categoryKey,
      updatedProjectState,
    };
  }

  // Graceful fallback if live generation failed
  logger.warn("[AIConsultant] Live Gemini calls failed, using structured fallback", {
    error: lastError?.message,
  });

  if (estimate && shouldQuote) {
    return {
      messageText: buildDeterministicConsultantResponse(estimate, visitorInfo),
      estimate,
      followUpSuggestions,
      categoryKey,
      updatedProjectState,
    };
  }

  if (isGreeting) {
    return {
      messageText:
        visitorLanguage === "hinglish"
          ? "Main badhiya hoon! Aap bataiye, kaise madad kar sakta hoon aapki?"
          : "Hey! How can I help you today?",
      followUpSuggestions,
      categoryKey,
      updatedProjectState,
    };
  }

  if (isGeneralCompany) {
    return {
      messageText:
        visitorLanguage === "hinglish"
          ? "Webgent ek next-generation digital engineering agency hai. Hum high-performance web applications, dynamic business websites aur modern digital products banate hain using Next.js 14, React aur PostgreSQL. Hum sub-second speed aur 100% source code ownership provide karte hain with milestone pricing starting from ₹9,999. Aap kis type ka website plan kar rahe hain?"
          : "Webgent is a next-generation web engineering agency building high-performance web applications, dynamic business platforms, and SaaS MVPs using Next.js 14, React, Node.js, and PostgreSQL. We focus on sub-second page speed, conversion-focused UI/UX, and 100% source code ownership. What kind of project are you looking to create?",
      followUpSuggestions,
      categoryKey,
      updatedProjectState,
    };
  }

  if (isComparison) {
    return {
      messageText:
        visitorLanguage === "hinglish"
          ? "Market mein traditional agencies aksar slow WordPress templates ke liye ₹30,000–₹60,000+ charge karti hain aur annual lock-in fees leti hain.\n\nWebgent mein:\n1. **Transparent Milestone Pricing**: 50% upfront aur 50% launch par. Zero hidden surprises.\n2. **Modern Next.js 14 Engineering**: Sub-second loading speed jo user experience aur SEO boost karta hai.\n3. **100% Code Ownership**: Poora source code aur IP aapka hota hai plus 15-day free post-launch bug warranty.\n\nKya aap chahenge ki hum aapke project ke requirements discuss karein?"
          : "Traditional agencies often charge ₹30,000–₹60,000+ for slow, off-the-shelf WordPress themes with recurring maintenance lock-ins.\n\nAt Webgent, we provide:\n1. **Transparent Milestone Pricing**: 50% upfront and 50% upon final launch review with zero hidden fees.\n2. **Modern Next.js 14 Stack**: Sub-second page speeds built from scratch for maximum SEO and conversions.\n3. **100% Code Ownership**: Full intellectual property transferred to you, plus 15 days free post-launch bug warranty.\n\nWould you like to explore what scope suits your upcoming project?",
      followUpSuggestions,
      categoryKey,
      updatedProjectState,
    };
  }

  return {
    messageText:
      visitorLanguage === "hinglish"
        ? "Webgent modern web development aur cloud architecture mein specialize karta hai with transparent milestone pricing starting from ₹9,999. Aap kis business ke liye website plan kar rahe hain?"
        : "Webgent specializes in modern web development, scalable cloud architectures, and digital engineering solutions. We provide transparent milestone pricing starting from ₹9,999. Tell me about your business requirements or budget, and I'll generate a custom scoping recommendation for you!",
    followUpSuggestions,
    categoryKey,
    updatedProjectState,
  };
}

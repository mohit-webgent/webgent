import type { CalculatorInput } from "./calculator";
import { detectCategoryFromText, isBiographyQuery, isFeatureInquiry, isProposalAcceptance } from "./intents";
import type { ChatHistoryMessage, ProjectState } from "./types";

const NOT_MONEY = "(?!\\s*(?:products?|items?|users?|pages?|customers?|members?|employees?|people|visitors?|orders?|clients?|students?))";

/** Matches amounts only with a money cue. "I have 2000 products" must not become a ₹2,000 budget. */
const BUDGET_PATTERN = new RegExp(
  "(?:\\b(?:budget|under|around|below|max|within)\\s*(?:of|is|:)?\\s*(?:₹|rs\\.?|inr)?\\s*|\\b(?:have|got)\\s+(?:₹\\s*|rs\\.?\\s*|inr\\s*|(?=\\d+\\s*(?:k|lakh|lac)\\b))|₹\\s*|\\b(?:rs\\.?|inr)\\s*)" +
    "(\\d{1,3}(?:,\\d{3})+|\\d+)\\s*(k|thousand|hazar|hazaar|lakh|lac)?\\b" +
    NOT_MONEY,
  "i",
);

/** Matches phrasing where the amount comes first, such as "20k budget" or "50000 ka budget". */
const BUDGET_BEFORE_WORD_PATTERN = /(\d{1,3}(?:,\d{3})+|\d+)\s*(k|thousand|hazar|hazaar|lakh|lac)?\s+(?:ka\s+)?budget\b/i;

/**
 * Extracts and merges project signals and parameters from user conversation and prior state.
 */
export function extractConsultantParams(
  messages: ChatHistoryMessage[],
  priorState?: ProjectState,
): CalculatorInput {
  const latestMessage = messages[messages.length - 1]?.content || "";
  const latestLower = latestMessage.toLowerCase();

  const isBiography = isBiographyQuery(latestMessage);
  const isFeatureQuery = isFeatureInquiry(latestMessage);
  const isAcceptance = isProposalAcceptance(latestMessage);

  // 1. Detect Category: check latest message first
  const detectedCategoryInLatest = detectCategoryFromText(latestMessage);

  let isProjectSwitch = false;
  let categoryKey: string | undefined = undefined;

  // An explicit project switch occurs if the user explicitly requests a project or switches categories:
  // 1. Explicit switching phrasing: "change to", "switch to", "instead", "new project", etc.
  // 2. Explicit English project creation requests: "can you build/create/develop...", "i want/need an e-commerce website", etc.
  // 3. Explicit Hindi/Hinglish creation requests: "mujhe ... banwani/banwana/chahiye", "banwani hai", etc.
  // 4. Stale fallback override: if priorState was not actively quoting a specific project or defaulted to "business"
  const isExplicitProjectSwitch =
    /\b(change\s+to|switch\s+to|instead|nahi|rather\s+than|new\s+project|different\s+project)\b/i.test(latestLower) ||
    (/\b(can\s+you\s+(?:build|create|develop|make|design)|can\s+we\s+(?:build|create|develop|make)|could\s+you\s+(?:build|create|develop)|i\s+(?:want|need|would\s+like)\s+(?:to\s+(?:build|create|develop|make|have)|a|an)|looking\s+(?:for|to\s+build|to\s+create)|(?:build|create|develop|make|design)\s+(?:a|an|me|us)|how\s+much\s+(?:for|to\s+build|does\s+a)|(?:cost|price|quote|pricing)\s+(?:of|for)\s+(?:a|an))\b/i.test(latestLower) && Boolean(detectedCategoryInLatest)) ||
    (/\b(mujhe\s+.*(banwani|banwana|chahiye|need|want)|banwani\s+hai|banwana\s+hai|bana\s+sakte|banate\s+ho)\b/i.test(latestLower) && Boolean(detectedCategoryInLatest)) ||
    (Boolean(detectedCategoryInLatest) && priorState?.categoryKey === "business" && !priorState?.isActivelyQuoting);

  if (detectedCategoryInLatest && (!priorState?.categoryKey || isExplicitProjectSwitch)) {
    if (priorState?.categoryKey && priorState.categoryKey !== detectedCategoryInLatest) {
      isProjectSwitch = true;
    }
    categoryKey = detectedCategoryInLatest;
  } else if (priorState?.categoryKey) {
    categoryKey = priorState.categoryKey;
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
      categoryKey = "business";
    }
  }

  // 2. Resolve features: If project switch occurred, reset old features!
  const featureSet = new Set<string>(
    isProjectSwitch ? [] : priorState?.selectedFeatureIds || [],
  );

  // CRITICAL: Only scan for feature additions if this is NOT a deferred/hypothetical inquiry or acceptance!
  // Asking "can booking be added later" or "can clients pay advance deposits" must NOT mutate active Phase 1 features!
  if (!isFeatureQuery && !isAcceptance && !isBiography) {
    const userTextForFeatures = isProjectSwitch
      ? latestLower
      : messages
          .filter((m) => m.role === "user" && !isFeatureInquiry(m.content) && !isProposalAcceptance(m.content))
          .map((m) => m.content)
          .join(" ")
          .toLowerCase();

    if (/\b(add\s+payment|include\s+payment|razorpay|stripe|upi gateway|checkout|pay online)\b/i.test(userTextForFeatures)) {
      featureSet.add("payment_gateway");
    }
    if (/\b(add\s+booking|include\s+booking|appointment booking|booking calendar|slot booking)\b/i.test(userTextForFeatures)) {
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
  }

  // 3. Page Count: if project switch, reset to category default unless explicitly given in latest message
  let pageCount: number | undefined = isProjectSwitch ? undefined : priorState?.pageCount;
  const pageMatch = latestLower.match(/(\d+)\s*(?:-|to)?\s*(?:\d+)?\s*(?:pages|page|screens)/i);
  if (pageMatch && pageMatch[1]) {
    pageCount = parseInt(pageMatch[1], 10);
  }

  // 4. Budget: detect in latest message first, then fall back to priorState if not switched
  let userBudgetINR: number | undefined = isProjectSwitch ? undefined : priorState?.userBudgetINR;
  const budgetMatch = latestLower.match(BUDGET_PATTERN) || latestLower.match(BUDGET_BEFORE_WORD_PATTERN);

  if (budgetMatch && budgetMatch[1]) {
    let rawNum = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
    const unit = budgetMatch[2]?.toLowerCase();
    if (unit === "lakh" || unit === "lac") {
      rawNum *= 100000;
    } else if (unit) {
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
  // "fast" alone is not a delivery request: "a fast website" describes page speed, and the fee is 20%.
  if (/\b(urgent|urgently|express|asap|jaldi|fast[- ]?track|in\s+[35]\s+days)\b/i.test(latestLower)) {
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

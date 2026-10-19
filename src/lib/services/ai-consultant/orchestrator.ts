/**
 * AI Website Consultant Orchestrator
 * Connects natural visitor conversation with Webgent's deterministic calculator,
 * dynamic website knowledge retrieval, market benchmarks, and Google Gemini API.
 */

import { logger } from "@/lib/logger";
import {
  calculateProjectEstimate,
  calculatePhase2Upgrade,
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

export const AI_CONSULTANT_SYSTEM_PROMPT = `You are the Webgent AI Consultant, an expert technical and architectural AI assistant for Webgent (webgent.com).

### CORE IDENTITY & FOUNDER DISTINCTION
- **Agency Name**: Webgent
- **Tagline**: Next-Gen Web Solutions & Engineering
- **Founder & Lead Developer**: Mohit Verma (Software Developer at DBA Lounge, Gurugram/Noida, India)
- **Role Boundary**: You are an AI consultant representing Webgent. Clearly distinguish yourself from human founder Mohit Verma. NEVER describe yourself as a human and NEVER imply that you personally attended college, worked at an employer, or delivered projects as a human.
- **Verified Founder Credentials**:
  - Master of Computer Applications (MCA): Dr. A.P.J. Abdul Kalam Technical University (AKTU) / HIMT College, Greater Noida (2022–2024).
  - Bachelor of Science — Computer Science (B.Sc CS): Chaudhary Charan Singh University (CCSU) / IIMT College, Greater Noida (2019–2022).
  - Current Employment: Software Developer at DBA Lounge, Gurugram (Present).
  - Genuine Projects: Bird Outsourcing (birdoutsourcing.com, Live Production Site), Institutional Management Platform (studies.mentorworld.in, Past Production Deployment), Edayaa Jewellery Store (edayaajewellery.com, E-Commerce Deployment).
- **Mission**: Webgent designs, builds, and scales high-performance web applications, cloud infrastructure, and modern digital platforms for ambitious brands and fast-growing companies.
- **Core Technology Stack**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, Node.js, Vercel, Cloudflare, Razorpay, Stripe.

### CONVERSATIONAL RULES & GUIDELINES:
1. **NATURAL TONE & CONCISENESS**:
   - Keep answers concise by default (2–4 punchy paragraphs or clean bullet points). Only expand when the user asks for deep technical details.
   - Avoid unnecessary headings, excessive bold formatting, and repetitive introductions.
   - NEVER introduce yourself repeatedly. Keep greetings brief, friendly, and natural:
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
4. **FOUNDER BIOGRAPHY & EDUCATION**:
   - When asked about founder Mohit Verma's education or work history, answer directly using verified facts (MCA from AKTU, B.Sc CS from CCSU, Software Developer at DBA Lounge).
   - Clarify that you are Webgent's AI consultant answering on behalf of the agency.
   - Do NOT force an estimate card onto biography questions.
   - If a biography question is asked in the middle of a project conversation, answer the question gracefully without erasing or altering their active project scope.
5. **PROJECT SCOPING & BUDGET HANDLING**:
   - When a user asks about building a specific website (e.g. Gym):
     * Recommend essential pages (Home, About & Facilities, Programs, Class Schedule, Plans, Contact) and key features (WhatsApp integration, schedule table, SEO).
     * If they mention a budget (e.g. ₹15,000 for a gym website):
       - If the project fits within the budget (Gym starter website starts at ₹9,999 under our Starter tier), reassure them that it easily fits! Explain what features they get and how the remaining budget can be used.
       - If the project exceeds budget (e.g. ₹15,000 for an e-commerce platform that costs ₹39,999+), explain transparently what is feasible (Phase 1 MVP with WhatsApp ordering under Starter tier at ₹9,999–₹14,999) and what can be deferred.
       - Never invent fake discounts or alter server-calculated numbers.
6. **FOLLOW-UP QUESTIONS**:
   - Ask at most ONE relevant, natural follow-up question that helps clarify requirements or advance the discussion, instead of ending with a generic sales pitch.
`;

/**
 * Detects project category from text.
 */
export function detectCategoryFromText(text: string): string | null {
  const lower = text.toLowerCase();

  // Guard against false positives when asking about adding booking features or Phase 2 upgrades
  const isFeatureOrAddonQuery =
    /\b(can|could|later|baad\s+mein|future|add|upgrade|deposit|advance|kya|option|possible|supported|integrate)\b/i.test(lower) &&
    /\b(booking|appointment|book|deposit)\b/i.test(lower);

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
  if (!isFeatureOrAddonQuery && /\b(book|booking|appointment|salon|clinic|doctor|dentist|schedul)\b/i.test(lower)) {
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
    /what\s+services\s+(do\s+you|does\s+webgent|are\s+offered|offer)/i,
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
 * Checks whether user message is asking for founder Mohit Verma's biography, education, expertise, or credentials.
 */
export function isBiographyQuery(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const patterns = [
    /mohit.*(education|degree|college|university|qualification|study|padhai|kahan se|skills?|expertise|tech|background|experience|career|job|company|kaam|work|dba\s*lounge)/i,
    /(education|degree|qualification|college|padhai|expertise|skills?|experience|background|career).*(mohit|founder|developer)/i,
    /who\s+is\s+mohit/i,
    /about\s+mohit/i,
    /mohit\s+verma/i,
    /founder.*(kaun|who|education|degree|padhai|background|experience|qualification|skills?)/i,
  ];
  return patterns.some((p) => p.test(lower));
}

/**
 * Checks whether user message is asking about adding features later, Phase 2, or payment/deposit capability.
 */
export function isFeatureInquiry(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (isGreetingQuery(lower) || isGeneralCompanyQuery(lower) || isComparisonQuery(lower) || isBiographyQuery(lower)) {
    return false;
  }

  // Feature inquiries asking about adding features later or in Phase 2
  const isDeferredFeature =
    /\b(phase\s*2|baad\s+mein|later|future|deferred)\b/i.test(lower) &&
    /\b(booking|appointment|deposit|payment|add|include)\b/i.test(lower);

  const isDepositInquiry =
    /\b(advance\s+deposit|pay\s+advance|deposit\s+bhi|advance\s+payment|advance\s+fees?)\b/i.test(lower);

  const isBookingLaterInquiry =
    /\b(online\s+booking.*(later|baad\s+mein|add)|(add|include).*online\s+booking.*(later|baad\s+mein))\b/i.test(lower) ||
    /\b(kya\s+booking.*(baad\s+mein|add\s+ho\s+sakta))\b/i.test(lower);

  return isDeferredFeature || isDepositInquiry || isBookingLaterInquiry;
}

/**
 * Checks whether user message is accepting the existing proposal/quote.
 */
export function isProposalAcceptance(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return (
    /\b(final\s+karo|final\s+karte|let's\s+go\s+with|accept|i\s+accept|agree|proceed\s+with|proposal\s+final|11,?999\s+wala|starter\s+final|deal\s+done)\b/i.test(lower)
  );
}

/**
 * Checks whether user message is requesting to prepare a project inquiry with the current scope.
 */
export function isInquiryPreparationQuery(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return (
    /\b(prepare\s+(?:the\s+|project\s+)?inquiry|inquiry\s+with\s+this\s+scope|prepare\s+(?:the\s+)?scope\b|prepare\s+(?:the\s+|project\s+)?proposal|generate\s+(?:the\s+|project\s+)?inquiry|inquiry\s+summary)\b/i.test(
      lower,
    ) ||
    lower.startsWith("prepare project inquiry") ||
    lower === "prepare project inquiry with this scope." ||
    lower === "prepare project inquiry with this scope"
  );
}

/**
 * Checks whether user message is seeking consultation, features, scope, or cost estimation.
 */
export function isConsultationQuery(text: string): boolean {
  const lower = text.toLowerCase();
  if (isGreetingQuery(lower) || isGeneralCompanyQuery(lower) || isComparisonQuery(lower) || isBiographyQuery(lower)) {
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
  if (isGreetingQuery(lower) || isGeneralCompanyQuery(lower) || isComparisonQuery(lower) || isBiographyQuery(lower)) {
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

  if (isInquiryPreparationQuery(lastQuery)) {
    if (categoryKey === "ecommerce") {
      return [
        "Let's proceed with full E-Commerce (₹28,999)",
        "Start with WhatsApp Catalogue MVP (₹9,999)",
        "What product catalog details do you need?",
      ];
    }
    return [
      "Let's proceed with this scope",
      "What details do you need to start?",
      "How do milestone payments work?",
    ];
  }

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
  estimate.pages.list.forEach((page, idx) => {
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
 * Builds an authoritative, structured inquiry summary response.
 */
export function buildDeterministicInquiryResponse(
  categoryKey: string,
  estimate: ProjectEstimateResult | undefined,
  extractedParams: CalculatorInput,
): string {
  if (categoryKey === "ecommerce") {
    const fullScopePages = [
      "1. **Storefront Home** (`/`): Promotional hero banner, featured collections, trust badges, customer reviews.",
      "2. **Shop / Product Catalog** (`/shop`): Category filters (necklaces, rings, earrings, bracelets), price sorting, quick view.",
      "3. **Product Detail View** (`/product/[id]`): High-res zoom gallery, variant selector (metal/carat/size), stock status, Buy Now.",
      "4. **Shopping Cart & Checkout** (`/cart`): Slide-out cart drawer, discount coupon field, shipping calculator, Razorpay payment gateway (UPI, cards, netbanking).",
      "5. **Order Tracking & History** (`/orders`): Customer purchase timeline, courier tracking links, and downloadable PDF GST tax invoices.",
      "6. **Shipping & Return Policy** (`/policies`): Clear return windows, exchange procedures, and customer care channels.",
    ].join("\n");

    let msg = `### **Webgent Project Inquiry Summary: Jewellery E-Commerce Store**\n\n` +
      `- **Project Type**: E-Commerce & Online Store (Dynamic Next.js 14 Architecture)\n` +
      `- **Included Pages (6)**:\n${fullScopePages}\n` +
      `- **Key Features Included**:\n` +
      `  - Product Catalog & Slide-out Cart Drawer with variant selectors\n` +
      `  - Razorpay Payment Gateway Integration (UPI, Credit/Debit Cards, Netbanking)\n` +
      `  - Automated WhatsApp Alerts & Order Confirmations\n` +
      `  - Complete On-Page Google SEO Setup\n` +
      `  - Live Inventory Tracking & Low Stock Alerts\n` +
      `  - Automated PDF Invoice & GST Billing\n` +
      `- **Investment & Terms**:\n` +
      `  - **Total Development Fee**: ₹28,999 (Transparent milestone pricing: 50% advance / 50% upon launch review)\n` +
      `  - **Delivery SLA**: 2–3 Weeks\n` +
      `  - **Ownership & Support**: 100% source code ownership, zero hidden renewal fees, and 15 days free post-launch support.\n\n`;

    if (extractedParams.userBudgetINR && extractedParams.userBudgetINR < 28999) {
      msg += `### **Budget Alignment & Scope Options**\n` +
        `Your target budget is ₹${extractedParams.userBudgetINR.toLocaleString("en-IN")}. Here are your two clear implementation paths:\n\n` +
        `1. **Option A: Full Dynamic E-Commerce Store (Recommended)** — **₹28,999** (2–3 Weeks SLA)\n` +
        `   - Complete automated end-to-end purchasing, Razorpay checkout, live inventory, and order history.\n\n` +
        `2. **Option B: Reduced Starter Catalogue MVP** — **₹9,999** (5–7 Business Days SLA)\n` +
        `   - High-speed Static Next.js architecture with direct WhatsApp ordering and UPI QR code payments.\n` +
        `   - **Explicitly Deferred to Phase 2**: Automated shopping cart & checkout flow, online Razorpay gateway integration, and customer order management/history are excluded from Phase 1.\n\n`;
    }

    msg += `**Next Steps to Kick Off:**\n` +
      `1. Share your jewellery product catalog, high-res photos, and brand logo.\n` +
      `2. We will finalize the project milestone agreement (50% upfront advance to begin engineering sprint, 50% upon final staging review).\n` +
      `3. Delivery of interactive staging link within the applicable SLA.\n\n` +
      `Would you like to proceed with the full ₹28,999 dynamic store, or begin with the ₹9,999 WhatsApp catalogue MVP?`;

    return msg;
  }

  // General fallback
  const pagesList = estimate?.pages?.list && estimate.pages.list.length > 0
    ? estimate.pages.list.map((p, idx) => `${idx + 1}. **${p.name}** (\`${p.slug}\`): ${p.purpose}`).join("\n")
    : "1. Home (`/`)\n2. About (`/about`)\n3. Services (`/services`)\n4. Portfolio (`/work`)\n5. Contact (`/contact`)";

  const totalFee = estimate?.cost?.oneTimeTotalINR || 9999;
  const timeline = estimate?.estimatedTimeline || "5–7 Business Days";

  return `### **Webgent Project Inquiry Summary: ${estimate?.categoryDisplayName || "Custom Website"}**\n\n` +
    `- **Architecture**: ${estimate?.architecture === "dynamic" ? "Dynamic Next.js 14" : "Static Next.js 14"}\n` +
    `- **Included Pages (${estimate?.pages?.count || 5})**:\n${pagesList}\n` +
    `- **Total Development Fee**: ₹${totalFee.toLocaleString("en-IN")} (Milestone: 50% advance / 50% upon launch review)\n` +
    `- **Delivery SLA**: ${timeline}\n` +
    `- **Ownership & Terms**: 100% source code ownership, zero hidden fees, 15 days free post-launch support.\n\n` +
    `**Next Steps to Kick Off:**\n` +
    `1. Share your branding assets, logo, and core content.\n` +
    `2. We will finalize the project milestone agreement (50% advance to start).\n` +
    `3. Interactive staging link delivered within ${timeline}.\n\n` +
    `Do you have your brand assets and initial content ready?`;
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

  // 2. Classify intent: Greeting vs. General Company vs. Market Comparison vs. Biography vs. Proposal Acceptance vs. Inquiry Preparation vs. Feature Inquiry vs. Project Scoping
  const isGreeting = isGreetingQuery(lastUserMessage);
  const isGeneralCompany = isGeneralCompanyQuery(lastUserMessage);
  const isComparison = isComparisonQuery(lastUserMessage);
  const isBiography = isBiographyQuery(lastUserMessage);
  const isInquiry = isInquiryPreparationQuery(lastUserMessage);
  const isAcceptance = !isInquiry && isProposalAcceptance(lastUserMessage);
  const isFeatureQuery = isFeatureInquiry(lastUserMessage);
  const isScoping = isScopingOrBudgetQuery(lastUserMessage) && !isFeatureQuery && !isAcceptance && !isInquiry;
  const detectedCategoryInLatest = detectCategoryFromText(lastUserMessage);

  // 3. Extract and accumulate project parameters across conversation turns
  const extractedParams = extractConsultantParams(messages, priorProjectState);

  // Only quote if actively scoping/asking for a new project, not on greetings, company Q&A, biography, comparisons, acceptances, inquiries, or feature inquiries
  const shouldQuote =
    !isGreeting &&
    !isGeneralCompany &&
    !isComparison &&
    !isBiography &&
    !isAcceptance &&
    !isInquiry &&
    !isFeatureQuery &&
    (Boolean(detectedCategoryInLatest) || isScoping || (Boolean(priorProjectState?.isActivelyQuoting) && Boolean(extractedParams.userBudgetINR)));

  let estimate: ProjectEstimateResult | undefined = undefined;
  if ((shouldQuote || isInquiry || isAcceptance) && (extractedParams.categoryKey || isScoping)) {
    estimate = calculateProjectEstimate(extractedParams);
  }

  const categoryKey = estimate?.categoryKey || resolveCategoryKey(extractedParams.categoryKey);
  const followUpSuggestions = generateFollowUpSuggestions(categoryKey, estimate, lastUserMessage);
  const visitorLanguage = detectVisitorLanguage(lastUserMessage);

  const updatedProjectState: ProjectState = {
    categoryKey,
    pageCount: (extractedParams.pageCount ?? estimate?.pages.count) || priorProjectState?.pageCount || 5,
    userBudgetINR: extractedParams.userBudgetINR ?? priorProjectState?.userBudgetINR,
    deliverySpeed: extractedParams.deliverySpeed ?? priorProjectState?.deliverySpeed ?? "standard",
    selectedFeatureIds: extractedParams.selectedFeatureIds ?? priorProjectState?.selectedFeatureIds,
    architecture: estimate?.architecture ?? priorProjectState?.architecture ?? "static",
    isActivelyQuoting: shouldQuote || Boolean(priorProjectState?.isActivelyQuoting),
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

    if (isInquiry) {
      return {
        messageText: buildDeterministicInquiryResponse(categoryKey, estimate, extractedParams),
        followUpSuggestions,
        categoryKey,
        updatedProjectState,
      };
    }

    if (isAcceptance) {
      if (categoryKey === "ecommerce") {
        return {
          messageText:
            visitorLanguage === "hinglish"
              ? "Bohot badhiya! Jewellery E-Commerce Store ka ₹28,999 wala proposal final ho gaya hai. Isme complete Dynamic Next.js 14 architecture, 6 custom pages (Home, Shop, Product Detail, Cart, Orders, Policies), Razorpay/UPI gateway, automated WhatsApp alerts aur PDF invoicing included hai (2–3 weeks delivery SLA).\n\n**Next Steps:**\n1. Aap jewellery product catalog, photos aur brand logo share kar sakte hain.\n2. Milestone: 50% advance (₹14,499) par hum engineering sprint start karenge, aur baki 50% final staging review par.\n\nKya aapke paas brand logo aur initial product list ready hai?"
              : "Fantastic! Your Jewellery E-Commerce Store proposal is confirmed at ₹28,999. This covers full Dynamic Next.js 14 architecture, 6 custom pages (Home, Shop, Product Detail, Cart, Orders, Policies), Razorpay/UPI payment gateway, automated WhatsApp alerts, and PDF GST invoicing with a 2–3 weeks delivery SLA.\n\n**Next Steps:**\n1. Share your jewellery product catalog, photos, and brand logo.\n2. Milestone: 50% advance (₹14,499) to begin the engineering sprint, with the remaining 50% upon final staging review.\n\nDo you have your brand logo and product list ready?",
          followUpSuggestions: [
            "What photos or details do you need?",
            "How do milestone payments work?",
            "When will the staging link be delivered?",
          ],
          categoryKey,
          updatedProjectState,
        };
      }

      return {
        messageText:
          visitorLanguage === "hinglish"
            ? "Bohot badhiya! Gym Starter Website ka ₹11,999 wala proposal final ho gaya hai. Isme 5 custom pages, WhatsApp quick chat, schedule table, inquiry form aur complete Google SEO setup included hai (5–7 business days delivery SLA).\n\n**Next Steps:**\n1. Aap gym ka logo, basic program list aur facility photos share kar sakte hain.\n2. Milestone: 50% advance (₹5,999) par hum engineering sprint start karenge, aur baki 50% final staging review par.\n\nKya aapke paas logo aur photos ready hain?"
            : "Fantastic! Your Gym Starter Website proposal is confirmed at ₹11,999. This covers 5 custom pages, WhatsApp quick chat, class schedule, inquiry form, and Google SEO setup with a 5–7 business days delivery SLA.\n\n**Next Steps:**\n1. Share your gym logo, photos, and class schedule.\n2. 50% milestone advance (₹5,999) to begin the engineering sprint, with the remaining 50% upon final staging review.\n\nDo you have your gym logo and photos ready?",
        followUpSuggestions: [
          "What photos or details do you need?",
          "Can online booking be added later?",
          "How do milestone payments work?",
        ],
        categoryKey,
        updatedProjectState,
      };
    }

    if (isFeatureQuery) {
      const isDepositQuery = /\b(deposit|advance|payment|pay)\b/i.test(lastUserMessage);
      const upgrade = calculatePhase2Upgrade({
        currentTotalINR: 11999,
        includeDeposits: isDepositQuery,
      });
      const upgradeCostStr = `+₹${upgrade.upgradeCostINR.toLocaleString("en-IN")}`;
      const totalCostStr = `₹${upgrade.newProjectTotalINR.toLocaleString("en-IN")}`;

      return {
        messageText:
          visitorLanguage === "hinglish"
            ? isDepositQuery
              ? `Haan bilkul! Phase 1 mein aapka Gym Starter Website (₹11,999, 5–7 business days) launch hoga jo aapke ₹15,000 ke budget mein aaram se fit hota hai.\n\nAdvance deposits accept karne ke liye ek interactive booking flow aur payment gateway chahiye hota hai, jise hum Phase 2 mein seamlessly add kar sakte hain:\n* **Dynamic Backend & Database**: +₹8,000 (member records aur slot availability manage karne ke liye)\n* **Interactive Booking Calendar**: +₹4,000 (date & slot selector)\n* **Razorpay/UPI Payment Gateway**: +₹4,500 (direct advance fees lene ke liye)\n* **Total Phase 2 Upgrade**: ${upgradeCostStr} (Project total: ${totalCostStr}, 2–3 weeks)\n\nBest strategy ye hai ki pehle Phase 1 launch karein aur members aane ke baad Phase 2 advance deposits activate karein. Kya aap Phase 1 se start karna chahenge?`
              : `Haan bilkul! Online booking ko hum Phase 2 mein seamlessly add kar sakte hain. Aapka Phase 1 Gym Starter Website (₹11,999, 5–7 business days) aapke ₹15,000 ke budget mein aaram se fit rehta hai.\n\nPhase 2 mein online booking add karne ke liye:\n* **Dynamic Backend & Database**: +₹8,000\n* **Interactive Booking Calendar**: +₹4,000\n* **Total Phase 2 Upgrade**: ${upgradeCostStr} (Project total: ${totalCostStr}, 2–3 weeks)\n\nIsse aap Phase 1 mein bina delay ke live ja sakte hain aur baad mein booking feature add kar sakte hain!`
            : isDepositQuery
              ? `Yes, absolutely! Your Phase 1 Gym Starter Website (₹11,999, 5–7 business days) remains unchanged and fits comfortably within your ₹15,000 budget.\n\nAccepting advance deposits requires a dynamic booking flow and payment integration, which can be added in Phase 2:\n* **Dynamic Backend & Database**: +₹8,000 (to manage member records and slot tracking)\n* **Interactive Booking Calendar**: +₹4,000 (date and session slot selector)\n* **Razorpay/UPI Payment Gateway**: +₹4,500 (for direct advance fee collection)\n* **Total Phase 2 Upgrade**: ${upgradeCostStr} (Total project with deposits: ${totalCostStr}, 2–3 weeks)\n\nThe recommended strategy is to launch Phase 1 first to capture local gym traffic immediately, then activate Phase 2 advance deposits as your member base expands.`
              : `Yes, definitely! Online booking can be seamlessly integrated in Phase 2. Your Phase 1 Gym Starter Website (₹11,999, 5–7 business days) remains completely unchanged within your ₹15,000 budget.\n\nAdding online booking in Phase 2 involves:\n* **Dynamic Backend & Database**: +₹8,000\n* **Interactive Booking Calendar**: +₹4,000\n* **Total Phase 2 Upgrade**: ${upgradeCostStr} (Project total: ${totalCostStr}, 2–3 weeks)\n\nThis allows you to go live quickly with Phase 1 and upgrade to automated scheduling whenever you are ready!`,
        followUpSuggestions: [
          "Let's finalize Phase 1 at ₹11,999",
          "What details do you need for Phase 1?",
          "How do milestone payments work?",
        ],
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

    if (isBiography) {
      return {
        messageText:
          visitorLanguage === "hinglish"
            ? "Webgent ke founder Mohit Verma hain. Unhone AKTU (Dr. A.P.J. Abdul Kalam Technical University) se MCA (Master of Computer Applications, 2022–2024) aur CCSU se B.Sc Computer Science (2019–2022) kiya hai. Currently wo DBA Lounge mein Software Developer hain aur Webgent ke zariye high-performance web applications engineer karte hain. Kya aap apne web project ke requirements discuss karna chahte hain?"
            : "Webgent was founded by Mohit Verma. He holds a Master of Computer Applications (MCA, 2022–2024) from Dr. A.P.J. Abdul Kalam Technical University (AKTU) and a B.Sc in Computer Science (2019–2022) from CCSU. He currently works as a Software Developer at DBA Lounge, engineering high-performance Next.js and full-stack web platforms. How can we assist with your web project?",
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
  } else if (isBiography) {
    contextualSystemPrompt += `\n\n### CONTEXT NOTE:
The visitor is asking about founder Mohit Verma's education, experience, skills, or background ("${lastUserMessage}").
- State directly that Mohit Verma is the founder and lead software developer of Webgent.
- Cite his verified education: MCA (2022–2024) from AKTU (Dr. A.P.J. Abdul Kalam Technical University) / HIMT College and B.Sc in Computer Science (2019–2022) from CCSU / IIMT College.
- Cite his verified role: Software Developer at DBA Lounge (Gurugram).
- Cite verified live projects: Bird Outsourcing (birdoutsourcing.com, Live), Institutional Management Platform (studies.mentorworld.in), Edayaa Jewellery Store (edayaajewellery.com).
- Answer the exact question first. Do not reply with Webgent service descriptions or pricing.
- If a fact is missing from the verified profile, say honestly that it is not on record rather than inventing credentials.
- Do NOT pretend that you (the AI assistant) attended college or worked at a job as a human. Clearly distinguish yourself as the AI consultant.
- Answer in ${visitorLanguage === "hinglish" ? "clean, natural Hinglish" : "clear English"}.
- DO NOT attach a project estimate card. Keep it concise (1–2 paragraphs).`;
  } else if (isInquiry) {
    if (categoryKey === "ecommerce") {
      contextualSystemPrompt += `\n\n### CONTEXT NOTE: PREPARE PROJECT INQUIRY SUMMARY (JEWELLERY E-COMMERCE STORE)
The visitor requested to prepare a project inquiry for the jewellery e-commerce store ("${lastUserMessage}").
Ground Truth Specifications from Authoritative Webgent Calculator:
- Project Category: E-Commerce & Online Store (Dynamic Next.js 14 Architecture)
- Total Development Fee: ₹28,999 (Milestone: 50% advance / 50% upon final staging review)
- Delivery Timeline SLA: 2–3 Weeks
- Included Pages (ALL 6 PAGES MUST BE EXPLICITLY LISTED with their exact paths and purpose):
  1. Storefront Home (\`/\`): High-impact promotional hero, featured jewellery collections, trust badges, customer reviews.
  2. Shop / Product Catalog (\`/shop\`): Category filters (necklaces, rings, earrings, bracelets), price sorting, quick view.
  3. Product Detail View (\`/product/[id]\`): Zoomable high-res photo gallery, variant selectors (metal, carat, size), stock status, direct add-to-cart.
  4. Shopping Cart & Checkout (\`/cart\`): Slide-out cart drawer, coupon discounts, shipping calculator, Razorpay payment gateway (UPI, cards, netbanking).
  5. Order Tracking & History (\`/orders\`): Past customer orders, courier tracking links, and downloadable PDF GST tax invoices.
  6. Shipping & Return Policy (\`/policies\`): Return windows, exchange procedures, secure shipping assurance, and customer support.
- Key Dynamic Features:
  * Product Catalog & Slide-out Cart Drawer with variant selectors
  * Razorpay Payment Gateway integration (UPI, Credit/Debit Cards, Netbanking)
  * Automated WhatsApp alerts & order confirmation notifications
  * Live inventory tracking & low stock alerts
  * Automated PDF GST invoicing
  * Complete On-Page Google SEO Setup
- Terms: 100% source code ownership, zero hidden recurring fees, and 15 days free post-launch support.

BUDGET CONTEXT & REDUCED STARTER MVP ALTERNATIVE:
${
  extractedParams.userBudgetINR && extractedParams.userBudgetINR < 28999
    ? `- The visitor previously targeted a budget of ₹${extractedParams.userBudgetINR.toLocaleString("en-IN")}.
- Clearly distinguish the full ₹28,999 e-commerce scope from our reduced Starter Catalogue MVP at ₹9,999:
  * Option A: Full Dynamic E-Commerce Store at ₹28,999 (2–3 Weeks SLA, dynamic backend, Razorpay, cart/checkout, order tracking).
  * Option B: Reduced Starter Catalogue MVP at ₹9,999 (5–7 Business Days SLA, static Next.js showcase, direct WhatsApp ordering and UPI QR).
  * For Option B, EXPLICITLY list deferred features: automated cart & checkout, online payment gateway (Razorpay) integration, customer accounts & order management, and automated PDF GST invoicing are excluded and deferred to Phase 2.
- CRITICAL RULES ON SAVINGS:
  * NEVER claim or suggest an ₹8,000 saving by switching to static architecture without explicitly explaining that automated cart, checkout, order history, and Razorpay integration are removed!
  * NEVER claim ₹1,000 savings by consolidating to 5 pages (e-commerce standard blueprint requires all 6 pages).
  * Never claim any saving unless supported by the authoritative calculator.`
    : ""
}

INSTRUCTIONS FOR THE RESPONSE:
1. Provide a comprehensive, professional Project Inquiry Summary for the Jewellery E-Commerce Store.
2. List all 6 included pages with their exact paths and purposes.
3. State the exact timeline: 2–3 Weeks.
4. Keep the jewellery project context strictly intact. Do NOT bring back gym requirements or fitness terms.
5. Conclude with a clear, actionable next step (e.g. asking for brand logo, jewellery product photos, or collection list).
6. STRICT PROHIBITION: DO NOT repeat or ask "Prepare Project Inquiry with this Scope" anywhere in your response text or follow-up question.
7. DO NOT attach an estimate card.`;
    } else {
      contextualSystemPrompt += `\n\n### CONTEXT NOTE: PREPARE PROJECT INQUIRY SUMMARY
The visitor requested to prepare a project inquiry for their project ("${lastUserMessage}").
Category: ${estimate?.categoryDisplayName || categoryKey}
Development Fee: ₹${estimate?.cost?.oneTimeTotalINR?.toLocaleString("en-IN") || "9,999"}
Delivery SLA: ${estimate?.estimatedTimeline || "5–7 Business Days"}
Included Pages (${estimate?.pages?.count || 5}):
${estimate?.pages?.list?.map((p) => `  * ${p.name} (\`${p.slug}\`): ${p.purpose}`).join("\n") || ""}
Conclude with clear next steps. DO NOT repeat "Prepare Project Inquiry with this Scope".
DO NOT attach an estimate card.`;
    }
  } else if (isAcceptance) {
    if (categoryKey === "ecommerce") {
      contextualSystemPrompt += `\n\n### CONTEXT NOTE:
The visitor is accepting the proposed project quote / proposal ("${lastUserMessage}").
Active Project: Jewellery E-Commerce Store at ₹28,999 (2–3 Weeks, 6 Pages, Dynamic Next.js 14 Architecture with Razorpay & WhatsApp alerts).
- Acknowledge and confirm the proposal enthusiastically in ${visitorLanguage === "hinglish" ? "natural Hinglish" : "natural English"}.
- Confirm agreed scope:
  * Package: Jewellery E-Commerce Store (Home, Shop, Product Detail, Cart, Orders, Policies)
  * Investment: ₹28,999 (Milestone: 50% upfront advance, 50% upon final staging review)
  * Delivery: 2–3 Weeks
  * Included: Full Dynamic Next.js 14 backend, Razorpay payment gateway, automated WhatsApp alerts, automated PDF GST invoices, live inventory tracking, on-page Google SEO, 100% code ownership.
- Outline clear next steps:
  1. Share jewellery product list, photos, and brand logo.
  2. Complete milestone advance (₹14,499) to begin engineering sprint.
  3. Interactive staging link delivered within 2–3 weeks.
- End with one brief question asking if they have their brand logo and initial product list ready.
- DO NOT attach an estimate card. Keep proposal firmly locked.`;
    } else {
      contextualSystemPrompt += `\n\n### CONTEXT NOTE:
The visitor is accepting the proposed project quote / proposal ("${lastUserMessage}").
Active Project: Gym Starter Website (Phase 1) at ₹11,999 (5–7 Business Days, 5 Pages, Static Architecture, fits comfortably in ₹15,000 budget with ₹3,001 surplus).
- Acknowledge and confirm the proposal enthusiastically in ${visitorLanguage === "hinglish" ? "natural Hinglish" : "natural English"}.
- Confirm the agreed Phase 1 scope:
  * Package: Gym Starter Website (Home, About & Facilities, Programs, Class Schedule, Contact & Google Map)
  * Investment: ₹11,999 (Milestone: 50% upfront to start, 50% upon final staging review)
  * Delivery: 5–7 Business Days
  * Included: WhatsApp quick chat, lead inquiry form, client reviews, on-page Google SEO, 100% source code ownership.
- Outline clear next steps to get started:
  1. Share gym logo, facility photos, and membership details.
  2. Complete milestone payment (₹5,999) to begin development sprint.
  3. Staging link delivery within 5–7 business days for feedback.
- End with one brief question asking if they have their logo and photos ready.
- DO NOT attach an estimate card. Keep Phase 1 firmly locked.`;
    }
  } else if (isFeatureQuery) {
    const isDepositQuery = /\b(deposit|advance|payment|pay)\b/i.test(lastUserMessage);
    contextualSystemPrompt += `\n\n### CONTEXT NOTE:
The visitor is asking whether online booking and/or advance deposits can be added later/deferred to Phase 2 ("${lastUserMessage}").
Active Project: Gym Starter Website (Phase 1) at ₹11,999 (5–7 Business Days, Static Architecture, fits in ₹15,000 budget).

CRITICAL CONVERSATIONAL & SCOPING RULES:
1. Answer the exact question first directly and positively in ${visitorLanguage === "hinglish" ? "natural Hinglish" : "natural English"}.
2. Confirm that Phase 1 remains completely UNCHANGED at ₹11,999 and will launch on schedule in 5–7 business days.
3. Explain Phase 2 upgrade requirements honestly:
   ${
     isDepositQuery
       ? `- To accept advance deposits online, the website requires a Dynamic Backend with database (₹8,000) to securely track slot bookings and transaction statuses, an interactive Booking Calendar (₹4,000), and Razorpay/UPI Payment Gateway integration (₹4,500).
   - Exact Authoritative Configured Upgrade Pricing:
     * Phase 1: Gym Starter Website = ₹11,999 (5–7 business days, within ₹15,000 budget).
     * Phase 2 Upgrade (Booking + Advance Deposits): +₹16,500 (Project total: ₹28,499, 2–3 weeks).
     * (Or Phase 2 with booking calendar only without payment gateway: +₹12,000).`
       : `- Yes, online booking can be seamlessly integrated in Phase 2!
   - It requires upgrading from Static to a Dynamic Backend with database (₹8,000) and an interactive Booking Calendar (₹4,000).
   - Exact Authoritative Configured Upgrade Pricing:
     * Phase 1: Gym Starter Website = ₹11,999 (5–7 business days, within ₹15,000 budget).
     * Phase 2 Upgrade (Interactive Booking Calendar): +₹12,000 (Project total: ₹23,999, 2–3 weeks).`
   }
4. Provide the practical strategic recommendation:
   - Launch Phase 1 first at ₹11,999 to start capturing gym members and trial passes via WhatsApp and lead forms immediately.
   - Upgrade to Phase 2 online booking/deposits once membership volume grows and requires automated scheduling.
5. DO NOT switch the project category to a full booking platform.
6. DO NOT attach an unrelated ₹26,999 booking platform estimate card. Keep Phase 1 firmly locked.
7. Do not claim payment gateways or advance deposits are currently active in Phase 1.`;
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

  if (isInquiry) {
    return {
      messageText: buildDeterministicInquiryResponse(categoryKey, estimate, extractedParams),
      followUpSuggestions,
      categoryKey,
      updatedProjectState,
    };
  }

  if (isAcceptance) {
    if (categoryKey === "ecommerce") {
      return {
        messageText:
          visitorLanguage === "hinglish"
            ? "Bohot badhiya! Jewellery E-Commerce Store ka ₹28,999 wala proposal final ho gaya hai. Isme complete Dynamic Next.js 14 architecture, 6 custom pages (Home, Shop, Product Detail, Cart, Orders, Policies), Razorpay/UPI gateway, automated WhatsApp alerts aur PDF invoicing included hai (2–3 weeks delivery SLA).\n\n**Next Steps:**\n1. Aap jewellery product catalog, photos aur brand logo share kar sakte hain.\n2. Milestone: 50% advance (₹14,499) par hum engineering sprint start karenge, aur baki 50% final staging review par.\n\nKya aapke paas brand logo aur initial product list ready hai?"
            : "Fantastic! Your Jewellery E-Commerce Store proposal is confirmed at ₹28,999. This covers full Dynamic Next.js 14 architecture, 6 custom pages (Home, Shop, Product Detail, Cart, Orders, Policies), Razorpay/UPI payment gateway, automated WhatsApp alerts, and PDF GST invoicing with a 2–3 weeks delivery SLA.\n\n**Next Steps:**\n1. Share your jewellery product catalog, photos, and brand logo.\n2. Milestone: 50% advance (₹14,499) to begin the engineering sprint, with the remaining 50% upon final staging review.\n\nDo you have your brand logo and product list ready?",
        followUpSuggestions: [
          "What photos or details do you need?",
          "How do milestone payments work?",
          "When will the staging link be delivered?",
        ],
        categoryKey,
        updatedProjectState,
      };
    }

    return {
      messageText:
        visitorLanguage === "hinglish"
          ? "Bohot badhiya! Gym Starter Website ka ₹11,999 wala proposal final ho gaya hai. Isme 5 custom pages, WhatsApp quick chat, schedule table, inquiry form aur complete Google SEO setup included hai (5–7 business days delivery SLA).\n\n**Next Steps:**\n1. Aap gym ka logo, basic program list aur facility photos share kar sakte hain.\n2. Milestone: 50% advance (₹5,999) par hum engineering sprint start karenge, aur baki 50% final staging review par.\n\nKya aapke paas logo aur photos ready hain?"
          : "Fantastic! Your Gym Starter Website proposal is confirmed at ₹11,999. This covers 5 custom pages, WhatsApp quick chat, class schedule, inquiry form, and Google SEO setup with a 5–7 business days delivery SLA.\n\n**Next Steps:**\n1. Share your gym logo, photos, and class schedule.\n2. 50% milestone advance (₹5,999) to begin the engineering sprint, with the remaining 50% upon final staging review.\n\nDo you have your gym logo and photos ready?",
      followUpSuggestions: [
        "What photos or details do you need?",
        "Can online booking be added later?",
        "How do milestone payments work?",
      ],
      categoryKey,
      updatedProjectState,
    };
  }

  if (isFeatureQuery) {
    const isDepositQuery = /\b(deposit|advance|payment|pay)\b/i.test(lastUserMessage);
    const upgrade = calculatePhase2Upgrade({
      currentTotalINR: 11999,
      includeDeposits: isDepositQuery,
    });
    const upgradeCostStr = `+₹${upgrade.upgradeCostINR.toLocaleString("en-IN")}`;
    const totalCostStr = `₹${upgrade.newProjectTotalINR.toLocaleString("en-IN")}`;

    return {
      messageText:
        visitorLanguage === "hinglish"
          ? isDepositQuery
            ? `Haan bilkul! Phase 1 mein aapka Gym Starter Website (₹11,999, 5–7 business days) launch hoga jo aapke ₹15,000 ke budget mein aaram se fit hota hai.\n\nAdvance deposits accept karne ke liye ek interactive booking flow aur payment gateway chahiye hota hai, jise hum Phase 2 mein seamlessly add kar sakte hain:\n* **Dynamic Backend & Database**: +₹8,000 (member records aur slot availability manage karne ke liye)\n* **Interactive Booking Calendar**: +₹4,000 (date & slot selector)\n* **Razorpay/UPI Payment Gateway**: +₹4,500 (direct advance fees lene ke liye)\n* **Total Phase 2 Upgrade**: ${upgradeCostStr} (Project total: ${totalCostStr}, 2–3 weeks)\n\nBest strategy ye hai ki pehle Phase 1 launch karein aur members aane ke baad Phase 2 advance deposits activate karein. Kya aap Phase 1 se start karna chahenge?`
            : `Haan bilkul! Online booking ko hum Phase 2 mein seamlessly add kar sakte hain. Aapka Phase 1 Gym Starter Website (₹11,999, 5–7 business days) aapke ₹15,000 ke budget mein aaram se fit rehta hai.\n\nPhase 2 mein online booking add karne ke liye:\n* **Dynamic Backend & Database**: +₹8,000\n* **Interactive Booking Calendar**: +₹4,000\n* **Total Phase 2 Upgrade**: ${upgradeCostStr} (Project total: ${totalCostStr}, 2–3 weeks)\n\nIsse aap Phase 1 mein bina delay ke live ja sakte hain aur baad mein booking feature add kar sakte hain!`
          : isDepositQuery
            ? `Yes, absolutely! Your Phase 1 Gym Starter Website (₹11,999, 5–7 business days) remains unchanged and fits comfortably within your ₹15,000 budget.\n\nAccepting advance deposits requires a dynamic booking flow and payment integration, which can be added in Phase 2:\n* **Dynamic Backend & Database**: +₹8,000 (to manage member records and slot tracking)\n* **Interactive Booking Calendar**: +₹4,000 (date and session slot selector)\n* **Razorpay/UPI Payment Gateway**: +₹4,500 (for direct advance fee collection)\n* **Total Phase 2 Upgrade**: ${upgradeCostStr} (Total project with deposits: ${totalCostStr}, 2–3 weeks)\n\nThe recommended strategy is to launch Phase 1 first to capture local gym traffic immediately, then activate Phase 2 advance deposits as your member base expands.`
            : `Yes, definitely! Online booking can be seamlessly integrated in Phase 2. Your Phase 1 Gym Starter Website (₹11,999, 5–7 business days) remains completely unchanged within your ₹15,000 budget.\n\nAdding online booking in Phase 2 involves:\n* **Dynamic Backend & Database**: +₹8,000\n* **Interactive Booking Calendar**: +₹4,000\n* **Total Phase 2 Upgrade**: ${upgradeCostStr} (Project total: ${totalCostStr}, 2–3 weeks)\n\nThis allows you to go live quickly with Phase 1 and upgrade to automated scheduling whenever you are ready!`,
      followUpSuggestions: [
        "Let's finalize Phase 1 at ₹11,999",
        "What details do you need for Phase 1?",
        "How do milestone payments work?",
      ],
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

  if (isBiography) {
    return {
      messageText:
        visitorLanguage === "hinglish"
          ? "Webgent ke founder Mohit Verma hain. Unhone AKTU (Dr. A.P.J. Abdul Kalam Technical University) se MCA (Master of Computer Applications, 2022–2024) aur CCSU se B.Sc Computer Science (2019–2022) kiya hai. Currently wo DBA Lounge mein Software Developer hain aur Webgent ke zariye production web applications deliver karte hain. Kya aap apne web project ke baare mein kuch discuss karna chahte hain?"
          : "Webgent was founded by Mohit Verma. He holds a Master of Computer Applications (MCA, 2022–2024) from AKTU and a B.Sc in Computer Science (2019–2022) from CCSU. He currently works as a Software Developer at DBA Lounge, engineering high-performance Next.js and full-stack web platforms. How can we assist with your web project?",
      followUpSuggestions: [
        "What services does Webgent offer?",
        "Can you show Mohit's verified projects?",
        "How do we start a website project?",
      ],
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

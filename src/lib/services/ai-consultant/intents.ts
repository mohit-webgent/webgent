/** Pure classifiers that work out what a visitor's message is asking for. */

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
    /\b(final\s+karo|final\s+karte|let's\s+go\s+with|let's\s+proceed|i\s+accept|accept\s+(?:this|the|your)\s+(?:quote|proposal|estimate|scope)|i\s+agree|agreed|proceed\s+with|proposal\s+final|\d[\d,]*\s+wala|starter\s+final|deal\s+done)\b/i.test(lower)
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

  // Budget mentions. Word boundaries matter: without them "rs" matches "hours" and "under" matches "understand".
  if (
    /\bbudget\b|₹\s*\d|\b(?:rs\.?|inr)\s*\d|\d\s*(?:rs|inr)\b|\b\d+\s?k\b|\b(?:under|around|below|max|within)\s+(?:rs\.?\s*|inr\s*)?\d/i.test(
      lower,
    )
  ) {
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

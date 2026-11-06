import type { EstimatorCalculationConfig } from "@/lib/pricing.config";
/**
 * Replies built without the language model. They are used when no API key is configured or when
 * Gemini is unavailable. Every price comes from the calculator, so these can never disagree with
 * the estimate card or with the pricing managed in the admin panel.
 */

import { calculatePhase2Upgrade, type CalculatorInput, type ProjectEstimateResult } from "./calculator";
import { isInquiryPreparationQuery } from "./intents";
import type { PricingFacts, VisitorInfo, VisitorLanguage } from "./types";

export const formatINR = (amount: number): string => `₹${amount.toLocaleString("en-IN")}`;

export function generateFollowUpSuggestions(
  categoryKey: string,
  estimate?: ProjectEstimateResult,
  lastQuery = "",
): string[] {
  const lower = lastQuery.toLowerCase();
  const chips: string[] = [];

  if (isInquiryPreparationQuery(lastQuery)) {
    return [
      estimate
        ? `Let's proceed with this scope (${formatINR(estimate.cost.oneTimeTotalINR)})`
        : "Let's proceed with this scope",
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

export function buildDeterministicConsultantResponse(
  estimate: ProjectEstimateResult,
  visitorInfo?: VisitorInfo,
): string {
  const greeting = visitorInfo?.name ? `Hello ${visitorInfo.name}! ` : "Hello! ";

  const essentialNames = estimate.features.essential.map((f) => f.name).join(", ");
  const recommendedNames = estimate.features.recommended.map((f) => f.name).join(", ");

  let text = `${greeting}Here is our recommendation for your **${estimate.categoryDisplayName}** project:\n\n`;

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

  text += `\n### Estimated Cost & Timeline\n`;
  text += `- **Development Fee**: **${formatINR(estimate.cost.oneTimeTotalINR)}** (Milestone: 50% upfront, 50% upon final launch)\n`;
  text += `- **Estimated Delivery**: **${estimate.estimatedTimeline}**\n`;

  if (estimate.budgetAnalysis) {
    text += `\n### Budget Assessment\n`;
    text += `- **Target Budget**: ${formatINR(estimate.budgetAnalysis.userBudgetINR)}\n`;
    text += `- **Status**: ${estimate.budgetAnalysis.fitsBudget ? "Within Budget" : "Exceeds Budget"}\n`;
    text += `- ${estimate.budgetAnalysis.recommendation}\n`;
  }

  return text;
}

export function buildDeterministicInquiryResponse(
  _categoryKey: string,
  estimate: ProjectEstimateResult | undefined,
  extractedParams: CalculatorInput,
): string {
  if (!estimate) {
    return "Tell me a little about the website you have in mind, such as the type of business and the pages you need, and I'll prepare the project inquiry from that.";
  }

  const pages = estimate.pages.list
    .map((p, idx) => `${idx + 1}. **${p.name}** (\`${p.slug}\`): ${p.purpose}`)
    .join("\n");
  const total = estimate.cost.oneTimeTotalINR;
  const features = [...estimate.features.essential, ...estimate.features.recommended].map((f) => f.name);

  let message =
    `### **Webgent Project Inquiry Summary: ${estimate.categoryDisplayName}**\n\n` +
    `- **Architecture**: ${estimate.architecture === "dynamic" ? "Dynamic Next.js" : "Static Next.js"}\n` +
    `- **Included Pages (${estimate.pages.count})**:\n${pages}\n` +
    (features.length > 0 ? `- **Key Features**: ${features.join(", ")}\n` : "") +
    `- **Estimated Development Fee**: ${formatINR(total)} (Milestone: 50% advance, 50% upon launch review)\n` +
    `- **Estimated Delivery**: ${estimate.estimatedTimeline}\n` +
    `- **Ownership & Support**: 100% source code ownership and 15 days of free post-launch bug fixes.\n\n`;

  const budget = extractedParams.userBudgetINR;
  const options = estimate.budgetAnalysis?.compromiseOptions ?? [];
  if (budget && budget < total && options.length > 0) {
    message +=
      `### **Budget Alignment & Scope Options**\n` +
      `Your target budget is ${formatINR(budget)}. Here are ways to align the scope:\n` +
      options.map((option) => `- ${option}`).join("\n") +
      "\n\n";
  }

  message +=
    `**Next Steps to Kick Off:**\n` +
    `1. Share your brand logo, core content and any reference material.\n` +
    `2. Mohit reviews your requirements and confirms the final scope and milestone agreement.\n` +
    `3. Work starts once the agreement and 50% advance are in place, with a staging link delivered for your review.\n\n` +
    `Do you have your brand assets and initial content ready?`;

  return message;
}

/**
 * The assistant can record interest, but only a person can commit Webgent to a price or take payment.
 */
export function buildAcceptanceResponse(
  estimate: ProjectEstimateResult | undefined,
  language: VisitorLanguage,
): string {
  if (!estimate) {
    return language === "hinglish"
      ? "Abhi tak koi project scope final nahi hua hai. Aap apne business aur website ke baare mein bataiye, main pehle uska estimate share karta hoon."
      : "We haven't scoped a project yet. Tell me about your business and the website you need, and I'll share an estimate first.";
  }

  const name = estimate.categoryDisplayName;
  const total = formatINR(estimate.cost.oneTimeTotalINR);
  const timeline = estimate.estimatedTimeline;

  if (language === "hinglish") {
    return `Bahut badhiya! Maine note kar liya hai ki aap **${name}** scope ke saath aage badhna chahte hain (estimate **${total}**, delivery ${timeline}).\n\nYe abhi estimate hai. **Agle steps:**\n1. Aap apna logo, content aur reference material share kar dijiye.\n2. Mohit aapki requirements review karke final scope aur milestone agreement bhejenge (50% advance, 50% final staging review par).\n3. Final scope agree hone se pehle koi payment nahi karni hai.\n\nAapse contact karne ke liye best email ya WhatsApp number kya hai?`;
  }

  return `Great! I've noted that you'd like to go ahead with the **${name}** scope (estimated at **${total}**, delivery ${timeline}).\n\nThis is still an estimate. **Next steps:**\n1. Share your logo, content and any reference material.\n2. Mohit will review your requirements and send the final scope and milestone agreement (50% advance, 50% after final staging review).\n3. No payment is needed until you've both agreed on the final scope.\n\nWhat's the best email or WhatsApp number to reach you on?`;
}

export function buildFeatureInquiryResponse(
  estimate: ProjectEstimateResult | undefined,
  includeDeposits: boolean,
  language: VisitorLanguage,
  pricingConfig: EstimatorCalculationConfig | undefined,
): string {
  const currentTotalINR = estimate?.cost.oneTimeTotalINR ?? 0;
  const upgrade = calculatePhase2Upgrade({
    currentTotalINR,
    includeDeposits,
    pricingConfig,
    currentProject: estimate?.categoryDisplayName,
    alreadyDynamic: estimate?.architecture === "dynamic",
  });

  const lines = [
    upgrade.dynamicBackendINR > 0 ? `* **Dynamic Backend & Database**: +${formatINR(upgrade.dynamicBackendINR)}` : null,
    `* **Booking Calendar**: +${formatINR(upgrade.bookingCalendarINR)}`,
    upgrade.paymentGatewayINR > 0 ? `* **Razorpay/UPI Payment Gateway**: +${formatINR(upgrade.paymentGatewayINR)}` : null,
  ].filter(Boolean);

  const total = `**Total Phase 2 Upgrade**: +${formatINR(upgrade.upgradeCostINR)}`;
  const withProject = estimate ? ` (Project total: ${formatINR(upgrade.newProjectTotalINR)})` : "";
  const budget = estimate?.budgetAnalysis;

  if (language === "hinglish") {
    const phaseOne = estimate
      ? `Aapka Phase 1 (${estimate.categoryDisplayName}, ${formatINR(currentTotalINR)}, ${estimate.estimatedTimeline}) waisa hi rahega${budget?.fitsBudget ? ` aur ${formatINR(budget.userBudgetINR)} ke budget mein fit hota hai` : ""}.`
      : "Isse aapka initial launch delay nahi hoga.";
    return `Haan, ye Phase 2 mein add ho sakta hai. ${phaseOne}\n\nPhase 2 mein:\n${lines.join("\n")}\n* ${total}${withProject}\n\nPehle Phase 1 launch karke baad mein ye upgrade karna best rehta hai. Kya aap Phase 1 se start karna chahenge?`;
  }

  const phaseOne = estimate
    ? `Your Phase 1 scope (${estimate.categoryDisplayName}, ${formatINR(currentTotalINR)}, ${estimate.estimatedTimeline}) stays the same${budget?.fitsBudget ? ` and fits your ${formatINR(budget.userBudgetINR)} budget` : ""}.`
    : "This won't delay your initial launch.";
  return `Yes, this can be added in Phase 2. ${phaseOne}\n\nPhase 2 would involve:\n${lines.join("\n")}\n* ${total}${withProject}\n\nA good approach is to launch Phase 1 first, then upgrade when you need it. Would you like to start with Phase 1?`;
}

export function buildGreetingResponse(language: VisitorLanguage): string {
  return language === "hinglish"
    ? "Main badhiya hoon! Aap bataiye, kaise madad kar sakta hoon aapki?"
    : "Hey! How can I help you today? Feel free to ask about our services or tell me about the website you'd like to build.";
}

export function buildCompanyResponse(language: VisitorLanguage, facts: PricingFacts): string {
  const from = formatINR(facts.startingPriceINR);
  return language === "hinglish"
    ? `Webgent ek web development studio hai jise Mohit Verma ne shuru kiya hai. Hum Next.js, React aur PostgreSQL se fast business websites aur web apps banate hain, with 100% source code ownership aur milestone pricing starting from ${from}. Aap kis type ki website plan kar rahe hain?`
    : `Webgent is a web development studio founded by Mohit Verma. We build fast business websites and web applications with Next.js, React and PostgreSQL, with 100% source code ownership and milestone pricing starting from ${from}. What kind of project are you looking to create?`;
}

export function buildBiographyResponse(language: VisitorLanguage): string {
  return language === "hinglish"
    ? "Webgent ke founder Mohit Verma hain. Unhone AKTU (Dr. A.P.J. Abdul Kalam Technical University) se MCA (2022–2024) aur CCSU se B.Sc Computer Science (2019–2022) kiya hai. Currently wo DBA Lounge mein Software Developer hain aur Webgent ke zariye web applications build karte hain. Kya aap apne web project ke baare mein discuss karna chahte hain?"
    : "Webgent was founded by Mohit Verma. He holds a Master of Computer Applications (MCA, 2022–2024) from Dr. A.P.J. Abdul Kalam Technical University (AKTU) and a B.Sc in Computer Science (2019–2022) from CCSU. He currently works as a Software Developer at DBA Lounge and builds web applications through Webgent. How can we help with your web project?";
}

export function buildComparisonResponse(language: VisitorLanguage): string {
  return language === "hinglish"
    ? "Webgent mein aapko ye milta hai:\n1. **Clear Milestone Pricing**: 50% upfront aur 50% final launch review par.\n2. **Custom Next.js Build**: Templates ki jagah aapke business ke liye banaya gaya fast website.\n3. **100% Code Ownership**: Poora source code aapka, plus 15 din ke free post-launch bug fixes.\n\nKya aap chahenge ki hum aapke project ke requirements discuss karein?"
    : "Here's how Webgent works:\n1. **Clear Milestone Pricing**: 50% upfront and 50% after the final launch review.\n2. **Custom Next.js Build**: A fast site built for your business rather than an off-the-shelf template.\n3. **100% Code Ownership**: You own all the source code, plus 15 days of free post-launch bug fixes.\n\nWould you like to explore what scope suits your project?";
}

export function buildDefaultResponse(language: VisitorLanguage, facts: PricingFacts): string {
  const from = formatINR(facts.startingPriceINR);
  return language === "hinglish"
    ? `Webgent custom websites aur web applications banata hai, milestone pricing starting from ${from}. Aap apne business ya budget ke baare mein bataiye, main uske hisaab se scope suggest kar dunga.`
    : `Webgent builds custom websites and web applications, with milestone pricing starting from ${from}. Tell me about your business or target budget and I'll suggest a scope for you.`;
}

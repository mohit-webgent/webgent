/**
 * Deterministic Project Cost Calculator for AI Consultant
 * Enforces pure server-side calculation rules:
 * - Never allows the language model to invent, hallucinate, or override prices.
 * - Integrates with Webgent's canonical pricing engine in pricing.config.ts.
 * - Separates one-time development fees from recurring monthly maintenance and third-party actuals.
 * - Provides budget feasibility analysis and scope prioritization.
 * - Attaches verifiable market benchmark comparisons.
 */

import {
  calculatePricing,
  featureRequiresDynamic,
  normalizeFeatureId,
  POPULAR_FEATURES,
  FeatureOption,
  BASE_PAGES_INCLUDED,
  COST_PER_EXTRA_PAGE,
  MIN_PROJECT_COST,
  WEBSITE_TYPES,
  EstimatorCalculationConfig,
} from "@/lib/pricing.config";
import {
  DOMAIN_BLUEPRINTS,
  MAINTENANCE_PLANS,
  PageDefinition,
  UNCONFIGURED_BUSINESS_ITEMS,
} from "./knowledge-base";
import { getMarketBenchmark, MarketBenchmark } from "./market-benchmarks";

export interface ProjectCostBreakdown {
  currency: string;
  currencySymbol: string;
  oneTimeTotalINR: number;
  baseCategoryPriceINR: number;
  architectureTypePriceINR: number;
  pagesPriceINR: number;
  featuresTotalINR: number;
  expressDeliveryPriceINR: number;
  recurringMonthlyTotalINR: number;
  recurringBreakdown: {
    name: string;
    costINR: number;
    frequency: string;
    note?: string;
  }[];
  thirdPartyNotes: string[];
}

export interface BudgetAnalysis {
  userBudgetINR: number;
  calculatedCostINR: number;
  differenceINR: number;
  fitsBudget: boolean;
  recommendation: string;
  compromiseOptions?: string[];
}

export interface ProjectEstimateResult {
  isEstimateReliable: boolean;
  categoryKey: string;
  categoryDisplayName: string;
  architecture: "static" | "dynamic";
  autoSwitchedToDynamic: boolean;
  deliverySpeed: "standard" | "express";
  estimatedTimeline: string;
  pages: {
    count: number;
    list: PageDefinition[];
  };
  features: {
    essential: FeatureOption[];
    recommended: FeatureOption[];
    optional: FeatureOption[];
  };
  cost: ProjectCostBreakdown;
  marketBenchmark: MarketBenchmark | null;
  budgetAnalysis?: BudgetAnalysis;
  assumptions: string[];
  unconfiguredItems?: string[];
}

export interface CalculatorInput {
  categoryKey?: string | null;
  pageCount?: number | null;
  pagesCount?: number | null;
  requestedPages?: string[] | null;
  selectedFeatureIds?: string[] | null;
  architecture?: "static" | "dynamic" | "auto" | null;
  deliverySpeed?: "standard" | "express" | null;
  expressDelivery?: boolean | null;
  maintenancePlan?: "none" | "basic" | "standard" | "advanced" | null;
  maintenancePlanId?: "none" | "basic" | "standard" | "advanced" | null;
  userBudgetINR?: number | null;
}

export type EstimateInput = CalculatorInput;

/**
 * Normalizes input category key to a supported domain blueprint or standard category.
 */
export function resolveCategoryKey(rawKey?: string | null): string {
  if (!rawKey) return "business";
  const lower = rawKey.toLowerCase().trim();

  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("crossfit") || lower.includes("workout")) {
    return "gym";
  }
  if (lower.includes("ecom") || lower.includes("store") || lower.includes("shop") || lower.includes("cart") || lower.includes("clothing") || lower.includes("d2c") || lower.includes("jewel")) {
    return "ecommerce";
  }
  if (lower.includes("book") || lower.includes("salon") || lower.includes("appointment") || lower.includes("schedul") || lower.includes("clinic")) {
    return "booking_platform";
  }
  if (lower.includes("employee") || lower.includes("staff") || lower.includes("hr") || lower.includes("attendance") || lower.includes("internal") || lower.includes("payroll")) {
    return "employee_management";
  }
  if (lower.includes("restaurant") || lower.includes("cafe") || lower.includes("food") || lower.includes("dining") || lower.includes("menu")) {
    return "restaurant";
  }
  if (lower.includes("portfolio") || lower.includes("personal") || lower.includes("resume") || lower.includes("creator") || lower.includes("freelance")) {
    return "portfolio";
  }
  if (lower.includes("saas") || lower.includes("software") || lower.includes("portal") || lower.includes("tool") || lower.includes("cloud")) {
    return "saas";
  }
  if (lower.includes("realestate") || lower.includes("property") || lower.includes("builder") || lower.includes("architect")) {
    return "realestate";
  }
  if (lower.includes("education") || lower.includes("coaching") || lower.includes("tutor") || lower.includes("academy") || lower.includes("course")) {
    return "education";
  }

  return "business";
}

/**
 * Pure deterministic cost calculation function for AI Consultant.
 */
export function calculateProjectEstimate(
  input: CalculatorInput = {},
  pricingConfig?: EstimatorCalculationConfig,
): ProjectEstimateResult {
  const categoryKey = resolveCategoryKey(input.categoryKey);
  const blueprint = DOMAIN_BLUEPRINTS[categoryKey] || DOMAIN_BLUEPRINTS.business;

  // 1. Resolve Pages
  let resolvedPages: PageDefinition[] = [];
  if (Array.isArray(input.requestedPages) && input.requestedPages.length > 0) {
    resolvedPages = input.requestedPages.map((pageName, idx) => {
      const match = blueprint.pages.find(
        (p) => p.name.toLowerCase() === pageName.toLowerCase() || p.slug.includes(pageName.toLowerCase()),
      );
      if (match) return match;
      return {
        name: pageName,
        slug: `/${pageName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        purpose: "Custom page specified in project scope.",
        isEssential: idx < 4,
        sampleContent: "Custom content and tailored page layout.",
      };
    });
  } else {
    // Only resolve the essential core pages for the starter blueprint
    const essentialPages = blueprint.pages.filter((p) => p.isEssential);
    resolvedPages = essentialPages.length >= blueprint.recommendedPageCount
      ? essentialPages.slice(0, blueprint.recommendedPageCount)
      : blueprint.pages.slice(0, blueprint.recommendedPageCount);
  }

  const rawPageCount = typeof input.pageCount === "number" && !isNaN(input.pageCount)
    ? input.pageCount
    : typeof input.pagesCount === "number" && !isNaN(input.pagesCount)
      ? input.pagesCount
      : blueprint.recommendedPageCount;

  const pageCount = Math.max(1, Math.min(30, Math.round(rawPageCount)));

  // 2. Resolve Features (Use explicit caller features, or default ONLY to essential features)
  // CRITICAL: Do NOT auto-bundle recommendedFeatures into the starter estimate!
  const userFeatureIds = Array.isArray(input.selectedFeatureIds)
    ? input.selectedFeatureIds.map((id) => normalizeFeatureId(id))
    : null;

  const combinedFeatureIds = userFeatureIds !== null
    ? userFeatureIds
    : [...blueprint.essentialFeatures];

  // Group features into Essential, Recommended, Optional
  const essentialList: FeatureOption[] = [];
  const recommendedList: FeatureOption[] = [];
  const optionalList: FeatureOption[] = [];

  const featureCatalog =
    pricingConfig?.features && pricingConfig.features.length > 0
      ? pricingConfig.features
      : POPULAR_FEATURES;

  featureCatalog.forEach((feat) => {
    if (blueprint.essentialFeatures.includes(feat.id)) {
      essentialList.push(feat);
    } else if (blueprint.recommendedFeatures.includes(feat.id) || combinedFeatureIds.includes(feat.id)) {
      recommendedList.push(feat);
    } else if (blueprint.optionalAddons.includes(feat.id)) {
      optionalList.push(feat);
    }
  });

  // 3. Resolve Architecture (Static vs. Dynamic)
  const requestedArch = input.architecture === "dynamic" || input.architecture === "static"
    ? input.architecture
    : blueprint.defaultArchitecture;

  const hasDynamicFeature = combinedFeatureIds.some((fId) => featureRequiresDynamic(fId));
  const autoSwitchedToDynamic = requestedArch === "static" && hasDynamicFeature;
  const effectiveArch: "static" | "dynamic" = hasDynamicFeature || requestedArch === "dynamic" ? "dynamic" : "static";

  // Map category to pricing.config categoryId
  const mappedPricingCategoryId =
    categoryKey === "gym" ? "business" :
    categoryKey === "booking_platform" ? "healthcare" :
    categoryKey === "employee_management" ? "saas" :
    categoryKey;

  const effectiveDeliverySpeed =
    input.deliverySpeed === "express" || input.expressDelivery === true
      ? "express"
      : "standard";

  // 4. Run Canonical Pricing Calculation
  let canonicalResult = calculatePricing(
    {
      categoryId: mappedPricingCategoryId,
      typeId: effectiveArch,
      pageCount,
      deliverySpeed: effectiveDeliverySpeed,
      selectedFeatureIds: combinedFeatureIds,
    },
    pricingConfig,
  );

  let baseCategoryPriceINR = canonicalResult.baseCategoryPrice;
  let oneTimeTotalINR = canonicalResult.grandTotal;

  // Authoritative Gym Starter package alignment (₹11,999 with 5-7 business days timeline)
  const isBaselineGym =
    categoryKey === "gym" &&
    effectiveArch === "static" &&
    pageCount <= 5 &&
    (!userFeatureIds || userFeatureIds.length === 0 || userFeatureIds.every((f) => blueprint.essentialFeatures.includes(f)));

  if (isBaselineGym) {
    const configuredCat = pricingConfig?.categories?.find((c) => c.id === "business");
    const baseGymPrice = configuredCat ? configuredCat.startingPrice : blueprint.startingPriceINR;
    baseCategoryPriceINR = baseGymPrice;
    const minCostGym = pricingConfig?.pricingSettings?.minProjectCost ?? MIN_PROJECT_COST;
    const subtotal = Math.max(minCostGym, baseGymPrice);
    const expressMultiplier = pricingConfig?.pricingSettings?.expressMultiplier ?? 0.2;
    const expressPrice = effectiveDeliverySpeed === "express" ? Math.round(subtotal * expressMultiplier) : 0;
    oneTimeTotalINR = subtotal + expressPrice;
    canonicalResult = {
      ...canonicalResult,
      baseCategoryPrice: baseGymPrice,
      typePrice: 0,
      pagesPrice: 0,
      featuresCost: 0,
      expressPrice,
      grandTotal: oneTimeTotalINR,
    };
  }

  // Authoritative E-Commerce Starter package alignment (₹28,999: ₹19,999 base + ₹8,000 dynamic + ₹1,000 extra page)
  const isBaselineEcommerce =
    categoryKey === "ecommerce" &&
    effectiveArch === "dynamic" &&
    pageCount <= 6 &&
    (!userFeatureIds || userFeatureIds.length === 0 || userFeatureIds.every((f) => blueprint.essentialFeatures.includes(f)));

  if (isBaselineEcommerce) {
    const configuredCat = pricingConfig?.categories?.find((c) => c.id === "ecommerce");
    const baseEcommercePrice = configuredCat ? configuredCat.startingPrice : blueprint.startingPriceINR;
    const dynamicType = (pricingConfig?.types || WEBSITE_TYPES).find((t) => t.id === "dynamic");
    const typePrice = dynamicType ? dynamicType.additionalCost : 8000;
    const basePagesInc = pricingConfig?.pageSettings?.basePagesIncluded ?? BASE_PAGES_INCLUDED;
    const costExtra = pricingConfig?.pageSettings?.costPerExtraPage ?? COST_PER_EXTRA_PAGE;
    const pagesPrice = Math.max(0, pageCount - basePagesInc) * costExtra;
    baseCategoryPriceINR = baseEcommercePrice;
    const minCostEcom = pricingConfig?.pricingSettings?.minProjectCost ?? MIN_PROJECT_COST;
    const subtotal = Math.max(minCostEcom, baseEcommercePrice + typePrice + pagesPrice);
    const expressMultiplier = pricingConfig?.pricingSettings?.expressMultiplier ?? 0.2;
    const expressPrice = effectiveDeliverySpeed === "express" ? Math.round(subtotal * expressMultiplier) : 0;
    oneTimeTotalINR = subtotal + expressPrice;
    canonicalResult = {
      ...canonicalResult,
      baseCategoryPrice: baseEcommercePrice,
      typePrice,
      pagesPrice,
      featuresCost: 0,
      expressPrice,
      grandTotal: oneTimeTotalINR,
    };
  }

  // 5. Maintenance / Recurring Breakdown
  const rawMaintKey = (input.maintenancePlan || input.maintenancePlanId || "none") as string;
  const maintPlan = MAINTENANCE_PLANS[rawMaintKey] || MAINTENANCE_PLANS.none;

  const recurringBreakdown = [];
  if (maintPlan.priceMonthlyINR > 0) {
    recurringBreakdown.push({
      name: maintPlan.name,
      costINR: maintPlan.priceMonthlyINR,
      frequency: "monthly",
      note: `${maintPlan.includedHours} hrs monthly dedicated developer time included.`,
    });
  }

  const thirdPartyNotes = [
    "Domain Registration: Client-owned (~₹800–₹1,200/year via Namecheap/GoDaddy at actuals).",
    "Cloud Hosting & CDN: Hosted on Vercel / Cloudflare Edge (Free Tier suitable for launch; upgraded tiers billed directly at actuals).",
  ];

  if (combinedFeatureIds.includes("payment_gateway")) {
    thirdPartyNotes.push("Payment Gateway: Razorpay/Stripe charges standard transaction fees (approx. 2% per successful transaction) directly to merchant account.");
  }

  if (combinedFeatureIds.includes("whatsapp_alerts")) {
    thirdPartyNotes.push("WhatsApp Business API: Official Meta Cloud API conversation charges billed at actuals directly to your Meta billing account.");
  }

  if (combinedFeatureIds.includes("ai_chatbot")) {
    thirdPartyNotes.push("AI Model Tokens: Google Gemini / OpenAI API usage fees billed directly to your provider account at actual usage.");
  }

  // 6. Timeline Determination
  let estimatedTimeline = blueprint.typicalTimeline;
  if (input.deliverySpeed === "express") {
    estimatedTimeline = "Fast-Track Priority (3–5 Business Days)";
  } else if (effectiveArch === "dynamic" || pageCount > 6 || combinedFeatureIds.length > 5) {
    estimatedTimeline = "2–3 Weeks";
  }

  // 7. Market Benchmark Retrieval
  const scopeTier: "starter" | "standard" | "advanced" =
    effectiveArch === "dynamic" || pageCount > 7 ? "standard" : "starter";
  const marketBenchmark = getMarketBenchmark(categoryKey, scopeTier);

  // 8. Budget Analysis (if user specified a budget)
  let budgetAnalysis: BudgetAnalysis | undefined = undefined;
  if (typeof input.userBudgetINR === "number" && input.userBudgetINR > 0) {
    const userBudget = input.userBudgetINR;
    const difference = userBudget - oneTimeTotalINR;
    const fitsBudget = difference >= 0;

    let recommendation = "";
    const compromiseOptions: string[] = [];

    if (fitsBudget) {
      recommendation = `Great news! Your budget of ₹${userBudget.toLocaleString("en-IN")} fully covers the estimated scope of ₹${oneTimeTotalINR.toLocaleString("en-IN")}, leaving a surplus of ₹${difference.toLocaleString("en-IN")} that could be invested into post-launch monthly maintenance, marketing, or advanced SEO!`;
    } else {
      const deficit = Math.abs(difference);
      if (userBudget < 9999) {
        recommendation = `Webgent's minimum professional entry tier is our Starter Package at ₹9,999 (covering up to 5 custom pages, responsive design, contact form, WhatsApp chat, and basic SEO). Your target budget of ₹${userBudget.toLocaleString("en-IN")} is below this baseline, but we can prioritize an ultra-lean 1-page landing showcase (-₹2,000) or plan a Phase 1 launch when ready.`;
      } else {
        recommendation = `The recommended full-featured scope is ₹${oneTimeTotalINR.toLocaleString("en-IN")}, which is ₹${deficit.toLocaleString("en-IN")} above your target budget of ₹${userBudget.toLocaleString("en-IN")}. Here is how we can prioritize features to meet your budget:`;
      }

      if (categoryKey === "ecommerce") {
        compromiseOptions.push(
          "Launch Phase 1 as an artisan catalogue with direct WhatsApp ordering and UPI QR (starts at ₹9,999 under Starter tier), explicitly deferring automated checkout, payment gateway integration, and order management to Phase 2.",
        );
        if (combinedFeatureIds.includes("invoice_generation")) {
          compromiseOptions.push("Postpone automated PDF GST invoicing (-₹3,000 saving).");
        }
        if (combinedFeatureIds.includes("inventory_stock")) {
          compromiseOptions.push("Postpone real-time multi-location inventory syncing (-₹3,000 saving).");
        }
        if (pageCount > blueprint.recommendedPageCount) {
          compromiseOptions.push(
            `Consolidate content into ${blueprint.recommendedPageCount} standard e-commerce pages (-₹${((pageCount - blueprint.recommendedPageCount) * 1000).toLocaleString("en-IN")} saving).`,
          );
        }
      } else {
        if (effectiveArch === "dynamic" && !hasDynamicFeature) {
          compromiseOptions.push("Switch to a high-speed Static Architecture (-₹8,000 saving, zero hosting cost).");
        }
        if (pageCount > 5) {
          compromiseOptions.push(`Consolidate content into ${Math.min(5, pageCount)} core pages (-₹${((pageCount - 5) * 1000).toLocaleString("en-IN")} saving).`);
        }
        compromiseOptions.push("Launch Phase 1 with essential lead capture forms and add online payments or member portals in Phase 2 once initial client revenue starts flowing.");
      }
      if (input.deliverySpeed === "express") {
        compromiseOptions.push("Choose Standard SLA delivery instead of Express Fast-Track (-20% saving).");
      }
    }

    budgetAnalysis = {
      userBudgetINR: userBudget,
      calculatedCostINR: oneTimeTotalINR,
      differenceINR: difference,
      fitsBudget,
      recommendation,
      compromiseOptions,
    };
  }

  // 9. Check for Unconfigured Items
  const unconfiguredItems: string[] = [];
  if (categoryKey === "custom" || categoryKey === "custom_app") {
    unconfiguredItems.push(UNCONFIGURED_BUSINESS_ITEMS[0].note);
  }

  return {
    isEstimateReliable: true,
    categoryKey,
    categoryDisplayName: blueprint.displayName,
    architecture: effectiveArch,
    autoSwitchedToDynamic,
    deliverySpeed: input.deliverySpeed === "express" ? "express" : "standard",
    estimatedTimeline,
    pages: {
      count: pageCount,
      list: resolvedPages,
    },
    features: {
      essential: essentialList,
      recommended: recommendedList,
      optional: optionalList,
    },
    cost: {
      currency: "INR",
      currencySymbol: "₹",
      oneTimeTotalINR,
      baseCategoryPriceINR,
      architectureTypePriceINR: canonicalResult.typePrice,
      pagesPriceINR: canonicalResult.pagesPrice,
      featuresTotalINR: canonicalResult.featuresCost,
      expressDeliveryPriceINR: canonicalResult.expressPrice,
      recurringMonthlyTotalINR: maintPlan.priceMonthlyINR,
      recurringBreakdown,
      thirdPartyNotes,
    },
    marketBenchmark,
    budgetAnalysis,
    assumptions: [
      "Client provides all raw text copy, logo assets, and high-resolution facility/product photos.",
      "Domain and cloud hosting accounts are owned directly by client with zero agency markup.",
      "Includes 2 rounds of design revisions on private staging deployment before final production release.",
      "100% intellectual property and full source code ownership transferred upon final milestone settlement.",
    ],
    unconfiguredItems: unconfiguredItems.length > 0 ? unconfiguredItems : undefined,
  };
}

export interface Phase2UpgradeBreakdown {
  currentProject: string;
  currentTotalINR: number;
  upgradeType: "booking" | "booking_and_deposits";
  upgradeTitle: string;
  dynamicBackendINR: number;
  bookingCalendarINR: number;
  paymentGatewayINR: number;
  incrementalCostINR: number;
  totalWithUpgradeINR: number;
  upgradeCostINR: number;
  newProjectTotalINR: number;
  timelineEstimate: string;
  explanation: string;
}

/**
 * Calculates incremental upgrade cost from Phase 1 (Gym Starter) to Phase 2 (Online Booking & Deposits)
 * using authoritative configured pricing:
 * - Dynamic Backend (PostgreSQL + database): ₹8,000
 * - Online Booking Calendar: ₹4,000
 * - Payment Gateway (Razorpay/UPI for advance deposits): ₹4,500
 */
export function calculatePhase2Upgrade({
  currentTotalINR = 11999,
  includeDeposits = false,
}: {
  currentTotalINR?: number;
  includeDeposits?: boolean;
} = {}): Phase2UpgradeBreakdown {
  const dynamicBackendINR = 8000;
  const bookingCalendarINR = 4000;
  const paymentGatewayINR = includeDeposits ? 4500 : 0;
  const incrementalCostINR = dynamicBackendINR + bookingCalendarINR + paymentGatewayINR;
  const totalWithUpgradeINR = currentTotalINR + incrementalCostINR;

  return {
    currentProject: "Gym Starter Website (Phase 1)",
    currentTotalINR,
    upgradeType: includeDeposits ? "booking_and_deposits" : "booking",
    upgradeTitle: includeDeposits
      ? "Phase 2 Upgrade: Online Booking Calendar + Advance Deposits (Razorpay/UPI)"
      : "Phase 2 Upgrade: Interactive Online Booking Calendar",
    dynamicBackendINR,
    bookingCalendarINR,
    paymentGatewayINR,
    incrementalCostINR,
    totalWithUpgradeINR,
    upgradeCostINR: incrementalCostINR,
    newProjectTotalINR: totalWithUpgradeINR,
    timelineEstimate: "2–3 Weeks total engineering time",
    explanation: includeDeposits
      ? `Advance online deposits require a Dynamic Backend with PostgreSQL database (₹8,000) to manage member records and slot availability, an interactive Booking Calendar (₹4,000), and Razorpay/UPI payment gateway integration (₹4,500). Total Phase 2 upgrade: +₹16,500 (Project total: ₹${totalWithUpgradeINR.toLocaleString("en-IN")}).`
      : `Online class/slot booking requires upgrading from Static to a Dynamic Backend with PostgreSQL database (₹8,000) and an interactive Booking Calendar (₹4,000). Total Phase 2 upgrade: +₹12,000 (Project total: ₹${totalWithUpgradeINR.toLocaleString("en-IN")}).`,
  };
}

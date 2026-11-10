/**
 * Deterministic project cost calculator for the AI consultant.
 * - Prices come only from the /pricing packages and feature matrix, through the shared package calculation,
 *   so the consultant, the pricing page and the home estimator always agree on the same scope.
 * - The language model never invents or overrides a price.
 * - One-time development fees are kept apart from monthly care plans and third-party costs.
 */

import { featureRequiresDynamic, normalizeFeatureId, POPULAR_FEATURES, type FeatureOption } from "@/lib/pricing.config";
import { MASTER_FEATURES, MASTER_PACKAGES, type MasterPackageTier, type MatrixFeatureItem } from "@/data/pricing-matrix-data";
import {
  buildPricingUrl,
  calculatePackageEstimate,
  DEFAULT_EXPRESS_MULTIPLIER,
  EXTRA_PAGES_FEATURE_ID,
  getPackagePageLimit,
  recommendPackage,
  type PackageCatalog,
  type PackageEstimate,
} from "@/lib/package-pricing";
import type { BackendPricingData } from "@/lib/services/pricing-shared";
import { DOMAIN_BLUEPRINTS, MAINTENANCE_PLANS, PageDefinition, UNCONFIGURED_BUSINESS_ITEMS } from "./knowledge-base";
import { getMarketBenchmark, MarketBenchmark } from "./market-benchmarks";
import { CONSULTANT_FEATURE_TO_MATRIX, DATABASE_BACKEND_ID, EDITABLE_CONTENT_ID, mapConsultantFeatures } from "./package-mapping";

/** The admin-managed packages and feature matrix the consultant prices from. */
export interface PackagePricingSource {
  packages?: PackageCatalog;
  features?: MatrixFeatureItem[];
  expressMultiplier?: number;
}

export function packagePricingSource(data?: BackendPricingData): PackagePricingSource {
  if (!data) return {};
  return {
    packages: data.matrixPackages,
    features: data.matrixFeatures,
    expressMultiplier: data.settings?.expressMultiplier,
  };
}

export interface ProjectCostBreakdown {
  currency: string;
  currencySymbol: string;
  oneTimeTotalINR: number;
  /** The package price. Kept under its original name for the chat UI and stored leads. */
  baseCategoryPriceINR: number;
  architectureTypePriceINR: number;
  pagesPriceINR: number;
  featuresTotalINR: number;
  expressDeliveryPriceINR: number;
  lineItems: { name: string; amountINR: number }[];
  /** Requested items with no fixed price, confirmed by Mohit after a short call. */
  quoteItems: string[];
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

export interface EstimatePackage {
  tier: MasterPackageTier;
  name: string;
  priceINR: number;
  deliveryTime: string;
  warrantyDays: number;
  pageLimit: number;
}

export interface ProjectEstimateResult {
  isEstimateReliable: boolean;
  categoryKey: string;
  categoryDisplayName: string;
  architecture: "static" | "dynamic";
  autoSwitchedToDynamic: boolean;
  deliverySpeed: "standard" | "express";
  estimatedTimeline: string;
  package: EstimatePackage;
  /** Opens /pricing with exactly this package and these add-ons. */
  pricingUrl: string;
  /** What was priced, so follow-up questions can be priced on the same package. */
  pricingSelection: { tier: MasterPackageTier; featureIds: string[]; quantities: Record<string, number>; express: boolean };
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

const formatINR = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

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

/** What a consultant feature would cost on a package: nothing when included, its add-on price otherwise. */
function priceOnPackage(featureId: string, tier: MasterPackageTier, features: MatrixFeatureItem[]): number {
  const mapped = CONSULTANT_FEATURE_TO_MATRIX[normalizeFeatureId(featureId)];
  if (!mapped) return 0;
  return mapped.reduce((sum, id) => {
    const feature = features.find((f) => f.id === id);
    if (!feature || feature.availability[tier] === "included") return sum;
    return sum + (feature.addonPrice ?? 0);
  }, 0);
}

function toLineItems(estimate: PackageEstimate): { name: string; amountINR: number }[] {
  return [
    { name: `${estimate.packageName} package`, amountINR: estimate.packagePriceINR },
    ...estimate.addons.map((line) => ({
      name: line.quantity > 1 ? `${line.name} × ${line.quantity}` : line.name,
      amountINR: line.totalINR,
    })),
    ...(estimate.expressFeeINR > 0 ? [{ name: "Express delivery", amountINR: estimate.expressFeeINR }] : []),
  ];
}

/**
 * Pure deterministic cost calculation for the AI consultant, priced on the /pricing packages.
 */
export function calculateProjectEstimate(
  input: CalculatorInput = {},
  source: PackagePricingSource = {},
): ProjectEstimateResult {
  const packages = source.packages ?? MASTER_PACKAGES;
  const matrix = source.features ?? MASTER_FEATURES;
  const expressMultiplier = source.expressMultiplier ?? DEFAULT_EXPRESS_MULTIPLIER;

  const categoryKey = resolveCategoryKey(input.categoryKey);
  const blueprint = DOMAIN_BLUEPRINTS[categoryKey] || DOMAIN_BLUEPRINTS.business;

  // 1. Pages
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

  // 2. Features: the visitor's own choice, or the blueprint's essentials when they haven't named any.
  //    Recommendations are never bundled in.
  const userFeatureIds = Array.isArray(input.selectedFeatureIds)
    ? input.selectedFeatureIds.map((id) => normalizeFeatureId(id))
    : null;
  const combinedFeatureIds =
    userFeatureIds !== null && userFeatureIds.length > 0 ? userFeatureIds : [...blueprint.essentialFeatures];

  // 3. Architecture: anything that stores data or logins needs a database and an editable backend.
  const requestedArch = input.architecture === "dynamic" || input.architecture === "static"
    ? input.architecture
    : blueprint.defaultArchitecture;
  const hasDynamicFeature = combinedFeatureIds.some((fId) => featureRequiresDynamic(fId));
  const autoSwitchedToDynamic = requestedArch === "static" && hasDynamicFeature;
  const effectiveArch: "static" | "dynamic" = hasDynamicFeature || requestedArch === "dynamic" ? "dynamic" : "static";

  const { matrixIds, quoteOnly } = mapConsultantFeatures(combinedFeatureIds, matrix);
  if (effectiveArch === "dynamic") {
    matrixIds.push(DATABASE_BACKEND_ID);
    if (!combinedFeatureIds.includes("admin_dashboard")) matrixIds.push(EDITABLE_CONTENT_ID);
  }

  const deliverySpeed: "standard" | "express" =
    input.deliverySpeed === "express" || input.expressDelivery === true ? "express" : "standard";
  const express = deliverySpeed === "express";

  // 4. The cheapest package that delivers the whole scope, exactly as /pricing would total it.
  const priced = recommendPackage({ featureIds: matrixIds, pageCount, express, packages, features: matrix, expressMultiplier });
  const tier = priced.tier;
  const extraPagesLine = priced.addons.find((line) => line.id === EXTRA_PAGES_FEATURE_ID);
  const pagesPriceINR = extraPagesLine?.totalINR ?? 0;
  const quoteItems = [
    ...priced.quoteItems.map((item) => item.name),
    ...quoteOnly.map((id) => POPULAR_FEATURES.find((f) => f.id === id)?.name ?? id),
  ];

  // Feature lists carry the price on the chosen package, so the card and the total agree.
  const withPackagePrice = (feature: FeatureOption): FeatureOption => ({
    ...feature,
    price: priceOnPackage(feature.id, tier, matrix),
  });
  const essentialList: FeatureOption[] = [];
  const recommendedList: FeatureOption[] = [];
  const optionalList: FeatureOption[] = [];
  POPULAR_FEATURES.forEach((feat) => {
    if (blueprint.essentialFeatures.includes(feat.id)) essentialList.push(withPackagePrice(feat));
    else if (blueprint.recommendedFeatures.includes(feat.id) || combinedFeatureIds.includes(feat.id)) recommendedList.push(withPackagePrice(feat));
    else if (blueprint.optionalAddons.includes(feat.id)) optionalList.push(withPackagePrice(feat));
  });

  // 5. Monthly care is optional and billed separately from the one-time fee.
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

  // 6. Timeline follows the package, as on /pricing.
  const estimatedTimeline = express ? "Fast-track priority delivery" : priced.deliveryTime;

  // 7. Market benchmark
  const scopeTier: "starter" | "standard" | "advanced" =
    effectiveArch === "dynamic" || pageCount > 7 ? "standard" : "starter";
  const marketBenchmark = getMarketBenchmark(categoryKey, scopeTier);

  // 8. Budget analysis, with savings worked out on the same package.
  let budgetAnalysis: BudgetAnalysis | undefined;
  if (typeof input.userBudgetINR === "number" && input.userBudgetINR > 0) {
    const userBudget = input.userBudgetINR;
    const difference = userBudget - priced.totalINR;
    const fitsBudget = difference >= 0;
    const starter = packages.starter;
    let recommendation: string;
    const compromiseOptions: string[] = [];

    if (fitsBudget) {
      recommendation = `Your budget of ${formatINR(userBudget)} covers the estimated scope of ${formatINR(priced.totalINR)} on the ${priced.packageName} package, leaving ${formatINR(difference)} for post-launch care, marketing or extra features.`;
    } else {
      if (userBudget < starter.startingPrice) {
        recommendation = `Webgent's entry package is ${starter.name} at ${formatINR(starter.startingPrice)} (up to ${getPackagePageLimit("starter", packages)} pages, ${starter.deliveryTime}). Your budget of ${formatINR(userBudget)} is below this, so the best route is a lean Phase 1 on the ${starter.name} package, with the rest added later.`;
      } else {
        recommendation = `The full scope comes to ${formatINR(priced.totalINR)} on the ${priced.packageName} package, ${formatINR(Math.abs(difference))} above your budget of ${formatINR(userBudget)}. Here is how the scope can be phased to fit:`;
      }

      if (categoryKey === "ecommerce" && tier !== "starter") {
        compromiseOptions.push(
          `Launch Phase 1 as a product catalogue with WhatsApp ordering on the ${starter.name} package (${formatINR(starter.startingPrice)}), and add checkout and online payments in Phase 2.`,
        );
      } else if (tier !== "starter" && priced.totalINR > starter.startingPrice) {
        compromiseOptions.push(
          `Launch Phase 1 on the ${starter.name} package (${formatINR(starter.startingPrice)}, up to ${getPackagePageLimit("starter", packages)} pages) and add the remaining features in Phase 2.`,
        );
      }
      const deferrable = priced.addons
        .filter((line) => line.id !== EXTRA_PAGES_FEATURE_ID)
        .sort((a, b) => b.totalINR - a.totalINR)
        .slice(0, 3);
      deferrable.forEach((line) => compromiseOptions.push(`Move ${line.name} to Phase 2 (saves ${formatINR(line.totalINR)}).`));
      if (extraPagesLine) {
        compromiseOptions.push(`Keep to ${priced.pageLimit} pages, the ${priced.packageName} package limit (saves ${formatINR(extraPagesLine.totalINR)}).`);
      }
      if (express) {
        compromiseOptions.push(`Choose standard delivery instead of express (saves ${formatINR(priced.expressFeeINR)}).`);
      }
    }

    budgetAnalysis = {
      userBudgetINR: userBudget,
      calculatedCostINR: priced.totalINR,
      differenceINR: difference,
      fitsBudget,
      recommendation,
      compromiseOptions,
    };
  }

  // 9. Unconfigured items
  const unconfiguredItems: string[] = [];
  if (categoryKey === "custom" || categoryKey === "custom_app") {
    unconfiguredItems.push(UNCONFIGURED_BUSINESS_ITEMS[0].note);
  }

  const quantities: Record<string, number> = extraPagesLine ? { [EXTRA_PAGES_FEATURE_ID]: extraPagesLine.quantity } : {};

  return {
    isEstimateReliable: quoteItems.length === 0,
    categoryKey,
    categoryDisplayName: blueprint.displayName,
    architecture: effectiveArch,
    autoSwitchedToDynamic,
    deliverySpeed,
    estimatedTimeline,
    package: {
      tier,
      name: priced.packageName,
      priceINR: priced.packagePriceINR,
      deliveryTime: priced.deliveryTime,
      warrantyDays: priced.warrantyDays,
      pageLimit: priced.pageLimit,
    },
    pricingUrl: buildPricingUrl(priced, express),
    pricingSelection: {
      tier,
      featureIds: extraPagesLine ? [...matrixIds, EXTRA_PAGES_FEATURE_ID] : matrixIds,
      quantities,
      express,
    },
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
      oneTimeTotalINR: priced.totalINR,
      baseCategoryPriceINR: priced.packagePriceINR,
      architectureTypePriceINR: 0,
      pagesPriceINR,
      featuresTotalINR: priced.addonsTotalINR - pagesPriceINR,
      expressDeliveryPriceINR: priced.expressFeeINR,
      lineItems: toLineItems(priced),
      quoteItems,
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
      `Includes ${priced.warrantyDays} days of free post-launch bug fixes (${priced.packageName} package warranty).`,
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

const BOOKING_CALENDAR_ID = "booking_scheduling_appointment_calendar";
const PAYMENT_GATEWAY_ID = "payments_subscriptions_gateway";

/**
 * Prices adding online booking (and optionally deposits) after launch, on the package already scoped,
 * by re-running the same calculation with the extra features. Without a scoped project it uses Starter.
 */
export function calculatePhase2Upgrade({
  estimate,
  includeDeposits = false,
  source = {},
}: {
  estimate?: ProjectEstimateResult;
  includeDeposits?: boolean;
  source?: PackagePricingSource;
} = {}): Phase2UpgradeBreakdown {
  const packages = source.packages ?? MASTER_PACKAGES;
  const features = source.features ?? MASTER_FEATURES;
  const expressMultiplier = source.expressMultiplier ?? DEFAULT_EXPRESS_MULTIPLIER;
  const selection = estimate?.pricingSelection ?? { tier: "starter" as MasterPackageTier, featureIds: [], quantities: {}, express: false };

  const run = (featureIds: string[]) =>
    calculatePackageEstimate({ tier: selection.tier, featureIds, quantities: selection.quantities, express: selection.express, packages, features, expressMultiplier });

  const current = run(selection.featureIds);
  const withBackend = run(Array.from(new Set([...selection.featureIds, DATABASE_BACKEND_ID])));
  const withCalendar = run(Array.from(new Set([...withBackendIds(selection.featureIds), BOOKING_CALENDAR_ID])));
  const withDeposits = run(Array.from(new Set([...withBackendIds(selection.featureIds), BOOKING_CALENDAR_ID, PAYMENT_GATEWAY_ID])));
  const upgraded = includeDeposits ? withDeposits : withCalendar;

  const currentTotalINR = estimate ? current.totalINR : 0;
  const baseline = estimate ? current.totalINR : current.packagePriceINR;
  const dynamicBackendINR = withBackend.totalINR - current.totalINR;
  const bookingCalendarINR = withCalendar.totalINR - withBackend.totalINR;
  const paymentGatewayINR = includeDeposits ? withDeposits.totalINR - withCalendar.totalINR : 0;
  const incrementalCostINR = upgraded.totalINR - current.totalINR;
  const totalWithUpgradeINR = (estimate ? upgraded.totalINR : upgraded.totalINR - baseline);

  return {
    currentProject: estimate?.categoryDisplayName ?? "Current Website (Phase 1)",
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
    explanation: `Phase 2 adds ${formatINR(incrementalCostINR)} (project total ${formatINR(totalWithUpgradeINR)}).`,
  };
}

function withBackendIds(ids: string[]): string[] {
  return Array.from(new Set([...ids, DATABASE_BACKEND_ID]));
}

/**
 * The one pricing calculation behind /pricing, the home estimator and the AI consultant.
 * A quote is a package price, plus add-ons that package does not include, plus the express fee.
 * Keeping it in one place means the three can never quote different amounts for the same scope.
 */

import {
  MASTER_FEATURES,
  MASTER_PACKAGES,
  type MasterPackageTier,
  type MatrixFeatureItem,
  type PackageDetails,
} from "@/data/pricing-matrix-data";

export const PACKAGE_TIERS: MasterPackageTier[] = ["starter", "business", "pro"];
export const EXTRA_PAGES_FEATURE_ID = "website_pages_additional_pages";
export const WARRANTY_FEATURE_ID = "deployment_maintenance_bugfix_warranty";
export const DEFAULT_EXPRESS_MULTIPLIER = 0.2;

const FALLBACK_PAGE_LIMITS: Record<MasterPackageTier, number> = { starter: 5, business: 10, pro: 15 };
const FALLBACK_WARRANTY_DAYS: Record<MasterPackageTier, number> = { starter: 14, business: 30, pro: 60 };

export type PackageCatalog = Record<MasterPackageTier, PackageDetails>;

/** Pages a package covers, read from its "Up to N … pages/screens" highlight so admin edits carry through. */
export function getPackagePageLimit(tier: MasterPackageTier, packages: PackageCatalog = MASTER_PACKAGES): number {
  for (const line of packages[tier]?.keyHighlights ?? []) {
    const match = /up to (\d+)\b[^,]*\b(pages?|screens?)/i.exec(line);
    if (match) return Number(match[1]);
  }
  return FALLBACK_PAGE_LIMITS[tier];
}

/** Bug-fix warranty for a package, read from its highlights first and the feature matrix second. */
export function getPackageWarrantyDays(
  tier: MasterPackageTier,
  packages: PackageCatalog = MASTER_PACKAGES,
  features: MatrixFeatureItem[] = MASTER_FEATURES,
): number {
  for (const line of packages[tier]?.keyHighlights ?? []) {
    const match = /(\d+)\s*days?\b[^,]*warranty/i.exec(line);
    if (match) return Number(match[1]);
  }
  const note = features.find((f) => f.id === WARRANTY_FEATURE_ID)?.availabilityNotes?.[tier];
  const fromNote = note ? /(\d+)/.exec(note) : null;
  return fromNote ? Number(fromNote[1]) : FALLBACK_WARRANTY_DAYS[tier];
}

/** "14 days (Starter), 30 days (Business), 60 days (Pro)", for copy that covers every package. */
export function describeWarrantyByPackage(
  packages: PackageCatalog = MASTER_PACKAGES,
  features: MatrixFeatureItem[] = MASTER_FEATURES,
): string {
  return PACKAGE_TIERS.map((tier) => `${getPackageWarrantyDays(tier, packages, features)} days (${packages[tier].name})`).join(", ");
}

export interface PackageEstimateLine {
  id: string;
  name: string;
  unitPriceINR: number;
  quantity: number;
  totalINR: number;
  billing: "onetime" | "monthly";
}

export interface PackageEstimateInput {
  tier: MasterPackageTier;
  /** Feature-matrix ids the client wants. Features the package already includes cost nothing. */
  featureIds: string[];
  quantities?: Record<string, number>;
  express?: boolean;
  /** The custom build mode on /pricing prices add-ons alone, without a package. */
  includePackagePrice?: boolean;
  packages?: PackageCatalog;
  features?: MatrixFeatureItem[];
  expressMultiplier?: number;
}

export interface PackageEstimate {
  tier: MasterPackageTier;
  packageName: string;
  packagePriceINR: number;
  deliveryTime: string;
  warrantyDays: number;
  pageLimit: number;
  included: { id: string; name: string }[];
  addons: PackageEstimateLine[];
  monthly: PackageEstimateLine[];
  /** Requested items that need a custom quote, or that this package cannot include at all. */
  quoteItems: { id: string; name: string }[];
  unavailable: { id: string; name: string }[];
  addonsTotalINR: number;
  subtotalINR: number;
  expressFeeINR: number;
  totalINR: number;
  monthlyTotalINR: number;
}

export function calculatePackageEstimate({
  tier,
  featureIds,
  quantities = {},
  express = false,
  includePackagePrice = true,
  packages = MASTER_PACKAGES,
  features = MASTER_FEATURES,
  expressMultiplier = DEFAULT_EXPRESS_MULTIPLIER,
}: PackageEstimateInput): PackageEstimate {
  const pkg = packages[tier];
  const included: PackageEstimate["included"] = [];
  const addons: PackageEstimateLine[] = [];
  const monthly: PackageEstimateLine[] = [];
  const quoteItems: PackageEstimate["quoteItems"] = [];
  const unavailable: PackageEstimate["unavailable"] = [];

  for (const id of Array.from(new Set(featureIds))) {
    const feature = features.find((f) => f.id === id);
    if (!feature) continue;
    const status = feature.availability[tier];

    if (includePackagePrice && status === "included") {
      included.push({ id, name: feature.name });
    } else if (status === "custom_quote" || feature.isCustomQuote || !feature.addonPrice) {
      quoteItems.push({ id, name: feature.name });
    } else {
      if (includePackagePrice && status === "not_included") unavailable.push({ id, name: feature.name });
      const quantity = feature.hasQuantity ? Math.max(1, Math.round(quantities[id] ?? 1)) : 1;
      const line: PackageEstimateLine = {
        id,
        name: feature.name,
        unitPriceINR: feature.addonPrice,
        quantity,
        totalINR: feature.addonPrice * quantity,
        billing: feature.billingType,
      };
      (feature.billingType === "monthly" ? monthly : addons).push(line);
    }
  }

  const packagePriceINR = includePackagePrice ? pkg.startingPrice : 0;
  const addonsTotalINR = addons.reduce((sum, line) => sum + line.totalINR, 0);
  const subtotalINR = packagePriceINR + addonsTotalINR;
  const expressFeeINR = express ? Math.round(subtotalINR * expressMultiplier) : 0;

  return {
    tier,
    packageName: pkg.name,
    packagePriceINR,
    deliveryTime: pkg.deliveryTime,
    warrantyDays: getPackageWarrantyDays(tier, packages, features),
    pageLimit: getPackagePageLimit(tier, packages),
    included,
    addons,
    monthly,
    quoteItems,
    unavailable,
    addonsTotalINR,
    subtotalINR,
    expressFeeINR,
    totalINR: subtotalINR + expressFeeINR,
    monthlyTotalINR: monthly.reduce((sum, line) => sum + line.totalINR, 0),
  };
}

/**
 * Prices the same scope on every package, adding any pages beyond each package's limit,
 * and returns the cheapest package that can deliver all of it. Fewer custom-quote items win first.
 */
export function recommendPackage(
  input: Omit<PackageEstimateInput, "tier" | "includePackagePrice"> & { pageCount?: number },
): PackageEstimate {
  const { pageCount = 1, ...rest } = input;
  const candidates = PACKAGE_TIERS.map((tier) => {
    const extraPages = Math.max(0, pageCount - getPackagePageLimit(tier, rest.packages));
    const featureIds = extraPages > 0 ? [...rest.featureIds, EXTRA_PAGES_FEATURE_ID] : rest.featureIds;
    const quantities = extraPages > 0 ? { ...rest.quantities, [EXTRA_PAGES_FEATURE_ID]: extraPages } : rest.quantities;
    return calculatePackageEstimate({ ...rest, tier, featureIds, quantities });
  });

  const deliverable = candidates.filter((estimate) => estimate.unavailable.length === 0);
  const pool = deliverable.length > 0 ? deliverable : candidates;
  return pool.reduce((best, next) => {
    if (next.quoteItems.length !== best.quoteItems.length) {
      return next.quoteItems.length < best.quoteItems.length ? next : best;
    }
    return next.totalINR < best.totalINR ? next : best;
  });
}

/** A /pricing link that opens with exactly this package, add-ons, quantities and delivery speed. */
export function buildPricingUrl(estimate: PackageEstimate, express = false): string {
  const params = new URLSearchParams({ flow: "package", pkg: estimate.tier });
  const addonIds = [...estimate.addons, ...estimate.monthly].map((line) => line.id);
  if (addonIds.length > 0) params.set("addons", addonIds.join(","));
  const quantities = [...estimate.addons, ...estimate.monthly].filter((line) => line.quantity > 1);
  if (quantities.length > 0) params.set("qty", quantities.map((line) => `${line.id}:${line.quantity}`).join(","));
  if (express) params.set("speed", "express");
  return `/pricing?${params.toString()}`;
}

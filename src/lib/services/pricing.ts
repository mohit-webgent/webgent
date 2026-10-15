import { prisma } from "@/lib/db";
import {
  WEBSITE_CATEGORIES,
  WEBSITE_TYPES,
  POPULAR_FEATURES,
  BASE_PAGES_INCLUDED,
  COST_PER_EXTRA_PAGE,
  DISCOUNT_FOR_ONE_PAGE,
  WebsiteCategory,
  WebsiteTypeOption,
  FeatureOption,
} from "@/lib/pricing.config";
import {
  MASTER_PACKAGES,
  MASTER_CATEGORIES,
  MASTER_FEATURES,
  PackageDetails,
  MasterCategoryMeta,
  MatrixFeatureItem,
  MasterPackageTier,
  normalizeMatrixFeatureId,
} from "@/data/pricing-matrix-data";

export interface BackendPricingData {
  categories: WebsiteCategory[];
  types: WebsiteTypeOption[];
  features: FeatureOption[];
  matrixPackages: Record<MasterPackageTier, PackageDetails>;
  matrixCategories: MasterCategoryMeta[];
  matrixFeatures: MatrixFeatureItem[];
  settings: {
    basePagesIncluded: number;
    costPerExtraPage: number;
    discountForOnePage: number;
    currency: string;
    currencySymbol: string;
  };
}

export async function getPricingData(): Promise<BackendPricingData> {
  let categories = WEBSITE_CATEGORIES;
  let types = WEBSITE_TYPES;
  let features = POPULAR_FEATURES;
  let matrixPackages = MASTER_PACKAGES;
  const matrixCategories = MASTER_CATEGORIES;
  let matrixFeatures = MASTER_FEATURES;

  try {
    // Check if custom price overrides are stored in prisma.siteSetting
    const customPricingSetting = await prisma.siteSetting.findUnique({
      where: { key: "pricing_overrides" },
    });

    if (customPricingSetting && customPricingSetting.value) {
      const overrides = JSON.parse(customPricingSetting.value);
      if (overrides.categories) categories = overrides.categories;
      if (overrides.types) types = overrides.types;
      if (overrides.features) features = overrides.features;
      if (overrides.matrixPackages) matrixPackages = overrides.matrixPackages;
      if (overrides.matrixFeatures && Array.isArray(overrides.matrixFeatures)) {
        matrixFeatures = overrides.matrixFeatures.map((f: MatrixFeatureItem) => ({
          ...f,
          id: normalizeMatrixFeatureId(f.id),
        }));
      }
    }
  } catch (error) {
    // Graceful fallback to default configurator data if DB is unavailable
    console.warn("Using default pricing data fallback:", error);
  }

  return {
    categories,
    types,
    features,
    matrixPackages,
    matrixCategories,
    matrixFeatures,
    settings: {
      basePagesIncluded: BASE_PAGES_INCLUDED,
      costPerExtraPage: COST_PER_EXTRA_PAGE,
      discountForOnePage: DISCOUNT_FOR_ONE_PAGE,
      currency: "INR",
      currencySymbol: "₹",
    },
  };
}

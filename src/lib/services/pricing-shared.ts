import { z } from "zod";
import type {
  WebsiteCategory,
  WebsiteTypeOption,
  FeatureOption,
  PageCountSettings,
  PricingSettings,
  EstimatorCalculationConfig,
} from "@/lib/pricing.config";
import {
  WEBSITE_CATEGORIES,
  WEBSITE_TYPES,
  POPULAR_FEATURES,
  PAGE_SETTINGS,
  PRICING_SETTINGS,
} from "@/lib/pricing.config";
import type {
  MasterPackageTier,
  PackageDetails,
  MasterCategoryMeta,
  MatrixFeatureItem,
} from "@/data/pricing-matrix-data";
import {
  MASTER_PACKAGES,
  MASTER_CATEGORIES,
  MASTER_FEATURES,
} from "@/data/pricing-matrix-data";

export type {
  WebsiteCategory,
  WebsiteTypeOption,
  FeatureOption,
  PageCountSettings,
  PricingSettings,
  EstimatorCalculationConfig,
  MasterPackageTier,
  PackageDetails,
  MasterCategoryMeta,
  MatrixFeatureItem,
};

// ============================================================================
// 1. CONSTANTS & CACHE KEYS
// ============================================================================

export const PRICING_CACHE_KEY = "cache:pricing:data_v1";
export const PRICING_CACHE_TTL_SECONDS = 300; // 5 minutes

export const SUPPORTED_PACKAGE_TIERS: MasterPackageTier[] = ["starter", "business", "pro"];

// ============================================================================
// 2. ZOD VALIDATION SCHEMAS
// ============================================================================

export const packageDetailsSchema = z.object({
  id: z.enum(["starter", "business", "pro"]),
  name: z.string().trim().min(1, "Name is required").max(60),
  tagline: z.string().trim().min(1, "Tagline is required").max(120),
  startingPrice: z.number().int().finite().min(1000, "Starting price must be at least ₹1,000").max(10000000),
  deliveryTime: z
    .string()
    .trim()
    .min(1, "Delivery time is required")
    .max(60)
    .refine((val) => !val.startsWith("-"), "Delivery time cannot be negative"),
  badge: z
    .preprocess((val) => (val === "" || val === null ? undefined : val), z.string().trim().max(40).optional())
    .optional(),
  popular: z.boolean().optional(),
  idealFor: z.string().trim().min(1, "Ideal for description is required").max(200),
  summary: z.string().trim().min(1, "Summary is required").max(500),
  keyHighlights: z
    .array(z.string().trim().min(1).max(140))
    .min(1, "Must have at least 1 key highlight")
    .max(20, "Maximum 20 highlights allowed"),
});

export const websiteCategorySchema = z.object({
  id: z.string().trim().min(1).max(40).regex(/^[a-z0-9_-]+$/, "Invalid category ID format"),
  title: z.string().trim().min(1, "Title is required").max(80),
  subtitle: z.string().trim().min(1, "Subtitle is required").max(160),
  startingPrice: z.number().int().finite().min(1000, "Starting price must be at least ₹1,000").max(10000000),
  deliveryDays: z
    .string()
    .trim()
    .min(1, "Delivery days are required")
    .max(60)
    .refine((val) => !val.startsWith("-"), "Delivery days cannot be negative"),
  defaultFeatures: z.array(z.string().trim().min(1)),
  recommendedPages: z.number().int().finite().min(1).max(30),
  icon: z.string().trim().min(1).max(40),
});

export const websiteTypeOptionSchema = z.object({
  id: z.enum(["static", "dynamic"]),
  title: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().min(1).max(160),
  additionalCost: z.number().int().finite().min(0, "Additional cost cannot be negative").max(1000000),
  description: z.string().trim().min(1).max(400),
  bestFor: z.string().trim().min(1).max(200),
});

export const featureOptionSchema = z.object({
  id: z.string().trim().min(1).max(60).regex(/^[a-z0-9_-]+$/, "Invalid feature ID format"),
  name: z.string().trim().min(1, "Name is required").max(100),
  simpleDescription: z.string().trim().min(1, "Description is required").max(300),
  price: z.number().int().finite().min(0, "Price cannot be negative").max(1000000),
  icon: z.string().trim().min(1).max(40),
  categoryTag: z.string().trim().min(1).max(60),
  popularFor: z.array(z.string().trim()).optional(),
  includedInDynamic: z.boolean().optional(),
  costNote: z
    .preprocess((val) => (val === "" || val === null ? undefined : val), z.string().trim().max(200).optional())
    .optional(),
});

export const pricingSettingsSchema = z.object({
  basePagesIncluded: z.number().int().finite().min(1).max(20),
  costPerExtraPage: z.number().int().finite().min(0).max(50000),
  discountForOnePage: z.number().int().finite().min(0).max(50000),
  currency: z.string().trim().min(1).max(5).default("INR"),
  currencySymbol: z.string().trim().min(1).max(5).default("₹"),
  minProjectCost: z.number().int().finite().min(1000).max(1000000).default(4999),
  expressMultiplier: z.number().finite().min(0).max(2).default(0.2),
});

export const pricingOverridesUpdateSchema = z
  .object({
    matrixPackages: z.object({
      starter: packageDetailsSchema,
      business: packageDetailsSchema,
      pro: packageDetailsSchema,
    }),
    categories: z
      .array(websiteCategorySchema)
      .min(1, "Must configure at least 1 category")
      .refine((cats) => {
        const ids = cats.map((c) => c.id);
        return new Set(ids).size === ids.length;
      }, "Categories must not contain duplicate IDs"),
    types: z
      .array(websiteTypeOptionSchema)
      .min(2, "Must configure both static and dynamic types")
      .refine((types) => {
        const ids = types.map((t) => t.id);
        return ids.includes("static") && ids.includes("dynamic");
      }, "Both static and dynamic architecture types are required"),
    features: z
      .array(featureOptionSchema)
      .min(1, "Must configure at least 1 feature")
      .refine((feats) => {
        const ids = feats.map((f) => f.id);
        return new Set(ids).size === ids.length;
      }, "Features must not contain duplicate IDs"),
    settings: pricingSettingsSchema,
  })
  .strict();

export type PricingOverridesPayload = z.infer<typeof pricingOverridesUpdateSchema>;

// ============================================================================
// 3. BACKEND DATA STRUCTURE
// ============================================================================

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
    minProjectCost?: number;
    expressMultiplier?: number;
  };
}

// ============================================================================
// 4. SAFE PRODUCTION DEFAULTS
// ============================================================================

export const DEFAULT_BACKEND_PRICING_DATA: BackendPricingData = {
  categories: WEBSITE_CATEGORIES,
  types: WEBSITE_TYPES,
  features: POPULAR_FEATURES,
  matrixPackages: MASTER_PACKAGES,
  matrixCategories: MASTER_CATEGORIES,
  matrixFeatures: MASTER_FEATURES,
  settings: {
    basePagesIncluded: PAGE_SETTINGS.basePagesIncluded,
    costPerExtraPage: PAGE_SETTINGS.costPerExtraPage,
    discountForOnePage: PAGE_SETTINGS.discountForOnePage,
    currency: PRICING_SETTINGS.currency,
    currencySymbol: PRICING_SETTINGS.currencySymbol,
    minProjectCost: PRICING_SETTINGS.minProjectCost,
    expressMultiplier: PRICING_SETTINGS.expressMultiplier,
  },
};

export const DEFAULT_PRICING_OVERRIDES_PAYLOAD: PricingOverridesPayload = {
  matrixPackages: MASTER_PACKAGES,
  categories: WEBSITE_CATEGORIES,
  types: WEBSITE_TYPES,
  features: POPULAR_FEATURES,
  settings: {
    basePagesIncluded: PAGE_SETTINGS.basePagesIncluded,
    costPerExtraPage: PAGE_SETTINGS.costPerExtraPage,
    discountForOnePage: PAGE_SETTINGS.discountForOnePage,
    currency: PRICING_SETTINGS.currency,
    currencySymbol: PRICING_SETTINGS.currencySymbol,
    minProjectCost: PRICING_SETTINGS.minProjectCost,
    expressMultiplier: PRICING_SETTINGS.expressMultiplier,
  },
};

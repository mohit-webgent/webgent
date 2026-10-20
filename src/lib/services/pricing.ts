import { prisma } from "@/lib/db";
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import type { EstimatorCalculationConfig } from "@/lib/pricing.config";
import {
  PRICING_CACHE_KEY,
  PRICING_CACHE_TTL_SECONDS,
  DEFAULT_BACKEND_PRICING_DATA,
  pricingOverridesUpdateSchema,
  PricingOverridesPayload,
  BackendPricingData,
} from "./pricing-shared";
import {
  MASTER_CATEGORIES,
  MASTER_FEATURES,
} from "@/data/pricing-matrix-data";

export * from "./pricing-shared";

export interface PricingSaveResult {
  success: boolean;
  data: PricingOverridesPayload;
  meta: {
    cacheRefreshed: boolean;
    cacheErrors: string[];
    invalidatedKeys: string[];
    revalidatedPaths: string[];
  };
}

/**
 * Retrieves the active pricing data for public configurators and admin manager.
 * 1. Checks Redis cache first.
 * 2. Falls back to PostgreSQL SiteSetting (key: pricing_overrides).
 * 3. Falls back to safe hardcoded production defaults.
 */
export async function getPricingData(): Promise<BackendPricingData> {
  // 1. Try reading from Redis cache
  try {
    const cached = await cacheGet<BackendPricingData>(PRICING_CACHE_KEY);
    if (cached && typeof cached === "object" && cached.categories && cached.matrixPackages) {
      return cached;
    }
  } catch (cacheErr) {
    logger.warn("[Pricing Service] Redis read failed, falling back to database", {
      error: String(cacheErr),
    });
  }

  // 2. Fall back to PostgreSQL database
  let categories = DEFAULT_BACKEND_PRICING_DATA.categories;
  let types = DEFAULT_BACKEND_PRICING_DATA.types;
  let features = DEFAULT_BACKEND_PRICING_DATA.features;
  let matrixPackages = DEFAULT_BACKEND_PRICING_DATA.matrixPackages;
  const matrixCategories = MASTER_CATEGORIES;
  const matrixFeatures = MASTER_FEATURES;
  let settings = DEFAULT_BACKEND_PRICING_DATA.settings;

  try {
    const customPricingSetting = await prisma.siteSetting.findUnique({
      where: { key: "pricing_overrides" },
    });

    if (customPricingSetting && customPricingSetting.value) {
      const raw = JSON.parse(customPricingSetting.value);
      const parsed = pricingOverridesUpdateSchema.safeParse(raw);
      if (parsed.success) {
        categories = parsed.data.categories;
        types = parsed.data.types;
        features = parsed.data.features;
        matrixPackages = parsed.data.matrixPackages;
        settings = {
          ...DEFAULT_BACKEND_PRICING_DATA.settings,
          ...parsed.data.settings,
        };
      } else {
        logger.warn(
          "[Pricing Service] Stored pricing_overrides failed schema validation, falling back to safe defaults",
          { errors: parsed.error.flatten() },
        );
      }
    }
  } catch (dbErr) {
    logger.warn("[Pricing Service] Database read failed or JSON corrupt, using safe defaults", {
      error: String(dbErr),
    });
  }

  const result: BackendPricingData = {
    categories,
    types,
    features,
    matrixPackages,
    matrixCategories,
    matrixFeatures,
    settings,
  };

  // 3. Populate Redis cache
  try {
    await cacheSet(PRICING_CACHE_KEY, result, PRICING_CACHE_TTL_SECONDS);
  } catch (cacheSetErr) {
    logger.warn("[Pricing Service] Failed to populate Redis cache", {
      error: String(cacheSetErr),
    });
  }

  return result;
}

/**
 * Validates, persists, and invalidates caches for updated pricing overrides.
 */
export async function savePricingOverrides(
  payload: unknown,
): Promise<PricingSaveResult> {
  // 1. Server-side validation with Zod
  const validated = pricingOverridesUpdateSchema.parse(payload);

  // 2. Atomic database write via transaction
  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: "pricing_overrides" },
      update: {
        value: JSON.stringify(validated),
        isPublic: true,
        updatedAt: new Date(),
      },
      create: {
        key: "pricing_overrides",
        value: JSON.stringify(validated),
        description: "Custom pricing rates and configurator catalog overrides",
        isPublic: true,
      },
    }),
  ]);

  // 3. Invalidate Redis and trigger Next.js path revalidation
  const invalidatedKeys: string[] = [];
  const revalidatedPaths: string[] = [];
  const cacheErrors: string[] = [];

  try {
    const deleted = await cacheDel([PRICING_CACHE_KEY]);
    if (deleted) {
      invalidatedKeys.push(PRICING_CACHE_KEY);
      logger.info("[Pricing Service] Redis pricing cache successfully purged");
    }
  } catch (err) {
    const msg = `Redis cache deletion failed: ${String(err)}`;
    logger.warn("[Pricing Service] " + msg);
    cacheErrors.push(msg);
  }

  const pathsToRevalidate = ["/pricing", "/admin/pricing"];
  for (const path of pathsToRevalidate) {
    try {
      revalidatePath(path);
      revalidatedPaths.push(path);
    } catch (err) {
      const msg = `Failed to revalidate path ${path}: ${String(err)}`;
      logger.warn("[Pricing Service] " + msg);
      cacheErrors.push(msg);
    }
  }

  return {
    success: true,
    data: validated,
    meta: {
      cacheRefreshed: cacheErrors.length === 0,
      cacheErrors,
      invalidatedKeys,
      revalidatedPaths,
    },
  };
}

/**
 * Transforms BackendPricingData into EstimatorCalculationConfig for calculatePricing / AI Consultant.
 */
export function getPricingCalculationConfig(
  pricingData?: BackendPricingData,
): EstimatorCalculationConfig {
  if (!pricingData) return {};
  return {
    categories: pricingData.categories,
    types: pricingData.types,
    features: pricingData.features,
    pageSettings: {
      basePagesIncluded: pricingData.settings?.basePagesIncluded,
      costPerExtraPage: pricingData.settings?.costPerExtraPage,
      discountForOnePage: pricingData.settings?.discountForOnePage,
    },
    pricingSettings: {
      currency: pricingData.settings?.currency,
      currencySymbol: pricingData.settings?.currencySymbol,
      minProjectCost: pricingData.settings?.minProjectCost,
      expressMultiplier: pricingData.settings?.expressMultiplier,
    },
  };
}

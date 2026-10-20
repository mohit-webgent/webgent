import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/db";
import {
  getPricingData,
  savePricingOverrides,
  getPricingCalculationConfig,
  pricingOverridesUpdateSchema,
  DEFAULT_PRICING_OVERRIDES_PAYLOAD,
  PRICING_CACHE_KEY,
} from "../src/lib/services/pricing";
import {
  calculatePricing,
  WEBSITE_CATEGORIES,
  WEBSITE_TYPES,
  POPULAR_FEATURES,
  PAGE_SETTINGS,
  PRICING_SETTINGS,
} from "../src/lib/pricing.config";
import { calculateProjectEstimate } from "../src/lib/services/ai-consultant/calculator";
import {
  GET as adminPricingGet,
  PUT as adminPricingPut,
} from "../src/app/api/admin/pricing/route";
import { GET as publicPricingGet } from "../src/app/api/pricing/route";
import { setAuthSessionResolver } from "../src/lib/auth-utils";
import type { Session } from "next-auth";

function createMockSession(
  role: "ADMIN" | "EDITOR" | "USER",
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" = "ACTIVE",
): Session {
  return {
    user: {
      id: `test-pricing-${role.toLowerCase()}-${status.toLowerCase()}`,
      name: `Test ${role}`,
      email: `${role.toLowerCase()}@webgent.com`,
      role,
      status,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}

describe("Pricing & Packages Manager (Step 3B) Suite", () => {
  // -------------------------------------------------------------------------
  // 1. Zod Validation & Schema Safety
  // -------------------------------------------------------------------------
  describe("Pricing Overrides Schema Validation", () => {
    it("validates a compliant pricing override payload successfully", () => {
      const parsed = pricingOverridesUpdateSchema.safeParse(DEFAULT_PRICING_OVERRIDES_PAYLOAD);
      assert.ok(parsed.success, "Default payload must pass validation");
    });

    it("rejects negative or below-minimum package prices", () => {
      const invalid = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        matrixPackages: {
          ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages,
          starter: {
            ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages.starter,
            startingPrice: -500, // Invalid negative price
          },
        },
      };
      const parsed = pricingOverridesUpdateSchema.safeParse(invalid);
      assert.strictEqual(parsed.success, false);
    });

    it("rejects package prices below minimum ₹1,000 threshold", () => {
      const invalid = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        matrixPackages: {
          ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages,
          starter: {
            ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages.starter,
            startingPrice: 500, // Below minimum 1000
          },
        },
      };
      const parsed = pricingOverridesUpdateSchema.safeParse(invalid);
      assert.strictEqual(parsed.success, false);
    });

    it("rejects packages without required key highlights", () => {
      const invalid = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        matrixPackages: {
          ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages,
          starter: {
            ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages.starter,
            keyHighlights: [], // Must have at least 1
          },
        },
      };
      const parsed = pricingOverridesUpdateSchema.safeParse(invalid);
      assert.strictEqual(parsed.success, false);
    });

    it("rejects categories containing duplicate IDs", () => {
      const duplicateCats = [
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.categories,
        { ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.categories[0] }, // Duplicate
      ];
      const invalid = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        categories: duplicateCats,
      };
      const parsed = pricingOverridesUpdateSchema.safeParse(invalid);
      assert.strictEqual(parsed.success, false);
    });

    it("rejects features containing duplicate IDs", () => {
      const duplicateFeats = [
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.features,
        { ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.features[0] }, // Duplicate
      ];
      const invalid = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        features: duplicateFeats,
      };
      const parsed = pricingOverridesUpdateSchema.safeParse(invalid);
      assert.strictEqual(parsed.success, false);
    });

    it("rejects negative add-on feature prices", () => {
      const invalidFeats = DEFAULT_PRICING_OVERRIDES_PAYLOAD.features.map((f, idx) =>
        idx === 0 ? { ...f, price: -100 } : f,
      );
      const invalid = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        features: invalidFeats,
      };
      const parsed = pricingOverridesUpdateSchema.safeParse(invalid);
      assert.strictEqual(parsed.success, false);
    });

    it("rejects payloads with arbitrary unsupported top-level fields (strict schema)", () => {
      const invalid = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        maliciousExecutableCode: "eval('hacked')",
        arbitraryField: true,
      };
      const parsed = pricingOverridesUpdateSchema.safeParse(invalid);
      assert.strictEqual(parsed.success, false);
    });

    it("rejects infinite and NaN numerical values", () => {
      const infinitePayload = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        settings: {
          ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings,
          minProjectCost: Infinity,
        },
      };
      const parsed = pricingOverridesUpdateSchema.safeParse(infinitePayload);
      assert.strictEqual(parsed.success, false, "Infinity must be rejected");

      const nanPayload = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        settings: {
          ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings,
          expressMultiplier: NaN,
        },
      };
      const parsedNaN = pricingOverridesUpdateSchema.safeParse(nanPayload);
      assert.strictEqual(parsedNaN.success, false, "NaN must be rejected");
    });

    it("rejects negative delivery time and days strings", () => {
      const invalidTime = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        matrixPackages: {
          ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages,
          starter: {
            ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages.starter,
            deliveryTime: "-5 days",
          },
        },
      };
      assert.strictEqual(pricingOverridesUpdateSchema.safeParse(invalidTime).success, false);

      const invalidDays = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        categories: DEFAULT_PRICING_OVERRIDES_PAYLOAD.categories.map((c, i) =>
          i === 0 ? { ...c, deliveryDays: "-3 to -5 Days" } : c,
        ),
      };
      assert.strictEqual(pricingOverridesUpdateSchema.safeParse(invalidDays).success, false);
    });

    it("rejects expressMultiplier exceeding maximum sensible boundary", () => {
      const invalidMultiplier = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        settings: {
          ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings,
          expressMultiplier: 5.0, // Maximum allowed is 2.0 (200%)
        },
      };
      assert.strictEqual(pricingOverridesUpdateSchema.safeParse(invalidMultiplier).success, false);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Server-Side Authorization Suite
  // -------------------------------------------------------------------------
  describe("Pricing Manager API Authorization", () => {
    it("rejects unauthenticated GET and PUT requests with 401 Unauthorized", async () => {
      setAuthSessionResolver(async () => null);

      try {
        const getRes = await adminPricingGet();
        assert.strictEqual(getRes.status, 401);
        const getJson = await getRes.json();
        assert.strictEqual(getJson.success, false);
        assert.strictEqual(getJson.error.code, "UNAUTHORIZED");

        const putReq = new NextRequest("http://localhost:3000/api/admin/pricing", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(DEFAULT_PRICING_OVERRIDES_PAYLOAD),
        });
        const putRes = await adminPricingPut(putReq);
        assert.strictEqual(putRes.status, 401);
        const putJson = await putRes.json();
        assert.strictEqual(putJson.success, false);
        assert.strictEqual(putJson.error.code, "UNAUTHORIZED");
      } finally {
        setAuthSessionResolver(null);
      }
    });

    it("rejects inactive users on both GET and PUT with 403 Forbidden", async () => {
      setAuthSessionResolver(async () => createMockSession("ADMIN", "INACTIVE"));

      try {
        const getRes = await adminPricingGet();
        assert.strictEqual(getRes.status, 403);
        const getJson = await getRes.json();
        assert.strictEqual(getJson.success, false);
        assert.strictEqual(getJson.error.code, "FORBIDDEN");

        const putReq = new NextRequest("http://localhost:3000/api/admin/pricing", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(DEFAULT_PRICING_OVERRIDES_PAYLOAD),
        });
        const putRes = await adminPricingPut(putReq);
        assert.strictEqual(putRes.status, 403);
      } finally {
        setAuthSessionResolver(null);
      }
    });

    it("rejects non-admin/editor roles (e.g. USER) with 403 Forbidden", async () => {
      setAuthSessionResolver(async () => createMockSession("USER", "ACTIVE"));

      try {
        const getRes = await adminPricingGet();
        assert.strictEqual(getRes.status, 403);

        const putReq = new NextRequest("http://localhost:3000/api/admin/pricing", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(DEFAULT_PRICING_OVERRIDES_PAYLOAD),
        });
        const putRes = await adminPricingPut(putReq);
        assert.strictEqual(putRes.status, 403);
      } finally {
        setAuthSessionResolver(null);
      }
    });

    it("authorizes active EDITOR users for reading and saving pricing configuration", async () => {
      setAuthSessionResolver(async () => createMockSession("EDITOR", "ACTIVE"));

      try {
        const getRes = await adminPricingGet();
        assert.strictEqual(getRes.status, 200);
        const getJson = await getRes.json();
        assert.strictEqual(getJson.success, true);
        assert.ok(getJson.data?.matrixPackages);
      } finally {
        setAuthSessionResolver(null);
      }
    });

    it("authorizes active ADMIN users for reading and saving pricing configuration", async () => {
      setAuthSessionResolver(async () => createMockSession("ADMIN", "ACTIVE"));

      try {
        const getRes = await adminPricingGet();
        assert.strictEqual(getRes.status, 200);
        const getJson = await getRes.json();
        assert.strictEqual(getJson.success, true);
        assert.ok(getJson.data?.categories);
      } finally {
        setAuthSessionResolver(null);
      }
    });

    it("confirms public GET endpoint exposes only expected public pricing keys and zero secrets", async () => {
      const res = await publicPricingGet();
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data);

      const keys = Object.keys(json.data);
      const expectedKeys = [
        "categories",
        "types",
        "features",
        "matrixPackages",
        "matrixCategories",
        "matrixFeatures",
        "settings",
      ];
      assert.deepStrictEqual(keys.sort(), expectedKeys.sort());

      // Ensure no private secrets or database internals are present
      assert.strictEqual((json.data as Record<string, unknown>).password, undefined);
      assert.strictEqual((json.data as Record<string, unknown>).secret, undefined);
      assert.strictEqual((json.data as Record<string, unknown>).apiKey, undefined);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Database Persistence, Cache Invalidation, and Fallback Lifecycle
  // -------------------------------------------------------------------------
  describe("SiteSetting Database Persistence Lifecycle", () => {
    it("persists custom package rates to PostgreSQL and reflects in getPricingData()", async () => {
      const customPayload: typeof DEFAULT_PRICING_OVERRIDES_PAYLOAD = {
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        matrixPackages: {
          ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages,
          starter: {
            ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages.starter,
            startingPrice: 12999, // Custom test rate
            tagline: "Custom Test Starter Presence",
          },
        },
      };

      // 1. Save overrides
      const saveResult = await savePricingOverrides(customPayload);
      assert.strictEqual(saveResult.success, true);
      assert.strictEqual(saveResult.data.matrixPackages.starter.startingPrice, 12999);

      // 2. Read back
      const readData = await getPricingData();
      assert.strictEqual(readData.matrixPackages.starter.startingPrice, 12999);
      assert.strictEqual(readData.matrixPackages.starter.tagline, "Custom Test Starter Presence");

      // 3. Restore defaults
      await savePricingOverrides(DEFAULT_PRICING_OVERRIDES_PAYLOAD);
      const restoredData = await getPricingData();
      assert.strictEqual(restoredData.matrixPackages.starter.startingPrice, 9999);
    });

    it("falls back safely to default pricing when database contains corrupt value", async () => {
      // Intentionally insert corrupt JSON into SiteSetting
      await prisma.siteSetting.upsert({
        where: { key: "pricing_overrides" },
        update: { value: "CORRUPT_INVALID_JSON_DATA{{{", isPublic: true },
        create: {
          key: "pricing_overrides",
          value: "CORRUPT_INVALID_JSON_DATA{{{",
          isPublic: true,
        },
      });

      // Reading should not throw and must return valid default pricing structure
      const fallbackData = await getPricingData();
      assert.ok(fallbackData);
      assert.ok(Array.isArray(fallbackData.categories));
      assert.strictEqual(fallbackData.matrixPackages.starter.startingPrice, 9999);

      // Clean up
      await prisma.siteSetting.deleteMany({
        where: { key: "pricing_overrides" },
      });
    });

    it("falls back safely to default pricing when database contains valid JSON with negative or malformed pricing fields", async () => {
      const corruptPayload = JSON.stringify({
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        settings: {
          ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings,
          minProjectCost: -5000, // Invalid negative minProjectCost
        },
      });

      await prisma.siteSetting.upsert({
        where: { key: "pricing_overrides" },
        update: { value: corruptPayload, isPublic: true },
        create: { key: "pricing_overrides", value: corruptPayload, isPublic: true },
      });

      const fallbackData = await getPricingData();
      assert.ok(fallbackData);
      assert.strictEqual(
        fallbackData.settings.minProjectCost,
        PRICING_SETTINGS.minProjectCost,
        "Corrupt settings must safely fall back to production defaults",
      );

      // Clean up
      await prisma.siteSetting.deleteMany({
        where: { key: "pricing_overrides" },
      });
    });
  });

  // -------------------------------------------------------------------------
  // 4. Pricing & AI Consultant Estimator Consistency
  // -------------------------------------------------------------------------
  describe("Pricing Engine & AI Consultant Calculator Consistency", () => {
    it("ensures calculatePricing and calculateProjectEstimate calculate identical base rates", () => {
      // Test baseline business project
      const pricingRes = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: ["contact_form", "whatsapp_chat", "seo_basic"],
        deliverySpeed: "standard",
      });

      const estimateRes = calculateProjectEstimate({
        categoryKey: "business",
        architecture: "static",
        pageCount: 5,
        selectedFeatureIds: ["contact_form", "whatsapp_chat", "seo_basic"],
        deliverySpeed: "standard",
      });

      assert.strictEqual(
        pricingRes.baseCategoryPrice,
        estimateRes.cost.baseCategoryPriceINR,
        "Base category price must match between calculator and estimator",
      );
      assert.strictEqual(
        pricingRes.grandTotal,
        estimateRes.cost.oneTimeTotalINR,
        "Total one-time cost must match between calculator and estimator",
      );
    });

    it("propagates custom category and feature rates to both calculator and AI Consultant", () => {
      // Define custom configuration with updated E-Commerce starting price
      const customConfig = getPricingCalculationConfig({
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        matrixCategories: [],
        matrixFeatures: [],
        categories: DEFAULT_PRICING_OVERRIDES_PAYLOAD.categories.map((c) =>
          c.id === "ecommerce" ? { ...c, startingPrice: 24999 } : c,
        ),
        features: DEFAULT_PRICING_OVERRIDES_PAYLOAD.features.map((f) =>
          f.id === "ai_chatbot" ? { ...f, price: 10000 } : f,
        ),
      });

      // Calculate via pure pricing engine
      const pricingRes = calculatePricing(
        {
          categoryId: "ecommerce",
          typeId: "dynamic",
          pageCount: 5,
          selectedFeatureIds: ["ai_chatbot"],
        },
        customConfig,
      );

      // Calculate via AI Consultant estimator passing the same config
      const estimateRes = calculateProjectEstimate(
        {
          categoryKey: "ecommerce",
          architecture: "dynamic",
          pageCount: 5,
          selectedFeatureIds: ["ai_chatbot"],
        },
        customConfig,
      );

      // Verify base category price reflects the ₹24,999 override in both
      assert.strictEqual(pricingRes.baseCategoryPrice, 24999);
      assert.strictEqual(estimateRes.cost.baseCategoryPriceINR, 24999);

      // Verify grand total matches between both engines
      assert.strictEqual(pricingRes.grandTotal, estimateRes.cost.oneTimeTotalINR);
    });

    it("guarantees deterministic auto-switch to dynamic cannot be bypassed by price edits", () => {
      // Even if an admin sets dynamic cost or features, choosing payment_gateway
      // must deterministically enforce dynamic architecture
      const result = calculateProjectEstimate({
        categoryKey: "business",
        architecture: "static", // User asked for static
        selectedFeatureIds: ["payment_gateway"], // Requires dynamic
      });

      assert.strictEqual(
        result.architecture,
        "dynamic",
        "Deterministic dependency check must auto-switch static to dynamic",
      );
      assert.strictEqual(result.autoSwitchedToDynamic, true);
    });

    it("produces strictly identical calculations across pure engine and AI Consultant when tuning architecture, page counts, floors, and express multipliers", () => {
      const tunedConfig = getPricingCalculationConfig({
        ...DEFAULT_PRICING_OVERRIDES_PAYLOAD,
        matrixCategories: [],
        matrixFeatures: [],
        categories: DEFAULT_PRICING_OVERRIDES_PAYLOAD.categories.map((c) =>
          c.id === "saas" ? { ...c, startingPrice: 40000 } : c,
        ),
        types: DEFAULT_PRICING_OVERRIDES_PAYLOAD.types.map((t) =>
          t.id === "dynamic" ? { ...t, additionalCost: 12000 } : t,
        ),
        features: DEFAULT_PRICING_OVERRIDES_PAYLOAD.features.map((f) =>
          f.id === "ai_chatbot" ? { ...f, price: 9000 } : f,
        ),
        settings: {
          basePagesIncluded: 6,
          costPerExtraPage: 2000,
          discountForOnePage: 2500,
          currency: "INR",
          currencySymbol: "₹",
          minProjectCost: 20000,
          expressMultiplier: 0.3,
        },
      });

      // Saas with express delivery, 8 pages (2 extra pages * 2000 = 4000), dynamic (12000), ai_chatbot (9000)
      // Base: 40000 + Type: 12000 + Pages: 4000 + Feats: 9000 = Subtotal: 65000.
      // Express: 65000 * 0.3 = 19500. GrandTotal = 84500.
      const pricingRes = calculatePricing(
        {
          categoryId: "saas",
          typeId: "dynamic",
          pageCount: 8,
          selectedFeatureIds: ["ai_chatbot"],
          deliverySpeed: "express",
        },
        tunedConfig,
      );

      const estimateRes = calculateProjectEstimate(
        {
          categoryKey: "saas",
          architecture: "dynamic",
          pageCount: 8,
          selectedFeatureIds: ["ai_chatbot"],
          deliverySpeed: "express",
        },
        tunedConfig,
      );

      assert.strictEqual(pricingRes.baseCategoryPrice, 40000);
      assert.strictEqual(estimateRes.cost.baseCategoryPriceINR, 40000);
      assert.strictEqual(pricingRes.typePrice, 12000);
      assert.strictEqual(estimateRes.cost.architectureTypePriceINR, 12000);
      assert.strictEqual(pricingRes.pagesPrice, 4000);
      assert.strictEqual(estimateRes.cost.pagesPriceINR, 4000);
      assert.strictEqual(pricingRes.featuresCost, 9000);
      assert.strictEqual(estimateRes.cost.featuresTotalINR, 9000);
      assert.strictEqual(pricingRes.expressPrice, 19500);
      assert.strictEqual(estimateRes.cost.expressDeliveryPriceINR, 19500);
      assert.strictEqual(pricingRes.grandTotal, 84500);
      assert.strictEqual(estimateRes.cost.oneTimeTotalINR, 84500);
      assert.strictEqual(pricingRes.grandTotal, estimateRes.cost.oneTimeTotalINR);
    });
  });
});

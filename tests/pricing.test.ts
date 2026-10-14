import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculatePricing,
  WEBSITE_CATEGORIES,
  WEBSITE_TYPES,
  POPULAR_FEATURES,
  DYNAMIC_REQUIRED_FEATURES,
  FEATURE_ID_ALIASES,
  normalizeFeatureId,
  featureRequiresDynamic,
} from "../src/lib/pricing.config";

describe("Webgent Pricing & Estimator Suite", () => {
  // -------------------------------------------------------------------------
  // 1. Category Base Calculations
  // -------------------------------------------------------------------------
  describe("Category Base Calculations", () => {
    it("should correctly calculate prices for all 9 categories with defaults", () => {
      for (const cat of WEBSITE_CATEGORIES) {
        const result = calculatePricing({
          categoryId: cat.id,
          pageCount: cat.recommendedPages,
          selectedFeatureIds: cat.defaultFeatures,
        });

        assert.equal(result.category.id, cat.id, `Category ID matches ${cat.id}`);
        assert.equal(result.baseCategoryPrice, cat.startingPrice, `Base price matches ${cat.startingPrice}`);

        // Breakdown check
        const calculatedTotal =
          result.baseCategoryPrice +
          result.typePrice +
          result.pagesPrice +
          result.featuresCost +
          result.expressPrice;

        assert.equal(
          result.grandTotal,
          Math.max(4999, calculatedTotal),
          `Grand total matches breakdown sum for ${cat.id}`
        );
      }
    });

    it("verifies Business category starting base is 9,999", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: [],
        deliverySpeed: "standard",
      });
      assert.equal(res.baseCategoryPrice, 9999);
      assert.equal(res.typePrice, 0);
      assert.equal(res.pagesPrice, 0);
      assert.equal(res.featuresCost, 0);
      assert.equal(res.grandTotal, 9999);
    });

    it("verifies E-Commerce category starting base is 19,999", () => {
      const res = calculatePricing({
        categoryId: "ecommerce",
        typeId: "dynamic",
        pageCount: 5,
        selectedFeatureIds: [],
        deliverySpeed: "standard",
      });
      assert.equal(res.baseCategoryPrice, 19999);
      assert.equal(res.typePrice, 8000);
      assert.equal(res.grandTotal, 27999);
    });

    it("verifies SaaS category starting base is 34,999", () => {
      const res = calculatePricing({
        categoryId: "saas",
        typeId: "dynamic",
        pageCount: 5,
        selectedFeatureIds: [],
        deliverySpeed: "standard",
      });
      assert.equal(res.baseCategoryPrice, 34999);
      assert.equal(res.typePrice, 8000);
      assert.equal(res.grandTotal, 42999);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Page Count Calculations & Clamping
  // -------------------------------------------------------------------------
  describe("Page Count Calculations", () => {
    it("applies -2,000 discount for a 1-page landing site", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 1,
        selectedFeatureIds: [],
        deliverySpeed: "standard",
      });
      assert.equal(res.pagesPrice, -2000);
      assert.equal(res.grandTotal, 9999 - 2000); // 7999
    });

    it("charges 0 extra for 5 pages (base package)", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: [],
        deliverySpeed: "standard",
      });
      assert.equal(res.pagesPrice, 0);
      assert.equal(res.grandTotal, 9999);
    });

    it("charges +1,000 per extra page beyond 5", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 8,
        selectedFeatureIds: [],
        deliverySpeed: "standard",
      });
      // 3 extra pages * 1000 = 3000
      assert.equal(res.pagesPrice, 3000);
      assert.equal(res.grandTotal, 9999 + 3000);
    });

    it("clamps page count to min (1) and max (30)", () => {
      const low = calculatePricing({
        categoryId: "business",
        pageCount: -5,
        selectedFeatureIds: [],
      });
      assert.equal(low.pageCount, 1);
      assert.equal(low.pagesPrice, -2000);

      const high = calculatePricing({
        categoryId: "business",
        pageCount: 100,
        selectedFeatureIds: [],
      });
      assert.equal(high.pageCount, 30);
      assert.equal(high.pagesPrice, 25 * 1000); // 25,000
    });
  });

  // -------------------------------------------------------------------------
  // 3. Express Delivery Calculation
  // -------------------------------------------------------------------------
  describe("Delivery Speed & Express Surcharge", () => {
    it("applies 0 express surcharge for standard delivery", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: [],
        deliverySpeed: "standard",
      });
      assert.equal(res.expressPrice, 0);
      assert.equal(res.grandTotal, res.subtotal);
    });

    it("applies +20% rounded surcharge for express delivery", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: [],
        deliverySpeed: "express",
      });
      // Subtotal = 9,999. Express = Math.round(9999 * 0.2) = 2000.
      assert.equal(res.subtotal, 9999);
      assert.equal(res.expressPrice, 2000);
      assert.equal(res.grandTotal, 9999 + 2000); // 11999
      assert.equal(res.estimatedDays, "Fast-Track Priority (3–5 Days)");
    });
  });

  // -------------------------------------------------------------------------
  // 4. Dynamic Architecture Dependency Auto-Switching
  // -------------------------------------------------------------------------
  describe("Dynamic Architecture Dependency Auto-Switching", () => {
    it("verifies all 5 required features in DYNAMIC_REQUIRED_FEATURES list", () => {
      const expected = [
        "user_login",
        "admin_dashboard",
        "blog",
        "payment_gateway",
        "booking_calendar",
      ];
      assert.deepEqual([...DYNAMIC_REQUIRED_FEATURES], expected);
    });

    it("auto-switches to dynamic when Payment Gateway is selected on static", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: ["payment_gateway"],
        deliverySpeed: "standard",
      });

      assert.equal(res.effectiveTypeId, "dynamic");
      assert.equal(res.autoSwitchedToDynamic, true);
      assert.equal(res.typePrice, 8000);
      assert.equal(res.requiresDynamic, true);
      assert.equal(res.conflictingFeatures.length, 1);
      assert.equal(res.conflictingFeatures[0].id, "payment_gateway");
      // Total: Base 9999 + Type 8000 + Feat 4500 = 22499
      assert.equal(res.featuresCost, 4500);
      assert.equal(res.grandTotal, 9999 + 8000 + 4500);
    });

    it("auto-switches to dynamic when user_login is selected on static", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: ["user_login"],
      });
      assert.equal(res.effectiveTypeId, "dynamic");
      assert.equal(res.autoSwitchedToDynamic, true);
      assert.equal(res.typePrice, 8000);
      assert.equal(res.featuresCost, 3500);
    });

    it("auto-switches to dynamic when booking_calendar is selected on static", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: ["booking_calendar"],
      });
      assert.equal(res.effectiveTypeId, "dynamic");
      assert.equal(res.autoSwitchedToDynamic, true);
      assert.equal(res.typePrice, 8000);
      assert.equal(res.featuresCost, 4000);
    });

    it("auto-switches to dynamic when blog is selected on static", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: ["blog"],
      });
      assert.equal(res.effectiveTypeId, "dynamic");
      assert.equal(res.autoSwitchedToDynamic, true);
      assert.equal(res.typePrice, 8000);
      assert.equal(res.featuresCost, 3500);
    });

    it("auto-switches to dynamic when admin_dashboard is selected on static and bundles it free", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: ["admin_dashboard"],
      });
      assert.equal(res.effectiveTypeId, "dynamic");
      assert.equal(res.autoSwitchedToDynamic, true);
      assert.equal(res.typePrice, 8000);
      // admin_dashboard has includedInDynamic: true -> 0 added to feature cost
      assert.equal(res.featuresCost, 0);
      assert.equal(res.grandTotal, 9999 + 8000);
    });

    it("does not auto-switch when selecting static-safe features", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: ["contact_form", "whatsapp_chat", "seo_basic"],
      });
      assert.equal(res.effectiveTypeId, "static");
      assert.equal(res.autoSwitchedToDynamic, false);
      assert.equal(res.typePrice, 0);
      assert.equal(res.featuresCost, 1000 + 500 + 2500); // 4000
      assert.equal(res.grandTotal, 9999 + 4000);
    });
  });

  // -------------------------------------------------------------------------
  // 5. Invalid Input & Error Resilience
  // -------------------------------------------------------------------------
  describe("Invalid Input & Resilience", () => {
    it("handles unknown category ID safely by falling back to default", () => {
      const res = calculatePricing({
        categoryId: "completely_unknown_category_xyz",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: [],
      });
      assert.ok(res.category);
      assert.equal(res.category.id, "business");
      assert.equal(res.grandTotal, 9999);
    });

    it("safely ignores unknown, invalid, or null feature IDs without crashing", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: [
          "contact_form",
          "invalid_feat_123",
          "",
          null as unknown as string,
          "random_text",
        ],
      });
      assert.equal(res.selectedFeaturesList.length, 1);
      assert.equal(res.selectedFeaturesList[0].id, "contact_form");
      assert.equal(res.featuresCost, 1000);
    });

    it("resolves legacy feature ID aliases safely", () => {
      const res = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: [
          "appointment_booking", // alias for booking_calendar
          "user_auth",           // alias for user_login
          "blog_cms",            // alias for blog
        ],
      });
      // All 3 aliases require dynamic
      assert.equal(res.effectiveTypeId, "dynamic");
      assert.equal(res.autoSwitchedToDynamic, true);
      assert.equal(res.selectedFeaturesList.length, 3);
      const ids = res.selectedFeaturesList.map((f) => f.id);
      assert.ok(ids.includes("booking_calendar"));
      assert.ok(ids.includes("user_login"));
      assert.ok(ids.includes("blog"));
    });

    it("handles null or undefined input object cleanly", () => {
      const res = calculatePricing();
      assert.ok(res);
      assert.equal(res.category.id, "business");
      assert.equal(typeof res.grandTotal, "number");
      assert.ok(res.grandTotal >= 4999);
    });
  });
});

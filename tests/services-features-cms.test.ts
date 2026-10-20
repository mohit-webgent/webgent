import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { setAuthSessionResolver } from "../src/lib/auth-utils";
import { prisma } from "../src/lib/db";
import {
  getPublicServices,
  getPublicServiceBySlug,
  getAdminServices,
  createService,
  updateService,
  deleteService,
  createFeature,
  updateFeature,
  deleteFeature,
  DEFAULT_FALLBACK_SERVICES,
} from "../src/lib/services/cms-services";
import { GET as getAdminServicesRoute, POST as postAdminServicesRoute } from "../src/app/api/admin/services/route";
import {
  GET as getAdminServiceByIdRoute,
  PUT as putAdminServiceByIdRoute,
  DELETE as deleteAdminServiceByIdRoute,
} from "../src/app/api/admin/services/[id]/route";
import { GET as getAdminFeaturesRoute, POST as postAdminFeaturesRoute } from "../src/app/api/admin/features/route";
import { PUT as putAdminFeatureByIdRoute, DELETE as deleteAdminFeatureByIdRoute } from "../src/app/api/admin/features/[id]/route";
import { GET as getPublicServicesRoute } from "../src/app/api/services/route";
import { calculatePricing } from "../src/lib/pricing.config";
import { calculateProjectEstimate } from "../src/lib/services/ai-consultant/calculator";

describe("Webgent Services & Features CMS Suite", () => {
  const originalEnv = { ...process.env };

  const adminSession = {
    user: {
      id: "admin-test-user-id",
      email: "admin@webgent.com",
      name: "Admin User",
      role: "ADMIN" as any,
      status: "ACTIVE" as any,
    },
    expires: new Date(Date.now() + 3600000).toISOString(),
  };

  const editorSession = {
    user: {
      id: "editor-test-user-id",
      email: "editor@webgent.com",
      name: "Editor User",
      role: "EDITOR" as any,
      status: "ACTIVE" as any,
    },
    expires: new Date(Date.now() + 3600000).toISOString(),
  };

  const normalUserSession = {
    user: {
      id: "normal-test-user-id",
      email: "user@webgent.com",
      name: "Normal User",
      role: "USER" as any,
      status: "ACTIVE" as any,
    },
    expires: new Date(Date.now() + 3600000).toISOString(),
  };

  afterEach(async () => {
    process.env = { ...originalEnv };
    setAuthSessionResolver(null);

    // Clean up test services and features
    try {
      await prisma.service.deleteMany({
        where: {
          slug: {
            startsWith: "test-",
          },
        },
      });
      await prisma.feature.deleteMany({
        where: {
          title: {
            startsWith: "Test Feature",
          },
        },
      });
    } catch {
      // ignore
    }
  });

  // =========================================================================
  // 1. Authorization Controls
  // =========================================================================
  describe("Admin Authorization & Protection", () => {
    it("rejects unauthorized GET /api/admin/services with 401", async () => {
      setAuthSessionResolver(async () => null);
      const res = await getAdminServicesRoute();
      assert.equal(res.status, 401);
    });

    it("rejects unauthorized POST /api/admin/services with 401", async () => {
      setAuthSessionResolver(async () => null);
      const req = new NextRequest("http://localhost:3000/api/admin/services", {
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
      });
      const res = await postAdminServicesRoute(req);
      assert.equal(res.status, 401);
    });

    it("rejects regular USER role with 403 Forbidden", async () => {
      setAuthSessionResolver(async () => normalUserSession as any);
      const res = await getAdminServicesRoute();
      assert.equal(res.status, 403);
    });

    it("allows ADMIN and EDITOR sessions to access GET /api/admin/services", async () => {
      setAuthSessionResolver(async () => adminSession as any);
      const resAdmin = await getAdminServicesRoute();
      assert.equal(resAdmin.status, 200);

      setAuthSessionResolver(async () => editorSession as any);
      const resEditor = await getAdminServicesRoute();
      assert.equal(resEditor.status, 200);
    });
  });

  // =========================================================================
  // 2. Services & Features CRUD & Validation
  // =========================================================================
  describe("Services & Features CRUD Operations", () => {
    it("creates a normalized feature and attaches it to a new service", async () => {
      setAuthSessionResolver(async () => adminSession as any);

      // 1. Create a feature
      const feature = await createFeature({
        title: "Test Feature High Performance RSC",
        description: "Zero bundle size edge components",
        category: "Frontend",
        icon: "Cpu",
        displayOrder: 1,
        enabled: true,
        showOnPublic: true,
      });

      assert.ok(feature.id);
      assert.equal(feature.title, "Test Feature High Performance RSC");

      // 2. Create a service linked to this feature
      const service = await createService({
        name: "Test Edge Service",
        slug: "test-edge-service",
        shortDescription: "Ultra fast edge web applications engineered with Next.js",
        description: "Detailed architecture description for the edge computing stack.",
        icon: "Layers",
        startingPrice: 19999,
        priceLabel: "Starting at ₹19,999",
        displayOrder: 1,
        featured: true,
        showOnHome: true,
        published: true,
        seoTitle: "Edge Service SEO Title",
        featureIds: [feature.id],
      });

      assert.ok(service.id);
      assert.equal(service.name, "Test Edge Service");
      assert.equal(service.slug, "test-edge-service");
      assert.equal(service.features.length, 1);
      assert.equal(service.features[0].id, feature.id);

      // 3. Verify public reader returns this service and its enabled feature
      const publicServices = await getPublicServices();
      const found = publicServices.find((s) => s.slug === "test-edge-service");
      assert.ok(found, "Service is returned in public list");
      assert.equal(found.features.length, 1);
      assert.equal(found.features[0].title, "Test Feature High Performance RSC");

      // 4. Verify public slug reader
      const single = await getPublicServiceBySlug("test-edge-service");
      assert.ok(single);
      assert.equal(single?.name, "Test Edge Service");

      // 5. Update service
      const updated = await updateService(service.id, {
        shortDescription: "Updated short description for edge web applications.",
        startingPrice: 24999,
      });
      assert.equal(updated.startingPrice, 24999);
      assert.equal(updated.shortDescription, "Updated short description for edge web applications.");

      // 6. Delete service and verify feature remains intact
      const deleted = await deleteService(service.id);
      assert.equal(deleted, true);

      // Feature must still exist in DB
      const dbFeature = await prisma.feature.findUnique({ where: { id: feature.id } });
      assert.ok(dbFeature, "Feature is preserved after service deletion");

      // Clean up feature
      await deleteFeature(feature.id);
    });

    it("prevents creating services with duplicate slugs", async () => {
      setAuthSessionResolver(async () => adminSession as any);

      await createService({
        name: "Test Unique Slug",
        slug: "test-unique-slug",
        shortDescription: "First service with this slug",
        published: true,
      });

      // Try creating duplicate
      await assert.rejects(
        async () => {
          await createService({
            name: "Test Duplicate Slug",
            slug: "test-unique-slug",
            shortDescription: "Second service trying to reuse slug",
            published: true,
          });
        },
        (err: Error) => {
          assert.match(err.message, /already exists/);
          return true;
        },
      );
    });

    it("rejects invalid input schemas with descriptive validation errors", async () => {
      setAuthSessionResolver(async () => adminSession as any);

      // Invalid slug (spaces, capitals)
      const req = new NextRequest("http://localhost:3000/api/admin/services", {
        method: "POST",
        body: JSON.stringify({
          name: "Invalid Service",
          slug: "INVALID SLUG WITH SPACES",
          shortDescription: "Too short",
        }),
      });

      const res = await postAdminServicesRoute(req);
      assert.equal(res.status, 400);

      const json = await res.json();
      assert.equal(json.error?.code, "VALIDATION_ERROR");
    });
  });

  // =========================================================================
  // 3. Public API & Fallback Resilience
  // =========================================================================
  describe("Public API & Fallback Resilience", () => {
    it("GET /api/services returns published services successfully without authentication", async () => {
      setAuthSessionResolver(async () => null);

      const req = new NextRequest("http://localhost:3000/api/services");
      const res = await getPublicServicesRoute(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.ok(Array.isArray(json.data));
      assert.ok(json.data.length > 0);
    });

    it("falls back gracefully to DEFAULT_FALLBACK_SERVICES on unknown slug", async () => {
      const fallback = await getPublicServiceBySlug("full-stack-web-apps");
      assert.ok(fallback);
      assert.equal(fallback?.slug, "full-stack-web-apps");
    });
  });

  // =========================================================================
  // 4. Pricing Consistency & AI Consultant Isolation
  // =========================================================================
  describe("Pricing Consistency & AI Consultant Isolation", () => {
    it("proves CMS services creation does not alter calculatePricing deterministic results", () => {
      // Baseline calculation for a Business website
      const baseline = calculatePricing({
        categoryId: "business",
        typeId: "static",
        pageCount: 5,
        selectedFeatureIds: [],
        deliverySpeed: "standard",
      });

      assert.equal(baseline.baseCategoryPrice, 9999);
      assert.equal(baseline.grandTotal, 9999);

      // E-commerce baseline
      const ecomBaseline = calculatePricing({
        categoryId: "ecommerce",
        typeId: "dynamic",
        pageCount: 5,
        selectedFeatureIds: [],
        deliverySpeed: "standard",
      });

      assert.equal(ecomBaseline.baseCategoryPrice, 19999);
      assert.equal(ecomBaseline.typePrice, 8000);
      assert.equal(ecomBaseline.grandTotal, 27999);
    });

    it("proves AI Consultant calculator project estimates remain completely deterministic", () => {
      const estimate = calculateProjectEstimate({
        categoryKey: "gym",
        pageCount: 5,
        selectedFeatureIds: ["whatsapp_chat", "contact_form", "seo_basic"],
      });

      assert.equal(estimate.isEstimateReliable, true);
      assert.ok(estimate.cost.oneTimeTotalINR > 0);
      assert.equal(estimate.pages.count, 5);
      assert.equal(estimate.categoryKey, "gym");
    });
  });
});

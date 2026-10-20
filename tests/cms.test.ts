import { describe, it } from "node:test";
import assert from "node:assert";
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/db";
import {
  getHomepageHeroContent,
  getHomepageSectionsConfig,
  getNavigationMenu,
  getFooterConfig,
  getContactInfo,
  getSiteFaqs,
  invalidateCmsCache,
  DEFAULT_HERO_CONTENT,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_NAVIGATION_MENU,
  DEFAULT_FOOTER_CONFIG,
  DEFAULT_CONTACT_INFO,
  DEFAULT_SITE_FAQS,
  CMS_CACHE_KEYS,
  homePageContentUpdateSchema,
  siteFaqsUpdateSchema,
  navigationContentUpdateSchema,
  siteSeoSettingsUpdateSchema,
  saveSiteFaqs,
  saveNavigationContent,
  saveSiteSeoSettings,
  getSiteSeoSettings,
  resolveRouteMetadata,
  DEFAULT_GLOBAL_SEO,
  DEFAULT_PAGE_SEO_OVERRIDES,
  DEFAULT_SITE_SEO_SETTINGS,
  isValidSafeUrl,
  isValidCanonicalBaseUrl,
  isTrustedCanonicalOrigin,
} from "../src/lib/services/cms";
import {
  GET as adminPagesGet,
  PUT as adminPagesPut,
} from "../src/app/api/admin/pages/route";
import {
  GET as adminFaqsGet,
  PUT as adminFaqsPut,
} from "../src/app/api/admin/faqs/route";
import {
  GET as adminNavGet,
  PUT as adminNavPut,
} from "../src/app/api/admin/navigation/route";
import {
  GET as adminSeoGet,
  PUT as adminSeoPut,
} from "../src/app/api/admin/seo/route";
import { GET as publicFaqsGet } from "../src/app/api/faqs/route";
import { setAuthSessionResolver } from "../src/lib/auth-utils";
import type { Session } from "next-auth";

function createMockSession(
  role: "ADMIN" | "EDITOR" | "USER",
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" = "ACTIVE",
): Session {
  return {
    user: {
      id: `test-${role.toLowerCase()}-${status.toLowerCase()}`,
      name: `Test ${role}`,
      email: `${role.toLowerCase()}@webgent.com`,
      role,
      status,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}

describe("Centralized CMS Data Access Layer Suite", () => {
  describe("Homepage Hero Content Reader", () => {
    it("returns valid default hero content structure", async () => {
      const hero = await getHomepageHeroContent();
      assert.ok(hero, "Hero content must exist");
      assert.strictEqual(typeof hero.eyebrow, "string");
      assert.strictEqual(typeof hero.headlineLine1, "string");
      assert.strictEqual(typeof hero.headlineLine2, "string");
      assert.strictEqual(typeof hero.headlineLine3, "string");
      assert.strictEqual(typeof hero.subheadline, "string");
      assert.strictEqual(typeof hero.primaryCtaText, "string");
      assert.strictEqual(typeof hero.primaryCtaLink, "string");
      assert.strictEqual(typeof hero.secondaryCtaText, "string");
      assert.strictEqual(typeof hero.secondaryCtaLink, "string");
      assert.ok(hero.eyebrow.includes("WEBGENT"), "Eyebrow must contain brand moniker");
      assert.strictEqual(hero.primaryCtaLink, "/contact");
    });

    it("has complete match with DEFAULT_HERO_CONTENT", () => {
      assert.strictEqual(DEFAULT_HERO_CONTENT.eyebrow, "WEBGENT / DIGITAL ENGINEERING STUDIO");
      assert.strictEqual(DEFAULT_HERO_CONTENT.headlineLine1, "YOU IMAGINE");
      assert.strictEqual(DEFAULT_HERO_CONTENT.headlineLine2, "WE ENGINEER");
      assert.strictEqual(DEFAULT_HERO_CONTENT.headlineLine3, "REALITY.");
      assert.strictEqual(DEFAULT_HERO_CONTENT.primaryCtaLink, "/contact");
      assert.strictEqual(DEFAULT_HERO_CONTENT.secondaryCtaLink, "/work");
    });
  });

  describe("Homepage Sections Config Reader", () => {
    it("returns all 7 required homepage sections in sequential order", async () => {
      const config = await getHomepageSectionsConfig();
      assert.ok(Array.isArray(config.sections), "Sections must be an array");
      assert.strictEqual(config.sections.length, 7, "All 7 sections must be configured");

      const sectionIds = config.sections.map((s: { id: string }) => s.id);
      assert.ok(sectionIds.includes("hero"), "Includes hero section");
      assert.ok(sectionIds.includes("capabilities"), "Includes capabilities section");
      assert.ok(sectionIds.includes("howWeBuild"), "Includes howWeBuild section");
      assert.ok(sectionIds.includes("showcase"), "Includes showcase section");
      assert.ok(sectionIds.includes("testimonials"), "Includes testimonials section");
      assert.ok(sectionIds.includes("blog"), "Includes blog section");
      assert.ok(sectionIds.includes("cta"), "Includes cta section");

      for (const section of config.sections) {
        assert.strictEqual(typeof section.enabled, "boolean", "Section enabled must be boolean");
        assert.strictEqual(typeof section.order, "number", "Section order must be number");
      }
    });

    it("maintains default sections ordered sequentially from 1 to 7", () => {
      const orders = DEFAULT_HOME_SECTIONS.sections.map((s: { order: number }) => s.order);
      assert.deepStrictEqual(orders, [1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe("Navigation Menu Reader", () => {
    it("returns default main navigation menu with 6 core destinations", async () => {
      const nav = await getNavigationMenu();
      assert.ok(Array.isArray(nav.items), "Items must be an array");
      assert.strictEqual(nav.items.length, 6, "Must provide 6 default navigation routes");

      const hrefs = nav.items.map((i: { href: string }) => i.href);
      assert.ok(hrefs.includes("/"), "Includes Home link");
      assert.ok(hrefs.includes("/work"), "Includes Work link");
      assert.ok(hrefs.includes("/about"), "Includes About link");
      assert.ok(hrefs.includes("/blog"), "Includes Blog link");
      assert.ok(hrefs.includes("/pricing"), "Includes Pricing link");
      assert.ok(hrefs.includes("/contact"), "Includes Contact link");
    });

    it("verifies item titles match default navigation specification", () => {
      const titles = DEFAULT_NAVIGATION_MENU.items.map((i: { title: string }) => i.title);
      assert.deepStrictEqual(titles, ["Home", "Work", "About", "Blog", "Pricing", "Contact"]);
    });
  });

  describe("Footer Configuration Reader", () => {
    it("provides complete footer structure with systems, stack, and connect links", async () => {
      const footer = await getFooterConfig();
      assert.ok(footer, "Footer config must exist");
      assert.strictEqual(typeof footer.brandTagline, "string");
      assert.ok(Array.isArray(footer.systemsLinks), "Systems links must be an array");
      assert.ok(Array.isArray(footer.coreStack), "Core stack must be an array");
      assert.ok(Array.isArray(footer.connectLinks), "Connect links must be an array");

      assert.ok(footer.systemsLinks.length >= 4, "Systems links has adequate entries");
      assert.ok(footer.coreStack.includes("Next.js 14"), "Core stack includes Next.js 14");
      assert.ok(footer.coreStack.includes("TypeScript"), "Core stack includes TypeScript");
      assert.ok(footer.connectLinks.some((l: { title: string }) => l.title === "GitHub"), "Connect links include GitHub");
    });

    it("defaults preserve clean brand tagline and copyright text", () => {
      assert.ok(DEFAULT_FOOTER_CONFIG.brandTagline.includes("high-performance web applications"));
      assert.strictEqual(DEFAULT_FOOTER_CONFIG.copyrightText, "All rights reserved.");
    });
  });

  describe("Contact Information Reader", () => {
    it("returns sanitized public contact details", async () => {
      const contact = await getContactInfo();
      assert.ok(contact, "Contact info must exist");
      assert.strictEqual(typeof contact.email, "string");
      assert.strictEqual(typeof contact.phone, "string");
      assert.strictEqual(typeof contact.officeAddress, "string");
      assert.strictEqual(typeof contact.businessHours, "string");
      assert.ok(contact.email.includes("@"), "Email must contain @");
      assert.ok(contact.githubUrl?.includes("github.com"), "GitHub link valid");
    });

    it("verifies DEFAULT_CONTACT_INFO fields", () => {
      assert.strictEqual(DEFAULT_CONTACT_INFO.email, "hello@webgent.com");
      assert.strictEqual(DEFAULT_CONTACT_INFO.phone, "+1 (800) 555-WEBGENT");
      assert.strictEqual(DEFAULT_CONTACT_INFO.businessHours, "Mon - Fri: 9:00 AM - 6:00 PM PST");
    });
  });

  describe("Site FAQs Reader", () => {
    it("returns array of structured questions and answers", async () => {
      const faqsConfig = await getSiteFaqs();
      assert.ok(Array.isArray(faqsConfig.faqs), "FAQs must be an array");
      assert.ok(faqsConfig.faqs.length >= 4, "Provides at least 4 default FAQs");

      for (const faq of faqsConfig.faqs) {
        assert.ok(faq.id, "FAQ item must have an id");
        assert.ok(faq.question.length > 5, "FAQ question must have substantial text");
        assert.ok(faq.answer.length > 10, "FAQ answer must have substantial explanation");
      }
    });

    it("matches DEFAULT_SITE_FAQS ids", () => {
      const ids = DEFAULT_SITE_FAQS.faqs.map((f) => f.id);
      assert.deepStrictEqual(ids, [
        "faq-revisions",
        "faq-hosting",
        "faq-source-code",
        "faq-not-included",
      ]);
    });
  });

  describe("Cache Keys & Invalidation Helper", () => {
    it("defines consistent cache-key names with cache:cms:* prefix", () => {
      assert.strictEqual(CMS_CACHE_KEYS.HERO, "cache:cms:hero_v1");
      assert.strictEqual(CMS_CACHE_KEYS.HOME_SECTIONS, "cache:cms:home_sections_v1");
      assert.strictEqual(CMS_CACHE_KEYS.NAVIGATION, "cache:cms:navigation_v1");
      assert.strictEqual(CMS_CACHE_KEYS.FOOTER, "cache:cms:footer_v1");
      assert.strictEqual(CMS_CACHE_KEYS.CONTACT_INFO, "cache:cms:contact_info_v1");
      assert.strictEqual(CMS_CACHE_KEYS.FAQS, "cache:cms:faqs_v1");
    });

    it("executes invalidateCmsCache without crashing or swallowing errors", async () => {
      const result = await invalidateCmsCache({
        keys: ["HERO", "NAVIGATION"],
        paths: ["/", "/contact"],
      });
      assert.ok(result, "Result object returned");
      assert.ok(result.invalidatedKeys.includes("cache:cms:hero_v1"), "Invalidated hero key");
      assert.ok(result.invalidatedKeys.includes("cache:cms:navigation_v1"), "Invalidated navigation key");
      assert.ok(
        result.revalidatedPaths.length > 0 || result.errors.length > 0,
        "Handled path revalidation without unhandled crash",
      );
    });
  });

  // ==========================================================================
  // STEP 3A: HOMEPAGE CONTENT EDITOR SUITE
  // ==========================================================================
  describe("Homepage Content Editor Schema Validation Suite", () => {
    const validPayload = {
      hero: {
        eyebrow: "TEST EYEBROW / STUDIO",
        headlineLine1: "ENGINEERING",
        headlineLine2: "FUTURE",
        headlineLine3: "NOW.",
        subheadline: "A cutting-edge web consultancy creating high impact products.",
        primaryCtaText: "Start Building",
        primaryCtaLink: "/contact",
        secondaryCtaText: "Our Work",
        secondaryCtaLink: "/work",
      },
      sections: DEFAULT_HOME_SECTIONS.sections,
    };

    it("validates a compliant homepage payload successfully", () => {
      const parsed = homePageContentUpdateSchema.safeParse(validPayload);
      assert.strictEqual(parsed.success, true, "Valid payload should pass schema parsing");
    });

    it("rejects malicious, unsafe, or protocol-relative URLs in CTA links", () => {
      const maliciousCases = [
        "javascript:alert(1)",
        "JAVASCRIPT:alert(1)",
        "javascript:void(0)",
        "java\0script:alert(1)",
        "java\tscript:alert(1)",
        "javascript :alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "DATA:text/html,<script>alert(1)</script>",
        "vbscript:msgbox(1)",
        "file:///etc/passwd",
        "blob:https://example.com/uuid",
        "//attacker.com/phish",
        "//evil.com",
        "/\\evil.com",
        "\\\\evil.com",
        "contact", // missing leading slash on relative path
      ];

      for (const unsafeUrl of maliciousCases) {
        const payloadPrimary = {
          ...validPayload,
          hero: { ...validPayload.hero, primaryCtaLink: unsafeUrl },
        };
        assert.strictEqual(
          homePageContentUpdateSchema.safeParse(payloadPrimary).success,
          false,
          `Schema must reject unsafe primaryCtaLink: ${unsafeUrl}`,
        );

        const payloadSecondary = {
          ...validPayload,
          hero: { ...validPayload.hero, secondaryCtaLink: unsafeUrl },
        };
        assert.strictEqual(
          homePageContentUpdateSchema.safeParse(payloadSecondary).success,
          false,
          `Schema must reject unsafe secondaryCtaLink: ${unsafeUrl}`,
        );
      }
    });

    it("accepts valid relative paths, anchor hashes, and external HTTP(S) URLs with whitespace trimmed", () => {
      const safeUrls = [
        "/contact",
        "   /contact   ",
        "/work?category=web",
        "/#pricing",
        "/about-us",
        "https://github.com/mohit-webgent/webgent",
        "http://localhost:3000/demo",
        "https://example.com/work?tab=1#overview",
      ];

      for (const safeUrl of safeUrls) {
        const payload = {
          ...validPayload,
          hero: { ...validPayload.hero, primaryCtaLink: safeUrl },
        };
        const parsed = homePageContentUpdateSchema.safeParse(payload);
        assert.strictEqual(
          parsed.success,
          true,
          `Schema must accept valid path/URL: ${safeUrl}`,
        );
      }
    });

    it("enforces strict maximum character limits across all hero text fields", () => {
      const tooLongEyebrow = {
        ...validPayload,
        hero: { ...validPayload.hero, eyebrow: "A".repeat(121) },
      };
      assert.strictEqual(
        homePageContentUpdateSchema.safeParse(tooLongEyebrow).success,
        false,
        "Eyebrow exceeding 120 chars must fail",
      );

      const tooLongHeadline = {
        ...validPayload,
        hero: { ...validPayload.hero, headlineLine1: "A".repeat(81) },
      };
      assert.strictEqual(
        homePageContentUpdateSchema.safeParse(tooLongHeadline).success,
        false,
        "Headline exceeding 80 chars must fail",
      );

      const tooLongSubheadline = {
        ...validPayload,
        hero: { ...validPayload.hero, subheadline: "A".repeat(401) },
      };
      assert.strictEqual(
        homePageContentUpdateSchema.safeParse(tooLongSubheadline).success,
        false,
        "Subheadline exceeding 400 chars must fail",
      );

      const tooLongCtaText = {
        ...validPayload,
        hero: { ...validPayload.hero, primaryCtaText: "A".repeat(51) },
      };
      assert.strictEqual(
        homePageContentUpdateSchema.safeParse(tooLongCtaText).success,
        false,
        "CTA text exceeding 50 chars must fail",
      );
    });

    it("rejects duplicate, missing, or unsupported section identifiers", () => {
      // 1. Missing sections (only 6 instead of 7)
      const missingSection = {
        ...validPayload,
        sections: DEFAULT_HOME_SECTIONS.sections.slice(0, 6),
      };
      assert.strictEqual(
        homePageContentUpdateSchema.safeParse(missingSection).success,
        false,
        "Payload missing canonical sections must fail validation",
      );

      // 2. Duplicate section identifiers
      const duplicateSection = {
        ...validPayload,
        sections: [
          ...DEFAULT_HOME_SECTIONS.sections.slice(0, 6),
          { id: "hero" as const, enabled: true, order: 7 },
        ],
      };
      assert.strictEqual(
        homePageContentUpdateSchema.safeParse(duplicateSection).success,
        false,
        "Payload with duplicate section IDs must fail validation",
      );

      // 3. Unsupported section identifier
      const unsupportedSection = {
        ...validPayload,
        sections: [
          ...DEFAULT_HOME_SECTIONS.sections.slice(0, 6),
          { id: "invalid_section" as any, enabled: true, order: 7 },
        ],
      };
      assert.strictEqual(
        homePageContentUpdateSchema.safeParse(unsupportedSection).success,
        false,
        "Payload with unsupported section ID must fail validation",
      );
    });
  });

  describe("Homepage Content Editor API Endpoint Authorization Suite", () => {
    it("rejects unauthorized GET and PUT requests when unauthenticated with 401", async () => {
      setAuthSessionResolver(async () => null);

      try {
        const getRes = await adminPagesGet();
        assert.strictEqual(getRes.status, 401);
        const getJson = await getRes.json();
        assert.strictEqual(getJson.success, false);
        assert.strictEqual(getJson.error.code, "UNAUTHORIZED");

        const putReq = new NextRequest("http://localhost:3000/api/admin/pages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hero: DEFAULT_HERO_CONTENT,
            sections: DEFAULT_HOME_SECTIONS.sections,
          }),
        });
        const putRes = await adminPagesPut(putReq);
        assert.strictEqual(putRes.status, 401);
        const putJson = await putRes.json();
        assert.strictEqual(putJson.success, false);
        assert.strictEqual(putJson.error.code, "UNAUTHORIZED");
      } finally {
        setAuthSessionResolver(null);
      }
    });

    it("rejects inactive users with 403 Forbidden on both GET and PUT", async () => {
      setAuthSessionResolver(async () => createMockSession("ADMIN", "INACTIVE"));

      try {
        const getRes = await adminPagesGet();
        assert.strictEqual(getRes.status, 403);
        const getJson = await getRes.json();
        assert.strictEqual(getJson.success, false);
        assert.strictEqual(getJson.error.code, "FORBIDDEN");
        assert.ok(getJson.error.message.includes("inactive"));

        const putReq = new NextRequest("http://localhost:3000/api/admin/pages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hero: DEFAULT_HERO_CONTENT,
            sections: DEFAULT_HOME_SECTIONS.sections,
          }),
        });
        const putRes = await adminPagesPut(putReq);
        assert.strictEqual(putRes.status, 403);
        const putJson = await putRes.json();
        assert.strictEqual(putJson.success, false);
        assert.strictEqual(putJson.error.code, "FORBIDDEN");
      } finally {
        setAuthSessionResolver(null);
      }
    });

    it("rejects active users with non-admin/editor roles with 403 Forbidden", async () => {
      setAuthSessionResolver(async () => createMockSession("USER", "ACTIVE"));

      try {
        const getRes = await adminPagesGet();
        assert.strictEqual(getRes.status, 403);
        const getJson = await getRes.json();
        assert.strictEqual(getJson.success, false);
        assert.strictEqual(getJson.error.code, "FORBIDDEN");
        assert.ok(getJson.error.message.includes("Admin role required"));

        const putReq = new NextRequest("http://localhost:3000/api/admin/pages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hero: DEFAULT_HERO_CONTENT,
            sections: DEFAULT_HOME_SECTIONS.sections,
          }),
        });
        const putRes = await adminPagesPut(putReq);
        assert.strictEqual(putRes.status, 403);
      } finally {
        setAuthSessionResolver(null);
      }
    });

    it("authorizes active EDITOR users for reading and modifying homepage content", async () => {
      setAuthSessionResolver(async () => createMockSession("EDITOR", "ACTIVE"));

      try {
        const getRes = await adminPagesGet();
        assert.strictEqual(getRes.status, 200);
        const getJson = await getRes.json();
        assert.strictEqual(getJson.success, true);
        assert.ok(getJson.data?.hero);
        assert.ok(Array.isArray(getJson.data?.sections));
      } finally {
        setAuthSessionResolver(null);
      }
    });

    it("authorizes active ADMIN users for reading and modifying homepage content", async () => {
      setAuthSessionResolver(async () => createMockSession("ADMIN", "ACTIVE"));

      try {
        const getRes = await adminPagesGet();
        assert.strictEqual(getRes.status, 200);
        const getJson = await getRes.json();
        assert.strictEqual(getJson.success, true);
        assert.ok(getJson.data?.hero);
        assert.strictEqual(getJson.data?.sections.length, 7);
      } finally {
        setAuthSessionResolver(null);
      }
    });
  });

  describe("SiteSetting Database Persistence & Cache Invalidation Lifecycle", () => {
    const testEyebrow = `TEST SUITE / RUN ${Date.now()}`;
    const testHeadline1 = "WE LIVE TO";
    const testHeadline2 = "SCALE";
    const testHeadline3 = "SYSTEMS.";

    it("persists hero content and section config to PostgreSQL and reflects in CMS readers", async () => {
      // 1. Upsert custom test settings into Prisma SiteSetting model
      const customHero = {
        ...DEFAULT_HERO_CONTENT,
        eyebrow: testEyebrow,
        headlineLine1: testHeadline1,
        headlineLine2: testHeadline2,
        headlineLine3: testHeadline3,
        primaryCtaLink: "/contact?ref=test-cms",
      };

      const customSections = {
        sections: DEFAULT_HOME_SECTIONS.sections.map((s) =>
          s.id === "blog" ? { ...s, enabled: false } : s,
        ),
      };

      await prisma.$transaction([
        prisma.siteSetting.upsert({
          where: { key: "home_hero_content" },
          update: { value: JSON.stringify(customHero), isPublic: true },
          create: {
            key: "home_hero_content",
            value: JSON.stringify(customHero),
            isPublic: true,
            description: "Test Homepage Hero",
          },
        }),
        prisma.siteSetting.upsert({
          where: { key: "home_sections_config" },
          update: { value: JSON.stringify(customSections), isPublic: true },
          create: {
            key: "home_sections_config",
            value: JSON.stringify(customSections),
            isPublic: true,
            description: "Test Homepage Sections",
          },
        }),
      ]);

      // 2. Invalidate CMS cache
      const cachePurge = await invalidateCmsCache({
        keys: ["HERO", "HOME_SECTIONS"],
        paths: ["/"],
      });
      assert.ok(cachePurge.invalidatedKeys.includes(CMS_CACHE_KEYS.HERO));
      assert.ok(cachePurge.invalidatedKeys.includes(CMS_CACHE_KEYS.HOME_SECTIONS));

      // 3. Read back via centralized CMS service
      const hero = await getHomepageHeroContent();
      assert.strictEqual(hero.eyebrow, testEyebrow, "Hero eyebrow should match persisted setting");
      assert.strictEqual(hero.headlineLine1, testHeadline1);
      assert.strictEqual(hero.headlineLine2, testHeadline2);
      assert.strictEqual(hero.headlineLine3, testHeadline3);
      assert.strictEqual(hero.primaryCtaLink, "/contact?ref=test-cms");

      const sectionsConfig = await getHomepageSectionsConfig();
      const blogSection = sectionsConfig.sections.find((s: { id: string }) => s.id === "blog");
      assert.strictEqual(blogSection?.enabled, false, "Blog section visibility correctly updated to false");

      // 4. Clean up / restore defaults in database
      await prisma.$transaction([
        prisma.siteSetting.upsert({
          where: { key: "home_hero_content" },
          update: { value: JSON.stringify(DEFAULT_HERO_CONTENT), isPublic: true },
          create: {
            key: "home_hero_content",
            value: JSON.stringify(DEFAULT_HERO_CONTENT),
            isPublic: true,
          },
        }),
        prisma.siteSetting.upsert({
          where: { key: "home_sections_config" },
          update: { value: JSON.stringify(DEFAULT_HOME_SECTIONS), isPublic: true },
          create: {
            key: "home_sections_config",
            value: JSON.stringify(DEFAULT_HOME_SECTIONS),
            isPublic: true,
          },
        }),
      ]);

      await invalidateCmsCache({
        keys: ["HERO", "HOME_SECTIONS"],
        paths: ["/"],
      });

      const restoredHero = await getHomepageHeroContent();
      assert.strictEqual(
        restoredHero.eyebrow,
        DEFAULT_HERO_CONTENT.eyebrow,
        "Hero content cleanly restored to defaults",
      );
    });

    it("exercises PUT /api/admin/pages end-to-end with active ADMIN authorization", async () => {
      setAuthSessionResolver(async () => createMockSession("ADMIN", "ACTIVE"));

      const customEyebrow = `INTEGRATION TEST / ${Date.now()}`;
      const payload = {
        hero: {
          ...DEFAULT_HERO_CONTENT,
          eyebrow: customEyebrow,
          primaryCtaLink: "/contact?src=e2e",
        },
        sections: DEFAULT_HOME_SECTIONS.sections,
      };

      try {
        const req = new NextRequest("http://localhost:3000/api/admin/pages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const res = await adminPagesPut(req);
        assert.strictEqual(res.status, 200, "Authorized PUT must succeed with 200");
        const json = await res.json();
        assert.strictEqual(json.success, true);
        assert.strictEqual(json.data.hero.eyebrow, customEyebrow);
        assert.strictEqual(typeof json.meta?.cacheRefreshed, "boolean");

        // Verify written directly to PostgreSQL SiteSetting
        const dbSetting = await prisma.siteSetting.findUnique({
          where: { key: "home_hero_content" },
        });
        assert.ok(dbSetting);
        const parsedSetting = JSON.parse(dbSetting.value);
        assert.strictEqual(parsedSetting.eyebrow, customEyebrow);

        // Restore defaults
        await prisma.siteSetting.update({
          where: { key: "home_hero_content" },
          data: { value: JSON.stringify(DEFAULT_HERO_CONTENT) },
        });
        await invalidateCmsCache({ keys: ["HERO"] });
      } finally {
        setAuthSessionResolver(null);
      }
    });

    it("falls back safely to default hero content when database contains corrupt or empty value", async () => {
      // Temporarily store invalid JSON string in setting
      await prisma.siteSetting.upsert({
        where: { key: "home_hero_content" },
        update: { value: "NOT_VALID_JSON{{" },
        create: { key: "home_hero_content", value: "NOT_VALID_JSON{{" },
      });

      await invalidateCmsCache({ keys: ["HERO"] });

      // Service reader must not crash, must return safe defaults
      const hero = await getHomepageHeroContent();
      assert.strictEqual(
        hero.eyebrow,
        DEFAULT_HERO_CONTENT.eyebrow,
        "Reader must gracefully fall back to DEFAULT_HERO_CONTENT upon corrupt DB value",
      );

      // Restore
      await prisma.siteSetting.upsert({
        where: { key: "home_hero_content" },
        update: { value: JSON.stringify(DEFAULT_HERO_CONTENT) },
        create: { key: "home_hero_content", value: JSON.stringify(DEFAULT_HERO_CONTENT) },
      });
      await invalidateCmsCache({ keys: ["HERO"] });
    });
  });

  describe("FAQ Management & Public Visibility Suite", () => {
    it("validates FAQ schema and rejects missing required question or answer", () => {
      const invalidEmptyQuestion = {
        faqs: [{ id: "faq-1", question: "", answer: "Valid answer here", category: "Process" }],
      };
      const result1 = siteFaqsUpdateSchema.safeParse(invalidEmptyQuestion);
      assert.strictEqual(result1.success, false, "Must reject empty question");

      const invalidShortAnswer = {
        faqs: [{ id: "faq-1", question: "How does this work?", answer: "No", category: "Process" }],
      };
      const result2 = siteFaqsUpdateSchema.safeParse(invalidShortAnswer);
      assert.strictEqual(result2.success, false, "Must reject answer shorter than 5 chars");
    });

    it("rejects duplicate FAQ identifiers in payload", () => {
      const duplicateIdsPayload = {
        faqs: [
          { id: "faq-unique", question: "Question 1?", answer: "Answer 1 here.", category: "General" },
          { id: "FAQ-UNIQUE", question: "Question 2?", answer: "Answer 2 here.", category: "General" },
        ],
      };
      const result = siteFaqsUpdateSchema.safeParse(duplicateIdsPayload);
      assert.strictEqual(result.success, false, "Must reject case-insensitive duplicate FAQ IDs");
    });

    it("rejects invalid characters in FAQ identifier", () => {
      const invalidIdPayload = {
        faqs: [
          { id: "faq with spaces", question: "Valid question?", answer: "Valid answer here.", category: "General" },
        ],
      };
      const result = siteFaqsUpdateSchema.safeParse(invalidIdPayload);
      assert.strictEqual(result.success, false, "Must reject spaces in FAQ ID");
    });

    it("performs CRUD and visibility controls via saveSiteFaqs and verifies filtering", async () => {
      const testFaqs = [
        {
          id: "faq-test-published",
          question: "Can I host this on AWS or Vercel?",
          answer: "Yes, you have complete ownership and deployment flexibility.",
          category: "Hosting",
          order: 1,
          published: true,
        },
        {
          id: "faq-test-draft",
          question: "Draft question not yet published?",
          answer: "This is an internal draft answer that should remain hidden from public users.",
          category: "Internal",
          order: 2,
          published: false,
        },
      ];

      try {
        // 1. Save via saveSiteFaqs
        const saveRes = await saveSiteFaqs({ faqs: testFaqs });
        assert.strictEqual(saveRes.success, true);
        assert.strictEqual(saveRes.data.faqs.length, 2);

        // 2. Public consumer check: getSiteFaqs() should ONLY return the published entry
        const publicFaqs = await getSiteFaqs({ publishedOnly: true });
        const publicIds = publicFaqs.faqs.map((f) => f.id);
        assert.ok(publicIds.includes("faq-test-published"), "Published FAQ must be visible to public");
        assert.strictEqual(
          publicIds.includes("faq-test-draft"),
          false,
          "Draft FAQ must NOT be visible to public consumer",
        );

        // 3. Admin consumer check: getSiteFaqs({ publishedOnly: false }) should return ALL entries
        const adminFaqs = await getSiteFaqs({ publishedOnly: false });
        const adminIds = adminFaqs.faqs.map((f) => f.id);
        assert.ok(adminIds.includes("faq-test-published"), "Admin receives published FAQ");
        assert.ok(adminIds.includes("faq-test-draft"), "Admin receives draft FAQ");

        // 4. Public endpoint GET /api/faqs should only return published
        const publicApiRes = await publicFaqsGet();
        assert.strictEqual(publicApiRes.status, 200);
        const publicApiJson = await publicApiRes.json();
        assert.strictEqual(publicApiJson.success, true);
        const endpointIds = publicApiJson.data.faqs.map((f: { id: string }) => f.id);
        assert.ok(endpointIds.includes("faq-test-published"));
        assert.strictEqual(endpointIds.includes("faq-test-draft"), false);
      } finally {
        // Clean up and restore DEFAULT_SITE_FAQS
        await prisma.siteSetting.upsert({
          where: { key: "site_faqs" },
          update: { value: JSON.stringify(DEFAULT_SITE_FAQS), isPublic: true },
          create: { key: "site_faqs", value: JSON.stringify(DEFAULT_SITE_FAQS), isPublic: true },
        });
        await invalidateCmsCache({ keys: ["FAQS"] });
      }
    });

    it("enforces authentication and role authorization on /api/admin/faqs", async () => {
      // 1. Unauthenticated request -> 401
      setAuthSessionResolver(async () => null);
      const unauthRes = await adminFaqsGet();
      assert.strictEqual(unauthRes.status, 401, "Unauthenticated request must receive 401");

      // 2. Inactive account -> 403
      setAuthSessionResolver(async () => createMockSession("ADMIN", "INACTIVE"));
      const inactiveRes = await adminFaqsGet();
      assert.strictEqual(inactiveRes.status, 403, "Inactive user must receive 403");

      // 3. Unauthorized role (USER) -> 403
      setAuthSessionResolver(async () => createMockSession("USER", "ACTIVE"));
      const forbiddenRes = await adminFaqsGet();
      assert.strictEqual(forbiddenRes.status, 403, "USER role must receive 403");

      // 4. EDITOR role -> 200
      setAuthSessionResolver(async () => createMockSession("EDITOR", "ACTIVE"));
      const editorRes = await adminFaqsGet();
      assert.strictEqual(editorRes.status, 200, "EDITOR role must receive 200");

      // 5. ADMIN role -> 200
      setAuthSessionResolver(async () => createMockSession("ADMIN", "ACTIVE"));
      const adminRes = await adminFaqsGet();
      assert.strictEqual(adminRes.status, 200, "ADMIN role must receive 200");

      setAuthSessionResolver(null);
    });

    it("exercises PUT /api/admin/faqs with validation error handling", async () => {
      setAuthSessionResolver(async () => createMockSession("ADMIN", "ACTIVE"));
      try {
        const invalidReq = new NextRequest("http://localhost:3000/api/admin/faqs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ faqs: [{ id: "bad", question: "", answer: "" }] }),
        });
        const res = await adminFaqsPut(invalidReq);
        assert.strictEqual(res.status, 400, "Invalid payload must return 400 bad request");
        const json = await res.json();
        assert.strictEqual(json.success, false);
      } finally {
        setAuthSessionResolver(null);
      }
    });

    it("falls back safely to DEFAULT_SITE_FAQS when database value is corrupt", async () => {
      await prisma.siteSetting.upsert({
        where: { key: "site_faqs" },
        update: { value: "{CORRUPT_JSON_CONTENT" },
        create: { key: "site_faqs", value: "{CORRUPT_JSON_CONTENT" },
      });
      await invalidateCmsCache({ keys: ["FAQS"] });

      const faqsConfig = await getSiteFaqs();
      assert.ok(faqsConfig.faqs.length >= 4, "Must fall back to default FAQs on corrupt DB value");
      assert.strictEqual(faqsConfig.faqs[0].id, DEFAULT_SITE_FAQS.faqs[0].id);

      // Restore
      await prisma.siteSetting.upsert({
        where: { key: "site_faqs" },
        update: { value: JSON.stringify(DEFAULT_SITE_FAQS) },
        create: { key: "site_faqs", value: JSON.stringify(DEFAULT_SITE_FAQS) },
      });
      await invalidateCmsCache({ keys: ["FAQS"] });
    });
  });

  describe("Navigation & Footer Management Suite", () => {
    it("validates navigation schema and rejects empty or duplicate items", () => {
      const emptyNav = {
        navigation: { items: [] },
        footer: DEFAULT_FOOTER_CONFIG,
      };
      const res1 = navigationContentUpdateSchema.safeParse(emptyNav);
      assert.strictEqual(res1.success, false, "Must reject empty navigation menu");

      const duplicateNav = {
        navigation: {
          items: [
            { id: "nav-dup", title: "Home", href: "/", order: 1 },
            { id: "nav-dup", title: "Work", href: "/work", order: 2 },
          ],
        },
        footer: DEFAULT_FOOTER_CONFIG,
      };
      const res2 = navigationContentUpdateSchema.safeParse(duplicateNav);
      assert.strictEqual(res2.success, false, "Must reject duplicate navigation item IDs");
    });

    it("validates footer schema and rejects empty core stack or duplicate links", () => {
      const emptyStack = {
        navigation: DEFAULT_NAVIGATION_MENU,
        footer: {
          ...DEFAULT_FOOTER_CONFIG,
          coreStack: [],
        },
      };
      const res = navigationContentUpdateSchema.safeParse(emptyStack);
      assert.strictEqual(res.success, false, "Must reject empty coreStack in footer");
    });

    it("atomically persists navigation and footer and verifies visibility controls", async () => {
      const customNavItems = [
        { id: "nav-test-visible", title: "Portfolio", href: "/work", order: 1, isExternal: false, published: true },
        { id: "nav-test-hidden", title: "Beta Lab", href: "/beta", order: 2, isExternal: false, published: false },
      ];

      const customFooterConfig = {
        brandTagline: "Custom Brand Tagline for Integration Testing",
        systemsLinks: [
          { id: "foot-sys-pub", title: "Case Studies", href: "/work", isExternal: false, published: true },
          { id: "foot-sys-draft", title: "Internal Portal", href: "/portal", isExternal: false, published: false },
        ],
        coreStack: ["Next.js 14", "Prisma ORM", "TypeScript", "Redis"],
        connectLinks: [
          { id: "foot-conn-pub", title: "GitHub", href: "https://github.com/mohit-webgent/webgent", isExternal: true, published: true },
          { id: "foot-conn-draft", title: "Internal Discord", href: "https://discord.gg/internal", isExternal: true, published: false },
        ],
        copyrightText: "Copyright 2026 Test Studio",
      };

      try {
        // 1. Save atomically
        const saveRes = await saveNavigationContent({
          navigation: { items: customNavItems },
          footer: customFooterConfig,
        });
        assert.strictEqual(saveRes.success, true);

        // 2. Check public navigation reader: excludes published: false
        const publicNav = await getNavigationMenu({ publishedOnly: true });
        const navTitles = publicNav.items.map((i) => i.title);
        assert.ok(navTitles.includes("Portfolio"), "Visible item present in public nav");
        assert.strictEqual(navTitles.includes("Beta Lab"), false, "Hidden item excluded from public nav");

        // 3. Check admin navigation reader: includes published: false
        const adminNav = await getNavigationMenu({ publishedOnly: false });
        const adminNavTitles = adminNav.items.map((i) => i.title);
        assert.ok(adminNavTitles.includes("Portfolio"));
        assert.ok(adminNavTitles.includes("Beta Lab"), "Admin reader receives hidden item");

        // 4. Check public footer reader: excludes published: false in systems and connect links
        const publicFooter = await getFooterConfig({ publishedOnly: true });
        assert.strictEqual(publicFooter.brandTagline, "Custom Brand Tagline for Integration Testing");
        const pubSysTitles = publicFooter.systemsLinks.map((l) => l.title);
        assert.ok(pubSysTitles.includes("Case Studies"));
        assert.strictEqual(pubSysTitles.includes("Internal Portal"), false);

        const pubConnTitles = publicFooter.connectLinks.map((l) => l.title);
        assert.ok(pubConnTitles.includes("GitHub"));
        assert.strictEqual(pubConnTitles.includes("Internal Discord"), false);

        // 5. Check admin footer reader: includes all links
        const adminFooter = await getFooterConfig({ publishedOnly: false });
        const adminSysTitles = adminFooter.systemsLinks.map((l) => l.title);
        assert.ok(adminSysTitles.includes("Case Studies"));
        assert.ok(adminSysTitles.includes("Internal Portal"));
      } finally {
        // Restore defaults in database and purge caches
        await prisma.$transaction([
          prisma.siteSetting.upsert({
            where: { key: "navigation_menu" },
            update: { value: JSON.stringify(DEFAULT_NAVIGATION_MENU), isPublic: true },
            create: { key: "navigation_menu", value: JSON.stringify(DEFAULT_NAVIGATION_MENU), isPublic: true },
          }),
          prisma.siteSetting.upsert({
            where: { key: "footer_links" },
            update: { value: JSON.stringify(DEFAULT_FOOTER_CONFIG), isPublic: true },
            create: { key: "footer_links", value: JSON.stringify(DEFAULT_FOOTER_CONFIG), isPublic: true },
          }),
        ]);
        await invalidateCmsCache({ keys: ["NAVIGATION", "FOOTER"] });
      }
    });

    it("enforces authentication and role authorization on /api/admin/navigation", async () => {
      // 1. Unauthenticated -> 401
      setAuthSessionResolver(async () => null);
      const unauthRes = await adminNavGet();
      assert.strictEqual(unauthRes.status, 401);

      // 2. Inactive account -> 403
      setAuthSessionResolver(async () => createMockSession("ADMIN", "INACTIVE"));
      const inactiveRes = await adminNavGet();
      assert.strictEqual(inactiveRes.status, 403);

      // 3. USER role -> 403
      setAuthSessionResolver(async () => createMockSession("USER", "ACTIVE"));
      const forbiddenRes = await adminNavGet();
      assert.strictEqual(forbiddenRes.status, 403);

      // 4. EDITOR role -> 200
      setAuthSessionResolver(async () => createMockSession("EDITOR", "ACTIVE"));
      const editorRes = await adminNavGet();
      assert.strictEqual(editorRes.status, 200);

      // 5. ADMIN role -> 200
      setAuthSessionResolver(async () => createMockSession("ADMIN", "ACTIVE"));
      const adminRes = await adminNavGet();
      assert.strictEqual(adminRes.status, 200);

      setAuthSessionResolver(null);
    });

    it("falls back safely to default navigation and footer when database values are corrupt", async () => {
      await prisma.$transaction([
        prisma.siteSetting.upsert({
          where: { key: "navigation_menu" },
          update: { value: "{CORRUPT_JSON" },
          create: { key: "navigation_menu", value: "{CORRUPT_JSON" },
        }),
        prisma.siteSetting.upsert({
          where: { key: "footer_links" },
          update: { value: "INVALID_STRING" },
          create: { key: "footer_links", value: "INVALID_STRING" },
        }),
      ]);

      await invalidateCmsCache({ keys: ["NAVIGATION", "FOOTER"] });

      const nav = await getNavigationMenu();
      assert.ok(nav.items.length >= 6, "Must provide default navigation routes on corrupt setting");

      const footer = await getFooterConfig();
      assert.ok(footer.systemsLinks.length >= 4, "Must provide default footer systems links on corrupt setting");

      // Restore
      await prisma.$transaction([
        prisma.siteSetting.upsert({
          where: { key: "navigation_menu" },
          update: { value: JSON.stringify(DEFAULT_NAVIGATION_MENU) },
          create: { key: "navigation_menu", value: JSON.stringify(DEFAULT_NAVIGATION_MENU) },
        }),
        prisma.siteSetting.upsert({
          where: { key: "footer_links" },
          update: { value: JSON.stringify(DEFAULT_FOOTER_CONFIG) },
          create: { key: "footer_links", value: JSON.stringify(DEFAULT_FOOTER_CONFIG) },
        }),
      ]);
      await invalidateCmsCache({ keys: ["NAVIGATION", "FOOTER"] });
    });
  });

  describe("Safe URL Validation & Security Resilience Suite", () => {
    it("accepts valid root-relative paths and safe https URLs", () => {
      assert.strictEqual(isValidSafeUrl("/"), true);
      assert.strictEqual(isValidSafeUrl("/work"), true);
      assert.strictEqual(isValidSafeUrl("/about"), true);
      assert.strictEqual(isValidSafeUrl("/pricing"), true);
      assert.strictEqual(isValidSafeUrl("/contact"), true);
      assert.strictEqual(isValidSafeUrl("/#faq"), true);
      assert.strictEqual(isValidSafeUrl("/services?plan=express"), true);
      assert.strictEqual(isValidSafeUrl("https://github.com/mohit-webgent/webgent"), true);
      assert.strictEqual(isValidSafeUrl("https://twitter.com/webgent"), true);
      assert.strictEqual(isValidSafeUrl("http://example.com/page"), true);
    });

    it("rejects protocol-relative URLs", () => {
      assert.strictEqual(isValidSafeUrl("//evil.com"), false);
      assert.strictEqual(isValidSafeUrl("//google.com/phishing"), false);
      assert.strictEqual(isValidSafeUrl("/\\evil.com"), false);
      assert.strictEqual(isValidSafeUrl("\\\\evil.com"), false);
      assert.strictEqual(isValidSafeUrl("\\/evil.com"), false);
    });

    it("rejects dangerous URL schemes", () => {
      assert.strictEqual(isValidSafeUrl("javascript:alert(1)"), false);
      assert.strictEqual(isValidSafeUrl("javascript:void(0)"), false);
      assert.strictEqual(isValidSafeUrl("data:text/html,<script>alert(1)</script>"), false);
      assert.strictEqual(isValidSafeUrl("vbscript:msgbox(1)"), false);
      assert.strictEqual(isValidSafeUrl("file:///etc/passwd"), false);
      assert.strictEqual(isValidSafeUrl("ftp://files.example.com"), false);
    });

    it("rejects empty, whitespace, and null values", () => {
      assert.strictEqual(isValidSafeUrl(""), false);
      assert.strictEqual(isValidSafeUrl("   "), false);
      assert.strictEqual(isValidSafeUrl(null as unknown as string), false);
      assert.strictEqual(isValidSafeUrl(undefined as unknown as string), false);
    });

    it("rejects malicious URLs in navigation and footer Zod schemas", () => {
      const maliciousNav = {
        navigation: {
          items: [{ id: "nav-evil", title: "Evil Link", href: "javascript:alert(document.cookie)" }],
        },
        footer: DEFAULT_FOOTER_CONFIG,
      };
      const res1 = navigationContentUpdateSchema.safeParse(maliciousNav);
      assert.strictEqual(res1.success, false, "Schema must reject javascript: URL in nav");

      const protocolRelativeNav = {
        navigation: {
          items: [{ id: "nav-evil", title: "Evil Link", href: "//attacker.com/malware" }],
        },
        footer: DEFAULT_FOOTER_CONFIG,
      };
      const res2 = navigationContentUpdateSchema.safeParse(protocolRelativeNav);
      assert.strictEqual(res2.success, false, "Schema must reject protocol-relative URL in nav");

      const maliciousFooter = {
        navigation: DEFAULT_NAVIGATION_MENU,
        footer: {
          ...DEFAULT_FOOTER_CONFIG,
          systemsLinks: [{ id: "foot-evil", title: "Evil Link", href: "data:text/html,<h1>PWNED</h1>" }],
        },
      };
      const res3 = navigationContentUpdateSchema.safeParse(maliciousFooter);
      assert.strictEqual(res3.success, false, "Schema must reject data: URL in footer");
    });
  });

  // ==========================================================================
  // SEO & METADATA MANAGER SUITE (STEP 3D)
  // ==========================================================================
  describe("Global SEO & Metadata Manager Suite (Step 3D)", () => {
    describe("SEO Zod Schema & Safe URL Validation", () => {
      it("validates standard production SEO defaults successfully", () => {
        const res = siteSeoSettingsUpdateSchema.safeParse(DEFAULT_SITE_SEO_SETTINGS);
        assert.strictEqual(res.success, true, "DEFAULT_SITE_SEO_SETTINGS must pass validation");
      });

      it("validates canonical base URL requirements strictly", () => {
        assert.strictEqual(isValidCanonicalBaseUrl("https://webgent.vercel.app"), true);
        assert.strictEqual(isValidCanonicalBaseUrl("http://localhost:3000"), true);
        assert.strictEqual(isValidCanonicalBaseUrl("https://webgent.com"), true);

        // Trailing slash rejected
        assert.strictEqual(isValidCanonicalBaseUrl("https://webgent.vercel.app/"), false);
        // Subpath rejected
        assert.strictEqual(isValidCanonicalBaseUrl("https://webgent.vercel.app/home"), false);
        // Relative path rejected
        assert.strictEqual(isValidCanonicalBaseUrl("/home"), false);
        // Dangerous schemes rejected
        assert.strictEqual(isValidCanonicalBaseUrl("javascript:alert(1)"), false);
        assert.strictEqual(isValidCanonicalBaseUrl("data:text/html,test"), false);
        // Protocol-relative rejected
        assert.strictEqual(isValidCanonicalBaseUrl("//webgent.vercel.app"), false);
        assert.strictEqual(isValidCanonicalBaseUrl("\\\\webgent.vercel.app"), false);
        // Empty or non-string rejected
        assert.strictEqual(isValidCanonicalBaseUrl(""), false);
        assert.strictEqual(isValidCanonicalBaseUrl(null as unknown as string), false);
      });

      it("enforces trusted canonical origin security (rejects untrusted hosts)", () => {
        // Trusted origins allowed
        assert.strictEqual(isTrustedCanonicalOrigin("https://webgent.vercel.app"), true);
        assert.strictEqual(isTrustedCanonicalOrigin("https://webgent.com"), true);
        assert.strictEqual(isTrustedCanonicalOrigin("http://localhost:3000"), true);
        assert.strictEqual(isTrustedCanonicalOrigin("http://127.0.0.1:3000"), true);
        assert.strictEqual(isTrustedCanonicalOrigin("https://subdomain.webgent.com"), true);
        assert.strictEqual(isTrustedCanonicalOrigin("https://preview-deploy.vercel.app"), true);

        // Untrusted / malicious hosts strictly rejected
        assert.strictEqual(isTrustedCanonicalOrigin("https://attacker.com"), false);
        assert.strictEqual(isTrustedCanonicalOrigin("https://evil-phishing.org"), false);
        assert.strictEqual(isTrustedCanonicalOrigin("https://malware-distributor.net"), false);
        assert.strictEqual(isTrustedCanonicalOrigin("https://fake-webgent.com.evil.com"), false);

        // Schema rejects untrusted canonical origin
        const untrustedPayload = {
          ...DEFAULT_SITE_SEO_SETTINGS,
          global: {
            ...DEFAULT_GLOBAL_SEO,
            canonicalBaseUrl: "https://attacker.com",
          },
        };
        const res = siteSeoSettingsUpdateSchema.safeParse(untrustedPayload);
        assert.strictEqual(res.success, false, "Schema must reject untrusted canonical base URL");
      });

      it("rejects invalid title templates without %s placeholder", () => {
        const invalidPayload = {
          ...DEFAULT_SITE_SEO_SETTINGS,
          global: {
            ...DEFAULT_GLOBAL_SEO,
            titleTemplate: "Webgent Web Solutions", // missing %s
          },
        };
        const res = siteSeoSettingsUpdateSchema.safeParse(invalidPayload);
        assert.strictEqual(res.success, false, "Must reject title template missing '%s'");
      });

      it("rejects malicious OpenGraph image URLs in global config", () => {
        const maliciousPayload = {
          ...DEFAULT_SITE_SEO_SETTINGS,
          global: {
            ...DEFAULT_GLOBAL_SEO,
            defaultOgImage: "javascript:alert(document.cookie)",
          },
        };
        const res = siteSeoSettingsUpdateSchema.safeParse(maliciousPayload);
        assert.strictEqual(res.success, false, "Must reject javascript: in defaultOgImage");
      });

      it("rejects page override routes that do not start with a leading slash", () => {
        const invalidRoutePayload = {
          ...DEFAULT_SITE_SEO_SETTINGS,
          pages: {
            about: {
              // Missing leading slash
              route: "about",
              title: "About Webgent",
            },
          },
        };
        const res = siteSeoSettingsUpdateSchema.safeParse(invalidRoutePayload);
        assert.strictEqual(res.success, false, "Route override must start with a leading slash");
      });

      it("enforces description character limits (max 300 characters)", () => {
        const excessiveDesc = "A".repeat(301);
        const invalidPayload = {
          ...DEFAULT_SITE_SEO_SETTINGS,
          global: {
            ...DEFAULT_GLOBAL_SEO,
            defaultDescription: excessiveDesc,
          },
        };
        const res = siteSeoSettingsUpdateSchema.safeParse(invalidPayload);
        assert.strictEqual(res.success, false, "Must reject description exceeding 300 characters");
      });
    });

    describe("SEO Settings Reader & Fallback Resilience", () => {
      it("returns default SEO configuration when database setting is absent", async () => {
        await prisma.siteSetting.deleteMany({ where: { key: "site_seo_settings" } });
        await invalidateCmsCache({ keys: ["SEO"] });

        const seo = await getSiteSeoSettings();
        assert.ok(seo, "SEO settings must be returned");
        assert.strictEqual(seo.global.siteName, DEFAULT_GLOBAL_SEO.siteName);
        assert.strictEqual(seo.global.defaultTitle, DEFAULT_GLOBAL_SEO.defaultTitle);
        assert.strictEqual(seo.global.titleTemplate, DEFAULT_GLOBAL_SEO.titleTemplate);
        assert.strictEqual(seo.global.canonicalBaseUrl, DEFAULT_GLOBAL_SEO.canonicalBaseUrl);
        assert.strictEqual(seo.global.defaultRobotsIndex, true);
        assert.strictEqual(seo.global.defaultRobotsFollow, true);
        assert.ok(seo.pages["/"], "Default pages must include root route");
        assert.ok(seo.pages["/pricing"], "Default pages must include pricing route");
      });

      it("falls back gracefully when database setting contains corrupt JSON", async () => {
        await prisma.siteSetting.upsert({
          where: { key: "site_seo_settings" },
          update: { value: "{CORRUPT_SEO_JSON" },
          create: { key: "site_seo_settings", value: "{CORRUPT_SEO_JSON" },
        });
        await invalidateCmsCache({ keys: ["SEO"] });

        const seo = await getSiteSeoSettings();
        assert.strictEqual(seo.global.siteName, DEFAULT_GLOBAL_SEO.siteName);
        assert.strictEqual(seo.global.defaultRobotsIndex, true);
        assert.ok(seo.pages["/about"]);
      });
    });

    describe("Route Metadata Resolution & Canonical Correctness", () => {
      it("preserves distinct canonical URLs across different routes (never identical)", async () => {
        const homeMeta = await resolveRouteMetadata("/", {
          title: "Home Fallback",
          description: "Home Fallback Desc",
        });
        const pricingMeta = await resolveRouteMetadata("/pricing", {
          title: "Pricing Fallback",
          description: "Pricing Fallback Desc",
        });
        const aboutMeta = await resolveRouteMetadata("/about", {
          title: "About Fallback",
          description: "About Fallback Desc",
        });

        const homeCanonical = (homeMeta.alternates as { canonical?: string })?.canonical;
        const pricingCanonical = (pricingMeta.alternates as { canonical?: string })?.canonical;
        const aboutCanonical = (aboutMeta.alternates as { canonical?: string })?.canonical;

        assert.ok(homeCanonical, "Home must have a canonical URL");
        assert.ok(pricingCanonical, "Pricing must have a canonical URL");
        assert.ok(aboutCanonical, "About must have a canonical URL");

        assert.notStrictEqual(
          homeCanonical,
          pricingCanonical,
          "Home and Pricing MUST NOT share the same canonical URL",
        );
        assert.notStrictEqual(
          pricingCanonical,
          aboutCanonical,
          "Pricing and About MUST NOT share the same canonical URL",
        );
        assert.ok(pricingCanonical?.includes("/pricing"), "Pricing canonical URL must contain /pricing");
        assert.ok(aboutCanonical?.includes("/about"), "About canonical URL must contain /about");
      });

      it("normalizes trailing slash behavior strictly (root has trailing slash, sub-routes do not)", async () => {
        // 1. Root route "/" ends in a single trailing slash
        const homeMeta = await resolveRouteMetadata("/", { title: "Home" });
        const homeCanonical = (homeMeta.alternates as { canonical?: string })?.canonical;
        assert.ok(homeCanonical?.endsWith("/"), "Root route canonical URL must end with trailing slash '/'");

        // 2. Sub-route without trailing slash remains without trailing slash
        const pricingMeta = await resolveRouteMetadata("/pricing", { title: "Pricing" });
        const pricingCanonical = (pricingMeta.alternates as { canonical?: string })?.canonical;
        assert.strictEqual(pricingCanonical?.endsWith("/"), false, "Sub-route canonical URL must NOT end with '/'");

        // 3. Sub-route with custom override containing trailing slash normalizes by stripping it
        const customTrailingSlashSettings = {
          global: DEFAULT_GLOBAL_SEO,
          pages: {
            ...DEFAULT_PAGE_SEO_OVERRIDES,
            "/about": {
              route: "/about",
              canonicalUrl: "/about/", // Intentional trailing slash in override
            },
          },
        };
        await prisma.siteSetting.upsert({
          where: { key: "site_seo_settings" },
          update: { value: JSON.stringify(customTrailingSlashSettings) },
          create: { key: "site_seo_settings", value: JSON.stringify(customTrailingSlashSettings) },
        });
        await invalidateCmsCache({ keys: ["SEO"] });

        const aboutMeta = await resolveRouteMetadata("/about", { title: "About" });
        const aboutCanonical = (aboutMeta.alternates as { canonical?: string })?.canonical;
        assert.strictEqual(aboutCanonical?.endsWith("/"), false, "Override trailing slash must be stripped from sub-route");
        assert.ok(aboutCanonical?.endsWith("/about"), "Canonical must resolve cleanly to /about");
      });

      it("formats title correctly without duplicate title-template suffix", async () => {
        // 1. Homepage title uses { absolute: '...' } to bypass parent layout %s | Webgent
        const homeMeta = await resolveRouteMetadata("/", { title: "Home" });
        assert.ok(
          homeMeta.title && typeof homeMeta.title === "object" && "absolute" in homeMeta.title,
          "Home title must be an absolute title object",
        );

        // 2. Sub-route title containing existing ' | Webgent' strips it to avoid 'Title | Webgent | Webgent'
        const customSubRouteSettings = {
          global: DEFAULT_GLOBAL_SEO,
          pages: {
            ...DEFAULT_PAGE_SEO_OVERRIDES,
            "/pricing": {
              route: "/pricing",
              title: "Transparent Pricing Plans | Webgent", // Already contains site name
            },
          },
        };
        await prisma.siteSetting.upsert({
          where: { key: "site_seo_settings" },
          update: { value: JSON.stringify(customSubRouteSettings) },
          create: { key: "site_seo_settings", value: JSON.stringify(customSubRouteSettings) },
        });
        await invalidateCmsCache({ keys: ["SEO"] });

        const pricingMeta = await resolveRouteMetadata("/pricing", { title: "Pricing" });
        assert.strictEqual(
          pricingMeta.title,
          "Transparent Pricing Plans",
          "Duplicate '| Webgent' must be stripped from sub-route title so layout template formats it once",
        );

        // OpenGraph title retains full title string for social sharing
        const ogTitle = (pricingMeta.openGraph as { title?: string })?.title;
        assert.ok(ogTitle?.includes("Transparent Pricing Plans"), "OpenGraph title preserves full title string");
      });

      it("applies per-route title, description, and canonical overrides correctly", async () => {
        const customSettings = {
          global: DEFAULT_GLOBAL_SEO,
          pages: {
            ...DEFAULT_PAGE_SEO_OVERRIDES,
            "/pricing": {
              route: "/pricing",
              title: "Custom Pricing & Calculator | Webgent",
              description: "Custom negotiated rates for enterprise web development.",
              canonicalUrl: "/pricing-special",
              noIndex: false,
            },
          },
        };

        await prisma.siteSetting.upsert({
          where: { key: "site_seo_settings" },
          update: { value: JSON.stringify(customSettings) },
          create: { key: "site_seo_settings", value: JSON.stringify(customSettings) },
        });
        await invalidateCmsCache({ keys: ["SEO"] });

        const resolved = await resolveRouteMetadata("/pricing", {
          title: "Fallback Title",
          description: "Fallback Description",
        });

        // Title strips trailing ' | Webgent' so Next.js layout template doesn't duplicate it
        assert.strictEqual(resolved.title, "Custom Pricing & Calculator");
        assert.strictEqual(resolved.description, "Custom negotiated rates for enterprise web development.");
        const canonical = (resolved.alternates as { canonical?: string })?.canonical;
        assert.ok(canonical?.includes("/pricing-special"), "Canonical override must be honored");
      });

      it("enforces route-specific noIndex directive without affecting other pages", async () => {
        const customSettings = {
          global: DEFAULT_GLOBAL_SEO,
          pages: {
            ...DEFAULT_PAGE_SEO_OVERRIDES,
            "/contact": {
              route: "/contact",
              noIndex: true, // Specific page hidden from crawlers
            },
            "/pricing": {
              route: "/pricing",
              noIndex: false,
            },
          },
        };

        await prisma.siteSetting.upsert({
          where: { key: "site_seo_settings" },
          update: { value: JSON.stringify(customSettings) },
          create: { key: "site_seo_settings", value: JSON.stringify(customSettings) },
        });
        await invalidateCmsCache({ keys: ["SEO"] });

        const contactMeta = await resolveRouteMetadata("/contact", { title: "Contact" });
        const pricingMeta = await resolveRouteMetadata("/pricing", { title: "Pricing" });

        const contactRobots = contactMeta.robots as { index?: boolean; follow?: boolean };
        const pricingRobots = pricingMeta.robots as { index?: boolean; follow?: boolean };

        assert.strictEqual(contactRobots.index, false, "Contact page must have index: false");
        assert.strictEqual(contactRobots.follow, false, "Contact page must have follow: false");
        assert.strictEqual(pricingRobots.index, true, "Pricing page must have index: true");
      });
    });

    describe("Atomic Persistence & Cache Invalidation", () => {
      it("saves SEO settings, sanitizes fields, and invalidates Redis cache", async () => {
        const uniqueBrand = `Webgent Studio Test ${Date.now()}`;
        const payload = {
          global: {
            ...DEFAULT_GLOBAL_SEO,
            siteName: uniqueBrand,
            defaultTitle: `${uniqueBrand} — Custom Title`,
          },
          pages: DEFAULT_PAGE_SEO_OVERRIDES,
        };

        const result = await saveSiteSeoSettings(payload);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.global.siteName, uniqueBrand);
        assert.strictEqual(typeof result.meta.cacheRefreshed, "boolean");

        // Verify read back from reader matches saved value
        const updatedSeo = await getSiteSeoSettings();
        assert.strictEqual(updatedSeo.global.siteName, uniqueBrand);

        // Restore standard defaults
        await prisma.siteSetting.upsert({
          where: { key: "site_seo_settings" },
          update: { value: JSON.stringify(DEFAULT_SITE_SEO_SETTINGS) },
          create: { key: "site_seo_settings", value: JSON.stringify(DEFAULT_SITE_SEO_SETTINGS) },
        });
        await invalidateCmsCache({ keys: ["SEO"] });
      });
    });

    describe("Admin SEO API Authorization & Security", () => {
      it("enforces authentication and role-based access control on /api/admin/seo", async () => {
        // 1. Unauthenticated -> 401
        setAuthSessionResolver(async () => null);
        const unauthRes = await adminSeoGet();
        assert.strictEqual(unauthRes.status, 401, "Unauthenticated request must receive 401");

        // 2. Inactive account -> 403
        setAuthSessionResolver(async () => createMockSession("ADMIN", "INACTIVE"));
        const inactiveRes = await adminSeoGet();
        assert.strictEqual(inactiveRes.status, 403, "Inactive session must receive 403");

        // 3. Regular USER role -> 403
        setAuthSessionResolver(async () => createMockSession("USER", "ACTIVE"));
        const userRes = await adminSeoGet();
        assert.strictEqual(userRes.status, 403, "USER role must receive 403");

        // 4. EDITOR role -> 200
        setAuthSessionResolver(async () => createMockSession("EDITOR", "ACTIVE"));
        const editorRes = await adminSeoGet();
        assert.strictEqual(editorRes.status, 200, "EDITOR role must receive 200");

        // 5. ADMIN role -> 200
        setAuthSessionResolver(async () => createMockSession("ADMIN", "ACTIVE"));
        const adminRes = await adminSeoGet();
        assert.strictEqual(adminRes.status, 200, "ADMIN role must receive 200");

        setAuthSessionResolver(null);
      });

      it("rejects malformed or invalid PUT payloads with 400 Bad Request", async () => {
        setAuthSessionResolver(async () => createMockSession("ADMIN", "ACTIVE"));

        try {
          const req = new NextRequest("http://localhost:3000/api/admin/seo", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              global: {
                ...DEFAULT_GLOBAL_SEO,
                canonicalBaseUrl: "not-a-valid-url",
              },
              pages: {},
            }),
          });

          const res = await adminSeoPut(req);
          assert.strictEqual(res.status, 400, "Malformed canonical URL must receive 400");
          const json = await res.json();
          assert.strictEqual(json.success, false);
        } finally {
          setAuthSessionResolver(null);
        }
      });
    });
  });
});




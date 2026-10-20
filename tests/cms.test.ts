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
} from "../src/lib/services/cms";
import {
  GET as adminPagesGet,
  PUT as adminPagesPut,
} from "../src/app/api/admin/pages/route";
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
});



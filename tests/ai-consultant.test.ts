import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  getDomainBlueprint,
  detectCategoryFromText,
  MISSING_BUSINESS_CONFIG,
  MAINTENANCE_PLANS,
} from "../src/lib/services/ai-consultant/knowledge-base";
import {
  getMarketBenchmark,
  ALL_MARKET_BENCHMARKS,
} from "../src/lib/services/ai-consultant/market-benchmarks";
import {
  calculateProjectEstimate,
  EstimateInput,
} from "../src/lib/services/ai-consultant/calculator";
import {
  processConsultantMessage,
  extractProjectRequirements,
  generateFollowUpSuggestions,
} from "../src/lib/services/ai-consultant/orchestrator";
import {
  setGeminiClientFactory,
} from "../src/lib/services/gemini";
import { POST as messageRoute } from "../src/app/api/chat/message/route";
import { POST as startRoute } from "../src/app/api/chat/start/route";
import { prisma } from "../src/lib/db";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FormattedMessage } from "../src/components/chat/formatted-message";
import { retrieveRelevantKnowledge } from "../src/lib/services/ai-consultant/knowledge-retrieval";
import { FOUNDER_PROFILE } from "../src/data/founder-profile";

describe("AI Website Consultant, Cost Estimator & Lead Assistant Suite", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    setGeminiClientFactory(null);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    setGeminiClientFactory(null);
  });

  // ---------------------------------------------------------------------------
  // 1. Gym Website Domain Recommendations & Blueprints
  // ---------------------------------------------------------------------------
  describe("Gym Website Recommendations", () => {
    it("detects gym category and provides complete page and feature blueprints", () => {
      const category = detectCategoryFromText(
        "I want a website for my gym. What features should it have, how many pages will I need, and how much will it cost?",
      );
      assert.equal(category, "gym");

      const blueprint = getDomainBlueprint("gym");
      assert.ok(blueprint, "Gym blueprint must be defined");
      assert.ok(blueprint.displayName.includes("Gym") || blueprint.displayName.includes("Fitness"));

      // Verify recommended pages have defined purposes
      assert.ok(blueprint.pages.length >= 5, "Gym blueprint recommends at least 5 pages");
      const schedulePage = blueprint.pages.find(
        (p) => p.slug.includes("schedule") || p.slug.includes("classes") || p.slug.includes("programs"),
      );
      assert.ok(schedulePage, "Gym blueprint must include a schedule or programs page");
      assert.ok(schedulePage.purpose.length > 10, "Page must explain its business purpose");

      // Verify essential vs recommended vs optional features
      assert.ok(blueprint.essentialFeatures.includes("contact_form"));
      assert.ok(
        blueprint.recommendedFeatures.includes("gallery_showcase") ||
          blueprint.recommendedFeatures.includes("booking_calendar"),
      );
      assert.ok(
        blueprint.optionalAddons.includes("payment_gateway") ||
          blueprint.optionalAddons.includes("user_login"),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 2. E-Commerce and Business Website Recommendations
  // ---------------------------------------------------------------------------
  describe("E-Commerce & Business Website Recommendations", () => {
    it("identifies e-commerce requirements and enforces dynamic architecture with catalog & payment", () => {
      const category = detectCategoryFromText(
        "I need an online e-commerce store with shopping cart and Razorpay checkout",
      );
      assert.equal(category, "ecommerce");

      const blueprint = getDomainBlueprint("ecommerce");
      assert.ok(blueprint);
      assert.equal(blueprint.defaultArchitecture, "dynamic");
      assert.ok(blueprint.essentialFeatures.includes("payment_gateway"));
    });

    it("identifies business agency portfolio requirements", () => {
      const category = detectCategoryFromText(
        "Corporate consulting agency showcase website with client case studies",
      );
      assert.equal(category, "business");

      const blueprint = getDomainBlueprint("business");
      assert.ok(blueprint);
      assert.ok(blueprint.displayName.includes("Business"));
      assert.ok(blueprint.pages.some((p) => p.slug === "/work" || p.slug === "/services"));
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Deterministic Pricing Calculator
  // ---------------------------------------------------------------------------
  describe("Deterministic Cost Calculator from Configuration", () => {
    it("calculates exact deterministic cost adhering to canonical pricing bounds", () => {
      // 5-page static business site with zero extra add-ons
      const estimate = calculateProjectEstimate({
        categoryKey: "business",
        pagesCount: 5,
        architecture: "static",
        selectedFeatureIds: [],
        maintenancePlanId: "none",
        expressDelivery: false,
      });

      // Canonical: base business is 9,999 (from pricing.config.ts), pagesCount 5 = no extra page surcharge, static = 0
      assert.equal(estimate.cost.baseCategoryPriceINR, 9999);
      assert.equal(estimate.cost.oneTimeTotalINR, 9999);
      assert.equal(estimate.cost.recurringMonthlyTotalINR, 0);
      assert.equal(estimate.assumptions.length > 0, true);
    });

    it("applies per-page surcharges when page count exceeds 5", () => {
      const estimate = calculateProjectEstimate({
        categoryKey: "business",
        pagesCount: 8, // 3 pages beyond 5 => +3,000 INR
        architecture: "static",
        selectedFeatureIds: [],
        maintenancePlanId: "none",
        expressDelivery: false,
      });

      assert.equal(estimate.cost.oneTimeTotalINR, 9999 + 3000);
    });

    it("auto-switches to dynamic architecture and surcharges ₹8,000 when dynamic features are selected", () => {
      const estimate = calculateProjectEstimate({
        categoryKey: "business",
        pagesCount: 5,
        architecture: "static", // User asked for static, but requested dynamic database feature
        selectedFeatureIds: ["payment_gateway"], // dynamic feature!
        maintenancePlanId: "none",
        expressDelivery: false,
      });

      assert.equal(estimate.architecture, "dynamic");
      assert.equal(estimate.autoSwitchedToDynamic, true);
      // Base: 9,999 + Dynamic surcharge 8,000 + Payment gateway 4,500 = 22,499
      assert.equal(estimate.cost.oneTimeTotalINR, 9999 + 8000 + 4500);
    });

    it("applies express delivery 20% multiplier correctly", () => {
      const standardEstimate = calculateProjectEstimate({
        categoryKey: "business",
        pagesCount: 5,
        architecture: "static",
        selectedFeatureIds: [],
        maintenancePlanId: "none",
        expressDelivery: false,
      });

      const expressEstimate = calculateProjectEstimate({
        categoryKey: "business",
        pagesCount: 5,
        architecture: "static",
        selectedFeatureIds: [],
        maintenancePlanId: "none",
        expressDelivery: true,
      });

      const expectedExpress =
        standardEstimate.cost.oneTimeTotalINR +
        Math.round(standardEstimate.cost.oneTimeTotalINR * 0.2);
      assert.equal(expressEstimate.cost.oneTimeTotalINR, expectedExpress);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Optional Add-ons and Recurring Maintenance Costs
  // ---------------------------------------------------------------------------
  describe("Optional Add-ons & Recurring Costs Separation", () => {
    it("clearly separates one-time development fees from recurring monthly maintenance", () => {
      const estimate = calculateProjectEstimate({
        categoryKey: "gym",
        pagesCount: 5,
        architecture: "static",
        selectedFeatureIds: ["whatsapp_chat"],
        maintenancePlanId: "standard", // ₹5,000/mo (from MAINTENANCE_PLANS.standard)
        expressDelivery: false,
      });

      assert.ok(estimate.cost.oneTimeTotalINR >= 4999);
      assert.equal(estimate.cost.recurringMonthlyTotalINR, 5000);
      assert.equal(estimate.cost.recurringBreakdown.length, 1);
      assert.equal(estimate.cost.recurringBreakdown[0].frequency, "monthly");
      assert.ok(estimate.cost.thirdPartyNotes.length > 0, "Discloses recurring third-party domain/hosting notes");
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Missing Business Configuration Handling
  // ---------------------------------------------------------------------------
  describe("Maintainable Missing Business Configuration", () => {
    it("flags explicit [REQUIRES_OWNER_INPUT] items without fabricating prices", () => {
      assert.ok(MISSING_BUSINESS_CONFIG.length >= 3);
      for (const item of MISSING_BUSINESS_CONFIG) {
        assert.equal(item.status, "[REQUIRES_OWNER_INPUT]");
        assert.ok(item.key.length > 0);
        assert.ok(item.note.length > 0);
      }
    });

    it("gracefully falls back to custom web application category when unknown scope is provided", () => {
      const blueprint = getDomainBlueprint("quantum_teleportation_system");
      assert.ok(blueprint);
      assert.equal(blueprint.categoryKey, "business");
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Market Price Benchmark Verification
  // ---------------------------------------------------------------------------
  describe("Market Price Benchmark System (No Fabricated Data)", () => {
    it("returns verified published market benchmarks with credible source citations and dates", () => {
      const gymBenchmark = getMarketBenchmark("gym");
      assert.ok(gymBenchmark, "Market benchmark for gym websites must exist");
      assert.ok(gymBenchmark.marketRangeMinINR > 0);
      assert.ok(gymBenchmark.marketRangeMaxINR > gymBenchmark.marketRangeMinINR);
      assert.ok(gymBenchmark.sourceUrl.startsWith("http"), "Source URL must be valid HTTP link");
      assert.ok(gymBenchmark.researchDate.includes("2025") || gymBenchmark.researchDate.includes("2026"), "Date must reflect verified industry research");
      assert.ok(!gymBenchmark.notes.includes("cheaper than everyone"), "Maintains objective, verifiable stance");
    });

    it("ensures all registered benchmarks contain verifiable sources", () => {
      for (const benchmark of ALL_MARKET_BENCHMARKS) {
        assert.ok(benchmark.sourceName.length > 3);
        assert.ok(benchmark.sourceUrl.startsWith("http"));
        assert.ok(benchmark.marketRangeMaxINR >= benchmark.marketRangeMinINR);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Budget Refinement & Compromise Analysis
  // ---------------------------------------------------------------------------
  describe("Budget Analysis & Refinement Flow", () => {
    it("identifies budget deficits and proposes realistic scope compromise options", () => {
      const estimate = calculateProjectEstimate({
        categoryKey: "ecommerce",
        pagesCount: 8,
        architecture: "dynamic",
        selectedFeatureIds: ["payment_gateway", "admin_dashboard"],
        userBudgetINR: 15000, // E-commerce starting base is 19,999
      });

      assert.ok(estimate.budgetAnalysis);
      assert.equal(estimate.budgetAnalysis.fitsBudget, false);
      assert.ok(estimate.budgetAnalysis.differenceINR < 0);
      assert.ok(estimate.budgetAnalysis.compromiseOptions && estimate.budgetAnalysis.compromiseOptions.length > 0);
    });

    it("approves project scope when user budget comfortably covers calculation", () => {
      const estimate = calculateProjectEstimate({
        categoryKey: "business",
        pagesCount: 5,
        architecture: "static",
        userBudgetINR: 25000,
      });

      assert.ok(estimate.budgetAnalysis);
      assert.equal(estimate.budgetAnalysis.fitsBudget, true);
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Context-Aware Follow-Up Suggestions
  // ---------------------------------------------------------------------------
  describe("Context-Aware Interactive Chips", () => {
    it("generates relevant, non-repetitive chips for gym consultation", () => {
      const suggestions = generateFollowUpSuggestions("gym");
      assert.ok(suggestions.length >= 2 && suggestions.length <= 3);
      assert.ok(
        suggestions.some(
          (s) =>
            s.toLowerCase().includes("membership") ||
            s.toLowerCase().includes("schedule") ||
            s.toLowerCase().includes("budget"),
        ),
      );
    });

    it("generates budget-tailored follow-up chips when budget is exceeded", () => {
      const mockEstimate = calculateProjectEstimate({
        categoryKey: "ecommerce",
        pagesCount: 8,
        architecture: "dynamic",
        selectedFeatureIds: ["payment_gateway"],
        userBudgetINR: 10000,
      });

      const suggestions = generateFollowUpSuggestions("ecommerce", mockEstimate);
      assert.ok(
        suggestions.some((s) => s.toLowerCase().includes("budget") || s.toLowerCase().includes("reduce")),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Gemini Integration, Rate Limiting & Offline Fallback
  // ---------------------------------------------------------------------------
  describe("Gemini Mocking, Error Resilience & Offline Fallbacks", () => {
    it("processes consultant message using mocked Gemini model without touching live credits", async () => {
      process.env.GEMINI_API_KEY = "test-mock-gemini-key";

      const mockText =
        "For your fitness gym, Webgent recommends a clean 5-page Next.js website with high-performance responsive styling.";

      setGeminiClientFactory(() => ({
        models: {
          generateContent: async () => ({
            text: mockText,
          }),
        },
      }));

      const result = await processConsultantMessage({
        messages: [{ role: "user", content: "I want a gym website. What features will I need?" }],
      });

      assert.equal(result.messageText, mockText);
      assert.ok(result.estimate, "Estimate must be attached deterministically");
      assert.equal(result.categoryKey, "gym");
      assert.ok(result.followUpSuggestions.length > 0);
    });

    it("recovers gracefully with offline consultant blueprint when GEMINI_API_KEY is missing", async () => {
      delete process.env.GEMINI_API_KEY;

      const result = await processConsultantMessage({
        messages: [{ role: "user", content: "I want a website for my gym with classes and pricing." }],
      });

      assert.ok(result.messageText.length > 50);
      assert.ok(result.messageText.includes("Fitness") || result.messageText.includes("Webgent"));
      assert.ok(result.estimate);
      assert.equal(result.estimate.categoryKey, "gym");
    });

    it("handles Gemini 429 quota exhaustion gracefully", async () => {
      process.env.GEMINI_API_KEY = "test-mock-gemini-key";

      setGeminiClientFactory(() => ({
        models: {
          generateContent: async () => {
            throw new Error("429 RESOURCE_EXHAUSTED: Quota exceeded");
          },
        },
      }));

      const result = await processConsultantMessage({
        messages: [{ role: "user", content: "Can you build a restaurant website with food menu showcase?" }],
      });

      assert.ok(result.messageText.length > 30);
      assert.ok(result.estimate);
      assert.equal(result.categoryKey, "restaurant");
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Requirement Extraction from Natural Conversation History
  // ---------------------------------------------------------------------------
  describe("Conversation History Context Extraction", () => {
    it("remembers requirements across multi-turn messages without repetitive queries", () => {
      const messages = [
        { role: "user" as const, content: "Hi, I run a fitness center called Pulse Gym." },
        { role: "assistant" as const, content: "Nice to meet you! How many pages or features do you have in mind?" },
        { role: "user" as const, content: "We need 6 pages and an admin dashboard. Our budget is around ₹25,000." },
      ];

      const reqs = extractProjectRequirements(messages);
      assert.equal(reqs.categoryKey, "gym");
      assert.equal(reqs.pageCount, 6);
      assert.equal(reqs.userBudgetINR, 25000);
      assert.ok(reqs.selectedFeatureIds?.includes("admin_dashboard"));
    });
  });

  // ---------------------------------------------------------------------------
  // 11. API Route: Message Validation & Error Handling
  // ---------------------------------------------------------------------------
  describe("API Route (/api/chat/message) Validation", () => {
    it("rejects malformed requests with missing session ID", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello without session" }),
      });

      const res = await messageRoute(req);
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    it("rejects non-existent chat session IDs", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "non-existent-session-id-12345",
          message: "Hello world",
        }),
      });

      const res = await messageRoute(req);
      assert.equal(res.status, 404);
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Lead Capture Handoff & Duplicate Prevention
  // ---------------------------------------------------------------------------
  describe("Lead Capture & Duplicate Lead Prevention", () => {
    it("avoids creating duplicate leads when the same visitor submits multiple inquiries within 24 hours", async () => {
      const testEmail = `consultant_test_${Date.now()}@example.com`;
      const testName = "Jane Consultant Lead";

      // 1. Initial chat start lead
      const startReq = new NextRequest("http://localhost:3000/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: testName,
          email: testEmail,
          initialMessage: "Starting initial gym website discussion",
          turnstileToken: "dev-mock-turnstile-token",
        }),
      });

      const startRes = await startRoute(startReq);
      assert.equal(startRes.status, 201);
      const startData = await startRes.json();
      assert.ok(startData.sessionId);

      // Verify 1 lead in database
      const leadsFirst = await prisma.lead.findMany({
        where: { email: testEmail },
      });
      assert.equal(leadsFirst.length, 1);

      // 2. Chat start retry with same email (e.g. page refresh or second attempt)
      const retryReq = new NextRequest("http://localhost:3000/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: testName,
          email: testEmail,
          initialMessage: "Second session start attempt with same email",
          turnstileToken: "dev-mock-turnstile-token",
        }),
      });

      const retryRes = await startRoute(retryReq);
      assert.equal(retryRes.status, 201);

      // Verify NO duplicate lead was created
      const leadsSecond = await prisma.lead.findMany({
        where: { email: testEmail },
      });
      assert.equal(leadsSecond.length, 1, "Lead record count must remain 1 (no duplicate creation)");

      // Clean up test lead and sessions
      await prisma.lead.deleteMany({ where: { email: testEmail } });
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Markdown Rendering & Safe Content Presentation
  // ---------------------------------------------------------------------------
  describe("Markdown Rendering & Safe Content Presentation", () => {
    it("renders bold text, headings, unordered lists, inline code, and links to semantic HTML without leaking raw markers", () => {
      const sampleMarkdown = `**Webgent** is an elite digital engineering agency.

### Core Services
- High-performance web applications with \`Next.js 14\`
- Fast stores with [Edayaa Case Study](/work/edayaa)

1. Milestone 50/50
2. 100% Code ownership`;

      const html = renderToStaticMarkup(
        React.createElement(FormattedMessage, { content: sampleMarkdown }),
      );

      // Verify semantic HTML elements
      assert.ok(html.includes("<strong"), "Should render <strong> for bold markdown");
      assert.ok(html.includes("Webgent</strong>"), "Should enclose bold text correctly");
      assert.ok(html.includes("<h4"), "Should render <h4> for ### headers");
      assert.ok(html.includes("<ul"), "Should render <ul> for list items");
      assert.ok(html.includes("<li"), "Should render <li> tags");
      assert.ok(html.includes("<code"), "Should render <code> for inline code snippets");
      assert.ok(html.includes("<a"), "Should render <a> for links");
      assert.ok(html.includes('href="/work/edayaa"'), "Link should contain valid href");

      // Verify raw markdown characters are not left unparsed
      assert.ok(!html.includes("**Webgent**"), "Raw bold double-asterisks must not leak into HTML");
      assert.ok(!html.includes("### Core Services"), "Raw markdown hashes must not leak into HTML");
    });
  });

  // ---------------------------------------------------------------------------
  // 14. Founder Profile Accuracy & Verified Truth Grounding
  // ---------------------------------------------------------------------------
  describe("Founder Profile Accuracy & Truth Grounding", () => {
    it("retrieves verified education and professional credentials from authoritative source", async () => {
      // 1. Verify founder-profile.ts data integrity
      assert.equal(FOUNDER_PROFILE.name, "Mohit Verma");
      assert.ok(
        FOUNDER_PROFILE.education.some(
          (e) => e.degree.includes("MCA") && (e.institution.includes("HIMT") || e.university.includes("AKTU")),
        ),
      );
      assert.ok(
        FOUNDER_PROFILE.education.some(
          (e) => e.degree.includes("Computer Science") && (e.institution.includes("IIMT") || e.university.includes("CCSU")),
        ),
      );
      assert.ok(FOUNDER_PROFILE.currentRole.company.includes("DBA Lounge"));

      // 2. Verify knowledge retrieval includes verified founder profile
      const docs = await retrieveRelevantKnowledge("Mohit Verma education qualification degrees college", 3);
      assert.ok(docs.length > 0, "Should retrieve founder knowledge documents");
      const founderDoc = docs.find((d) => d.doc.id === "founder_mohit_verma");
      assert.ok(founderDoc, "Should retrieve founder_mohit_verma document");
      assert.ok(founderDoc.doc.content.includes("MCA"), "Knowledge document must document MCA degree");
      assert.ok(founderDoc.doc.content.includes("AKTU"), "Knowledge document must document AKTU");
      assert.ok(founderDoc.doc.content.includes("B.Sc"), "Knowledge document must document B.Sc degree");
      assert.ok(founderDoc.doc.content.includes("DBA Lounge"), "Knowledge document must document DBA Lounge experience");

      // 3. Verify AI Consultant role boundaries in knowledge document
      assert.ok(
        founderDoc.doc.content.includes("AI Consultant") || founderDoc.doc.content.includes("AI assistant"),
        "Must specify AI Consultant role boundaries distinguishing AI from human founder",
      );
    });

    it("references genuine verified client projects with accurate status labels", async () => {
      const docs = await retrieveRelevantKnowledge("Bird Outsourcing Institutional Management Edayaa Jewellery Mohit", 3);
      const founderDoc = docs.find((d) => d.doc.id === "founder_mohit_verma");
      assert.ok(founderDoc, "Should retrieve founder_mohit_verma document containing verified projects");

      // Check verified projects
      assert.ok(founderDoc.doc.content.includes("Bird Outsourcing"), "Must document Bird Outsourcing");
      assert.ok(founderDoc.doc.content.includes("Institutional Management Platform"), "Must document Institutional Management Platform");
      assert.ok(founderDoc.doc.content.includes("Edayaa Jewellery Store"), "Must document Edayaa Jewellery Store");

      // Check genuine status labels
      assert.ok(founderDoc.doc.content.includes("Live Production Site"), "Must label live site accurately");
      assert.ok(founderDoc.doc.content.includes("Past Production Deployment"), "Must label past deployment accurately");
      assert.ok(founderDoc.doc.content.includes("E-Commerce Deployment"), "Must label e-commerce deployment accurately");
    });
  });
});

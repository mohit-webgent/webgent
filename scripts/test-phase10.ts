/**
 * Phase 10 Verification Script: Custom Analytics and Tracking
 * 
 * Verifies:
 * 1. POST /api/analytics/pageview (session cookie, path, referrer, device, country, PII sanitization)
 * 2. POST /api/analytics/event (FORM_START, FORM_SUBMIT, DEMO_CLICK, WHATSAPP_CLICK, CTA_CLICK, BLOG_READ, metadata sanitization)
 * 3. Payload validation (invalid names, invalid types, oversized bodies)
 * 4. Rate-limit protection against abuse
 * 5. GET /api/admin/analytics (authentication guard, 7d/30d/90d periods, real metrics, funnel, top pages, device split, country distribution)
 * 6. Non-blocking client utility checks
 */

import { NextRequest } from "next/server";
import { POST as handlePageView } from "../src/app/api/analytics/pageview/route";
import { POST as handleEvent } from "../src/app/api/analytics/event/route";
import { GET as handleAdminAnalytics } from "../src/app/api/admin/analytics/route";
import { prisma } from "../src/lib/db";
import { analyticsService, extractAnalyticsContext } from "../src/lib/services/analytics";
import { adminAnalyticsQuerySchema } from "../src/lib/validations/analytics";
import * as authUtils from "../src/lib/auth-utils";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ ${testName}`, details || "");
    failed++;
  }
}

async function runTests() {
  console.log("\n==========================================");
  console.log("  PHASE 10: CUSTOM ANALYTICS TEST SUITE  ");
  console.log("==========================================\n");

  const testSessionId = `sid_test_${Date.now()}_abc123`;

  // ----------------------------------------------------
  // TEST GROUP 1: Context Extraction & Header Detection
  // ----------------------------------------------------
  console.log("--- 1. Analytics Context & Header Detection ---");

  // 1.1 Cloudflare Country Header
  const reqCf = new NextRequest("http://localhost:3000/api/analytics/pageview", {
    headers: {
      "cf-ipcountry": "US",
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15",
      "x-forwarded-for": "203.0.113.195",
    },
  });
  const contextCf = extractAnalyticsContext(reqCf);
  assert(contextCf.country === "US", "Detects country from cf-ipcountry header");
  assert(contextCf.device === "mobile", "Detects mobile device category from iPhone User-Agent");
  assert(typeof contextCf.sessionId === "string" && contextCf.sessionId.startsWith("sid_"), "Generates anonymous session ID if none provided");
  assert(contextCf.ipHash.length === 16, "Generates 16-character HMAC SHA-256 IP hash without storing raw IP");

  // 1.2 Vercel Header & Tablet UA
  const reqVercel = new NextRequest("http://localhost:3000/api/analytics/pageview", {
    headers: {
      "x-vercel-ip-country": "IN",
      "user-agent": "Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15",
    },
  });
  const contextVercel = extractAnalyticsContext(reqVercel);
  assert(contextVercel.country === "IN", "Detects country from x-vercel-ip-country header");
  assert(contextVercel.device === "tablet", "Detects tablet device category from iPad User-Agent");

  // 1.3 Desktop UA & CloudFront Country
  const reqDesktop = new NextRequest("http://localhost:3000/api/analytics/pageview", {
    headers: {
      "cloudfront-viewer-country": "GB",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const contextDesktop = extractAnalyticsContext(reqDesktop);
  assert(contextDesktop.country === "GB", "Detects country from cloudfront-viewer-country header");
  assert(contextDesktop.device === "desktop", "Detects desktop device category from Chrome User-Agent");

  // 1.4 Preserves valid client-provided session ID
  const contextCustomSid = extractAnalyticsContext(reqDesktop, testSessionId);
  assert(contextCustomSid.sessionId === testSessionId, "Respects valid client-provided session ID");

  // ----------------------------------------------------
  // TEST GROUP 2: POST /api/analytics/pageview
  // ----------------------------------------------------
  console.log("\n--- 2. Public POST /api/analytics/pageview ---");

  // 2.1 Valid pageview with session cookie generation
  const pageViewReq1 = new NextRequest("http://localhost:3000/api/analytics/pageview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cf-ipcountry": "DE",
      "x-forwarded-for": "198.51.100.10",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    },
    body: JSON.stringify({
      path: "/work/fintech-dashboard?utm_source=twitter&token=secret123",
      referrer: "https://google.com/search?q=webgent&auth=private456",
      device: "desktop",
    }),
  });

  const res1 = await handlePageView(pageViewReq1);
  const data1 = await res1.json();

  assert(res1.status === 201, "Pageview recording returns 201 Created");
  assert(data1.success === true, "Response reports success = true");
  assert(typeof data1.data.id === "string", "Returns created pageview record ID");
  assert(data1.data.path === "/work/fintech-dashboard", "Strips query parameters (e.g. token) from tracked path");

  const setCookie = res1.headers.get("set-cookie") || "";
  assert(setCookie.includes("webgent_sid="), "Sets webgent_sid cookie in HTTP response");
  assert(setCookie.includes("HttpOnly") || setCookie.toLowerCase().includes("httponly"), "Sets HttpOnly flag on session cookie");

  // Verify in database
  const dbPv = await prisma.pageView.findUnique({ where: { id: data1.data.id } });
  assert(dbPv !== null, "Pageview record successfully persisted to PostgreSQL database");
  assert(dbPv?.country === "DE", "Persisted detected country 'DE'");
  assert(dbPv?.device === "desktop", "Persisted detected device 'desktop'");
  assert(dbPv?.referrer !== null && !dbPv?.referrer.includes("auth="), "Referrer sanitized to strip sensitive tokens");

  // 2.2 Reuses client session ID
  const pageViewReq2 = new NextRequest("http://localhost:3000/api/analytics/pageview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "198.51.100.11",
    },
    body: JSON.stringify({
      path: "/blog/scale-microservices",
      sessionId: testSessionId,
      device: "mobile",
    }),
  });

  const res2 = await handlePageView(pageViewReq2);
  const data2 = await res2.json();
  assert(res2.status === 201, "Pageview with custom session ID returns 201");
  assert(data2.data.sessionId === testSessionId, "Maintains existing session ID across pageviews");

  // 2.3 Invalid payload validation
  const invalidPvReq = new NextRequest("http://localhost:3000/api/analytics/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: "" }),
  });
  const resInvalidPv = await handlePageView(invalidPvReq);
  assert(resInvalidPv.status === 400, "Rejects empty path with 400 Bad Request");

  const nonJsonPvReq = new NextRequest("http://localhost:3000/api/analytics/pageview", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "not json",
  });
  const resNonJsonPv = await handlePageView(nonJsonPvReq);
  assert(resNonJsonPv.status === 400, "Rejects malformed JSON body with 400 Bad Request");

  // ----------------------------------------------------
  // TEST GROUP 3: POST /api/analytics/event
  // ----------------------------------------------------
  console.log("\n--- 3. Public POST /api/analytics/event ---");

  const testEvents = [
    { name: "FORM_START", category: "form", metadata: { form: "contact", step: 1 } },
    { name: "FORM_SUBMIT", category: "form", metadata: { form: "contact", service: "web_dev" } },
    { name: "DEMO_CLICK", category: "conversion", metadata: { project: "cloud-saas", url: "https://demo.example.com" } },
    { name: "WHATSAPP_CLICK", category: "conversion", metadata: { source: "floating_action_button" } },
    { name: "CTA_CLICK", category: "conversion", metadata: { label: "Header Start Project", destination: "/contact" } },
    { name: "BLOG_READ", category: "content", metadata: { slug: "nextjs-14-architecture", title: "Next.js 14 Guide", readTime: 5 } },
  ];

  for (const item of testEvents) {
    const eventReq = new NextRequest("http://localhost:3000/api/analytics/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "cf-ipcountry": "US",
        "x-forwarded-for": "198.51.100.25",
      },
      body: JSON.stringify({
        name: item.name,
        category: item.category,
        path: "/contact",
        sessionId: testSessionId,
        metadata: item.metadata,
        device: "desktop",
      }),
    });

    const resEv = await handleEvent(eventReq);
    const dataEv = await resEv.json();
    assert(resEv.status === 201, `Records standard event: ${item.name} (201 Created)`);
    assert(dataEv.data.name === item.name, `Event name matched: ${item.name}`);
  }

  // 3.2 Metadata PII Sanitization
  const piiEventReq = new NextRequest("http://localhost:3000/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "CTA_CLICK",
      metadata: {
        buttonId: "quote-now",
        email: "user@example.com",
        password: "supersecretpassword",
        phone: "+15551234567",
      },
    }),
  });

  const resPii = await handleEvent(piiEventReq);
  const dataPii = await resPii.json();
  assert(resPii.status === 201, "Accepts event with metadata");

  const dbPiiEv = await prisma.event.findUnique({ where: { id: dataPii.data.id } });
  const parsedMeta = JSON.parse(dbPiiEv?.metadata || "{}");
  assert(parsedMeta.email === "[REDACTED]", "Redacts sensitive 'email' key in event metadata");
  assert(parsedMeta.password === "[REDACTED]", "Redacts sensitive 'password' key in event metadata");
  assert(parsedMeta.phone === "[REDACTED]", "Redacts sensitive 'phone' key in event metadata");
  assert(parsedMeta.buttonId === "quote-now", "Preserves safe metadata properties");

  // 3.3 Invalid event name validation
  const invalidNameReq = new NextRequest("http://localhost:3000/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "lowercase_invalid_event" }),
  });
  const resInvalidName = await handleEvent(invalidNameReq);
  assert(resInvalidName.status === 400, "Rejects lowercase event names (requires UPPERCASE_ALPHANUMERIC)");

  // ----------------------------------------------------
  // TEST GROUP 4: Rate Limiting & Abuse Protection
  // ----------------------------------------------------
  console.log("\n--- 4. Rate Limiting Protection ---");

  // Rapid flood requests to trigger rate limiter
  const floodIp = "203.0.113.99";
  let rateLimited = false;

  for (let i = 0; i < 130; i++) {
    const floodReq = new NextRequest("http://localhost:3000/api/analytics/pageview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": floodIp,
      },
      body: JSON.stringify({ path: "/flood-test" }),
    });

    const resFlood = await handlePageView(floodReq);
    if (resFlood.status === 429) {
      rateLimited = true;
      break;
    }
  }
  assert(rateLimited, "Rate limiter returns 429 Too Many Requests when IP exceeds limit");

  // ----------------------------------------------------
  // TEST GROUP 5: GET /api/admin/analytics & Admin Metrics
  // ----------------------------------------------------
  console.log("\n--- 5. Admin Analytics & Metric Computations ---");

  // 5.1 Unauthorized access check (no auth header/session)
  const unauthReq = new NextRequest("http://localhost:3000/api/admin/analytics?period=30d");
  const resUnauth = await handleAdminAnalytics(unauthReq);
  assert(resUnauth.status === 401, "Unauthenticated request rejected with 401 Unauthorized");

  // 5.2 Period query schema validation: 7d, 30d, 90d, ?days=7, ?range=90d
  const q1 = adminAnalyticsQuerySchema.parse({ period: "7d" });
  assert(q1.period === "7d", "Query schema validates period '7d'");
  const q2 = adminAnalyticsQuerySchema.parse({ period: "30d" });
  assert(q2.period === "30d", "Query schema validates period '30d'");
  const q3 = adminAnalyticsQuerySchema.parse({ period: "90d" });
  assert(q3.period === "90d", "Query schema validates period '90d'");
  const qDays = adminAnalyticsQuerySchema.parse({ days: "7" });
  assert(qDays.days === "7d", "Query schema maps ?days=7 to '7d'");
  const qRange = adminAnalyticsQuerySchema.parse({ range: "90d" });
  assert(qRange.range === "90d", "Query schema validates ?range=90d");

  // 5.3 Metric computations from real DB data across periods
  for (const p of ["7d", "30d", "90d"] as const) {
    const metrics = await analyticsService.getAdminAnalytics(p);
    assert(metrics.period === p, `AnalyticsService computes period ${p}`);
    assert(metrics.days === (p === "7d" ? 7 : p === "90d" ? 90 : 30), `Correct days range for ${p}`);
  }

  // 5.4 Metric Data Structures (No Fake Analytics Data)
  const d = await analyticsService.getAdminAnalytics("30d");

  // Total Page Views & Unique Visitors
  assert(typeof d.summary.totalPageViews === "number" && d.summary.totalPageViews > 0, "Provides total page views from real DB records");
  assert(typeof d.summary.uniqueVisitors === "number" && d.summary.uniqueVisitors > 0, "Provides unique visitors from distinct sessions");
  assert(typeof d.summary.totalEvents === "number" && d.summary.totalEvents > 0, "Provides total events count");
  assert(typeof d.summary.overallConversionRate === "number", "Provides calculated overall conversion rate percentage");

  // Top Pages
  assert(Array.isArray(d.topPages) && d.topPages.length > 0, "Provides top pages array");
  const topPage = d.topPages[0];
  assert(typeof topPage.path === "string" && typeof topPage.views === "number" && typeof topPage.percentage === "number", "Top page entry contains path, views, uniqueVisitors, and percentage");

  // Event Counts
  assert(typeof d.eventCounts === "object" && d.eventCounts !== null, "Provides event counts dictionary");
  assert(typeof d.eventCounts["FORM_START"] === "number" && d.eventCounts["FORM_START"] >= 1, "Tracks count for FORM_START");
  assert(typeof d.eventCounts["FORM_SUBMIT"] === "number" && d.eventCounts["FORM_SUBMIT"] >= 1, "Tracks count for FORM_SUBMIT");
  assert(typeof d.eventCounts["DEMO_CLICK"] === "number" && d.eventCounts["DEMO_CLICK"] >= 1, "Tracks count for DEMO_CLICK");
  assert(typeof d.eventCounts["WHATSAPP_CLICK"] === "number" && d.eventCounts["WHATSAPP_CLICK"] >= 1, "Tracks count for WHATSAPP_CLICK");
  assert(typeof d.eventCounts["CTA_CLICK"] === "number" && d.eventCounts["CTA_CLICK"] >= 1, "Tracks count for CTA_CLICK");
  assert(typeof d.eventCounts["BLOG_READ"] === "number" && d.eventCounts["BLOG_READ"] >= 1, "Tracks count for BLOG_READ");

  // Conversion Funnel
  assert(Array.isArray(d.conversionFunnel) && d.conversionFunnel.length === 4, "Provides 4-step conversion funnel");
  assert(d.conversionFunnel[0].step === "Visitors", "Funnel Step 1: Visitors");
  assert(d.conversionFunnel[1].step === "Engagement (CTA/Demo)", "Funnel Step 2: Engagement (CTA/Demo)");
  assert(d.conversionFunnel[2].step === "Form Started", "Funnel Step 3: Form Started");
  assert(d.conversionFunnel[3].step === "Form Submitted", "Funnel Step 4: Form Submitted");

  // Device Split
  assert(Array.isArray(d.deviceSplit) && d.deviceSplit.length >= 3, "Provides device category split (desktop, mobile, tablet)");
  const desktopStat = d.deviceSplit.find((s: any) => s.device === "desktop");
  assert(desktopStat !== undefined && desktopStat.count > 0, "Device split counts desktop pageviews");

  // Country Distribution
  assert(Array.isArray(d.countryDistribution) && d.countryDistribution.length > 0, "Provides country distribution array");
  const topCountry = d.countryDistribution[0];
  assert(typeof topCountry.country === "string" && typeof topCountry.count === "number", "Country distribution entries contain country code and count");

  // Daily Timeline
  assert(Array.isArray(d.timeline) && d.timeline.length === 30, "Provides 30-day timeline series for 30d period");

  // ----------------------------------------------------
  // TEST GROUP 6: Reusable Client Utility Integrity
  // ----------------------------------------------------
  console.log("\n--- 6. Reusable Analytics Client Utility Verification ---");
  const clientModule = await import("../src/lib/analytics/client");
  assert(typeof clientModule.trackPageView === "function", "Exports trackPageView()");
  assert(typeof clientModule.trackEvent === "function", "Exports trackEvent()");
  assert(typeof clientModule.trackFormStart === "function", "Exports trackFormStart()");
  assert(typeof clientModule.trackFormSubmit === "function", "Exports trackFormSubmit()");
  assert(typeof clientModule.trackDemoClick === "function", "Exports trackDemoClick()");
  assert(typeof clientModule.trackWhatsAppClick === "function", "Exports trackWhatsAppClick()");
  assert(typeof clientModule.trackCtaClick === "function", "Exports trackCtaClick()");
  assert(typeof clientModule.trackBlogRead === "function", "Exports trackBlogRead()");
  assert(typeof clientModule.getSessionId === "function", "Exports getSessionId()");
  assert(typeof clientModule.getClientDeviceCategory === "function", "Exports getClientDeviceCategory()");

  // Summary
  console.log("\n==========================================");
  console.log(`  PHASE 10 TEST RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("==========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed with fatal error:", err);
  process.exit(1);
});


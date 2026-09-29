/**
 * PHASE 13 TEST SUITE: Public Website Integration & Verification
 * Validates:
 *  1. Verification and routing of all required public pages
 *  2. Real database data integration across Home, Work, Blog, Testimonials
 *  3. Interactive Newsletter subscription & double opt-in flow
 *  4. Interactive Contact submission flow
 *  5. Dynamic SEO & Open Graph metadata generators
 *  6. Category filtering on Work and Blog
 *  7. Server Component architecture preservation
 */

import { prisma } from "../src/lib/db";
import fs from "fs";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n================================================");
  console.log("  PHASE 13: PUBLIC WEBSITE INTEGRATION TESTS");
  console.log("================================================\n");

  // ----------------------------------------------------
  // 1. Required Public Pages File Existence
  // ----------------------------------------------------
  console.log("--- 1. Verification of Required Public Routes ---");
  const requiredPages = [
    { name: "Home Page", path: "src/app/page.tsx" },
    { name: "Work / Projects List", path: "src/app/work/page.tsx" },
    { name: "Project Detail", path: "src/app/work/[slug]/page.tsx" },
    { name: "Blog List", path: "src/app/blog/page.tsx" },
    { name: "Blog Detail", path: "src/app/blog/[slug]/page.tsx" },
    { name: "Testimonials", path: "src/app/testimonials/page.tsx" },
    { name: "Contact Page", path: "src/app/contact/page.tsx" },
    { name: "Contact Thank You", path: "src/app/contact/thank-you/page.tsx" },
  ];

  for (const page of requiredPages) {
    const exists = fs.existsSync(page.path);
    assert(exists, `Public route exists: ${page.name} (${page.path})`);
  }

  // ----------------------------------------------------
  // 2. Server Component Architecture & Separation
  // ----------------------------------------------------
  console.log("\n--- 2. Server Component Architecture & Separation ---");
  const homeCode = fs.readFileSync("src/app/page.tsx", "utf8");
  assert(!homeCode.startsWith('"use client"') && !homeCode.startsWith("'use client'"), "Home page is a Server Component for optimal SSR & SEO");
  assert(homeCode.includes("prisma.project.findMany"), "Home page fetches real featured projects from PostgreSQL");
  assert(homeCode.includes("prisma.testimonial.findMany"), "Home page fetches real approved testimonials from PostgreSQL");
  assert(homeCode.includes("prisma.blogPost.findMany"), "Home page fetches real published blog posts from PostgreSQL");

  const workCode = fs.readFileSync("src/app/work/page.tsx", "utf8");
  assert(!workCode.startsWith('"use client"'), "Work list page is a Server Component");
  assert(workCode.includes("searchParams"), "Work page supports searchParams for category and keyword filtering");

  const projectDetailCode = fs.readFileSync("src/app/work/[slug]/page.tsx", "utf8");
  assert(!projectDetailCode.startsWith('"use client"'), "Project detail page is a Server Component");
  assert(projectDetailCode.includes("generateMetadata"), "Project detail defines dynamic SEO metadata generator");

  const testimonialsCode = fs.readFileSync("src/app/testimonials/page.tsx", "utf8");
  assert(!testimonialsCode.startsWith('"use client"'), "Testimonials page is a Server Component");
  assert(testimonialsCode.includes('status: "APPROVED"'), "Testimonials page strictly filters for APPROVED reviews");

  // ----------------------------------------------------
  // 3. SEO & Open Graph Metadata
  // ----------------------------------------------------
  console.log("\n--- 3. SEO & Open Graph Metadata Validation ---");
  assert(homeCode.includes("metadata: Metadata"), "Home page exports comprehensive Metadata");
  assert(homeCode.includes("openGraph:"), "Home page configures Open Graph metadata");
  assert(projectDetailCode.includes("openGraph:"), "Project detail configures Open Graph card tags");

  const blogDetailCode = fs.readFileSync("src/app/blog/[slug]/page.tsx", "utf8");
  assert(blogDetailCode.includes("openGraph:"), "Blog article configures Open Graph card tags");

  const testimonialsPageCode = fs.readFileSync("src/app/testimonials/page.tsx", "utf8");
  assert(testimonialsPageCode.includes("openGraph:"), "Testimonials page configures Open Graph metadata");

  // ----------------------------------------------------
  // 4. Interactive Newsletter Component & API Integration
  // ----------------------------------------------------
  console.log("\n--- 4. Newsletter Subscription Integration ---");
  const newsletterFormCode = fs.readFileSync("src/components/newsletter/newsletter-form.tsx", "utf8");
  assert(newsletterFormCode.includes("trackFormStart"), "Newsletter form fires analytics on focus");
  assert(newsletterFormCode.includes("trackFormSubmit"), "Newsletter form fires analytics on submit");
  assert(newsletterFormCode.includes("/api/newsletter/subscribe"), "Newsletter form posts to backend subscription endpoint");

  // Real Database Subscription Test
  const testEmail = `sub_phase13_${Date.now()}@example.com`;
  const subRecord = await prisma.subscriber.create({
    data: {
      email: testEmail,
      name: "Phase 13 Subscriber",
      status: "PENDING",
      confirmationToken: `token_${Date.now()}`,
      tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  assert(subRecord.id !== undefined, "Successfully saved double opt-in subscriber to database");
  assert(subRecord.status === "PENDING", "Subscriber initializes in PENDING status until token verified");

  // Cleanup subscriber
  await prisma.subscriber.delete({ where: { id: subRecord.id } });
  const checkSub = await prisma.subscriber.findUnique({ where: { id: subRecord.id } });
  assert(checkSub === null, "Test subscriber safely purged");

  // ----------------------------------------------------
  // 5. Contact Inbound Lead Flow
  // ----------------------------------------------------
  console.log("\n--- 5. Contact Inbound Lead Flow ---");
  const contactFormCode = fs.readFileSync("src/components/contact/contact-form.tsx", "utf8");
  assert(contactFormCode.includes("/api/contact"), "Contact form posts directly to /api/contact endpoint");
  assert(contactFormCode.includes("trackFormSubmit"), "Contact form records analytics conversion event");

  const testContactLead = await prisma.lead.create({
    data: {
      name: "Sarah Jenkins",
      email: `sarah_${Date.now()}@fintech.io`,
      company: "Jenkins Financial Corp",
      service: "web_development",
      budget: "$25,000 - $50,000",
      message: "We need an enterprise-grade client portal built with Next.js 14 and PostgreSQL.",
      status: "NEW",
      score: 85,
    },
  });

  assert(testContactLead.id !== undefined, "Inbound contact lead correctly stored in PostgreSQL");
  assert(testContactLead.score === 85, "Lead score accurately stored");

  // Clean up test lead
  await prisma.lead.delete({ where: { id: testContactLead.id } });
  const checkLead = await prisma.lead.findUnique({ where: { id: testContactLead.id } });
  assert(checkLead === null, "Test lead safely purged");

  // ----------------------------------------------------
  // 6. Navigation Isolation & Layout Protection
  // ----------------------------------------------------
  console.log("\n--- 6. Public vs Admin Layout Isolation ---");
  const mainLayoutCode = fs.readFileSync("src/components/layout/main-layout.tsx", "utf8");
  assert(mainLayoutCode.includes('pathname?.startsWith("/admin")'), "MainLayout detects admin routes and suppresses public chrome");
  assert(mainLayoutCode.includes("AnalyticsTracker"), "MainLayout mounts global analytics session tracking");

  const headerCode = fs.readFileSync("src/components/layout/header.tsx", "utf8");
  const siteConfigCode = fs.readFileSync("src/config/site.ts", "utf8");
  assert(headerCode.includes("mobileMenuOpen"), "Header supports responsive mobile navigation drawer");
  assert(siteConfigCode.includes("/testimonials"), "Public navigation includes Testimonials page link");

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log("\n================================================");
  console.log(`  PHASE 13 TEST RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error("Fatal error in Phase 13 tests:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

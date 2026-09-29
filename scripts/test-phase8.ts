import fs from "fs";
import path from "path";

// Load .env file for standalone script execution
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [k, ...v] = trimmed.split("=");
      if (k && v.length > 0 && !process.env[k.trim()]) {
        process.env[k.trim()] = v.join("=").replace(/^["']|["']$/g, "").trim();
      }
    }
  });
}

import { render } from "@react-email/components";
import * as React from "react";
import { ContactConfirmationEmail } from "../src/components/emails/contact-confirmation";
import { AdminLeadNotificationEmail } from "../src/components/emails/admin-lead-notification";
import { NewsletterConfirmationEmail } from "../src/components/emails/newsletter-confirmation";
import { NewsletterUnsubscribedEmail } from "../src/components/emails/newsletter-unsubscribed";
import { NewsletterDigestEmail } from "../src/components/emails/newsletter-digest";
import { emailService } from "../src/lib/services/email";
import { notificationService } from "../src/lib/services/notifications";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runTests() {
  console.log("\n📧 Running Phase 8 Email Infrastructure Test Suite...\n");

  // -------------------------------------------------------------
  // 1. Template Rendering Tests (React Email -> HTML)
  // -------------------------------------------------------------
  console.log("▶ [1/4] Testing React Email Template Rendering...");

  // 1a. Contact Confirmation Template
  const contactHtml = await render(
    React.createElement(ContactConfirmationEmail, {
      name: "Sarah Jenkins",
      service: "Enterprise Next.js Platform",
      budget: "$50k - $100k",
      message: "We need high performance web architecture for our medical analytics engine.",
    })
  );

  assert(contactHtml.includes("WEBGENT"), "Contact confirmation contains brand header");
  assert(contactHtml.includes("Sarah"), "Contact confirmation addresses client by name");
  assert(contactHtml.includes("Enterprise Next.js Platform"), "Contact confirmation includes requested service");
  assert(contactHtml.includes("$50k - $100k"), "Contact confirmation includes budget");
  assert(contactHtml.includes("medical analytics engine"), "Contact confirmation includes client message quote");
  assert(contactHtml.includes("24 business hours"), "Contact confirmation sets SLA response expectation");

  // 1b. Admin Lead Notification Template
  const adminLeadHtml = await render(
    React.createElement(AdminLeadNotificationEmail, {
      leadId: "lead-uuid-12345",
      name: "Marcus Sterling",
      email: "marcus@apexfintech.io",
      phone: "+1 (555) 987-6543",
      company: "Apex Global FinTech",
      service: "Fintech Trading Portal",
      budget: "$100k+",
      message: "Looking for low latency WebSocket engineering experts.",
      score: 92,
    })
  );

  assert(adminLeadHtml.includes("New Inbound Client Lead"), "Admin notification has clear alert header");
  assert(adminLeadHtml.includes("Lead Score") && adminLeadHtml.includes("92"), "Admin notification renders calculated lead score");
  assert(adminLeadHtml.includes("High Intent"), "Admin notification categorizes score intent");
  assert(adminLeadHtml.includes("marcus@apexfintech.io"), "Admin notification includes client email");
  assert(adminLeadHtml.includes("Apex Global FinTech"), "Admin notification includes company");
  assert(adminLeadHtml.includes("lead-uuid-12345"), "Admin notification includes direct admin CRM link");

  // 1c. Newsletter Double Opt-In Confirmation Template
  const tokenSample = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const newsletterOptInHtml = await render(
    React.createElement(NewsletterConfirmationEmail, {
      email: "subscriber@example.com",
      token: tokenSample,
      name: "Alex",
    })
  );

  assert(newsletterOptInHtml.includes("Confirm Your Subscription"), "Newsletter template includes confirmation heading");
  assert(newsletterOptInHtml.includes(tokenSample), "Newsletter template includes secure confirmation token URL");
  assert(newsletterOptInHtml.includes("24 hours"), "Newsletter template specifies 24-hour expiration");
  assert(newsletterOptInHtml.includes("DOUBLE OPT-IN"), "Newsletter template explains double opt-in privacy");

  // 1d. Newsletter Unsubscribed Template
  const unsubscribedHtml = await render(
    React.createElement(NewsletterUnsubscribedEmail, {
      email: "leaving@example.com",
    })
  );

  assert(unsubscribedHtml.includes("You&#x27;ve Been Unsubscribed") || unsubscribedHtml.includes("You've Been Unsubscribed"), "Unsubscribed template has clear confirmation title");
  assert(unsubscribedHtml.includes("leaving@example.com"), "Unsubscribed template confirms target email address");
  assert(unsubscribedHtml.includes("Re-Subscribe"), "Unsubscribed template includes re-subscribe action");

  // 1e. Blog / Newsletter Digest Template
  const digestHtml = await render(
    React.createElement(NewsletterDigestEmail, {
      editionTitle: "Webgent Monthly Insights #12",
      featuredArticle: {
        title: "Building Multi-Tenant SaaS with Next.js 14 and Prisma",
        excerpt: "A deep dive into tenant isolation, connection pooling, and sub-100ms response times.",
        slug: "building-multitenant-saas-nextjs",
        readTime: 5,
        coverImageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      },
      recentArticles: [
        {
          title: "PostgreSQL B-Tree Index Optimization",
          excerpt: "Strategies for cutting database query latency under heavy write load.",
          slug: "postgresql-btree-index-optimization",
          readTime: 4,
        },
      ],
      unsubscribeUrl: "https://webgent.com/api/newsletter/unsubscribe?token=sample",
    })
  );

  assert(digestHtml.includes("Webgent Monthly Insights #12"), "Digest template includes edition title");
  assert(digestHtml.includes("Building Multi-Tenant SaaS"), "Digest template includes featured article");
  assert(digestHtml.includes("PostgreSQL B-Tree Index Optimization"), "Digest template includes recent articles list");
  assert(digestHtml.includes("Unsubscribe"), "Digest template includes RFC compliant unsubscribe footer link");

  // -------------------------------------------------------------
  // 2. Email Service Methods & Dispatch Abstraction
  // -------------------------------------------------------------
  console.log("\n▶ [2/4] Testing Email Service Abstraction...");

  const resContact = await emailService.sendContactConfirmation({
    name: "Test Client",
    email: "testclient@example.com",
    service: "Cloud Architecture",
    budget: "$25k+",
    message: "Test message body",
  });
  assert(resContact === true, "sendContactConfirmation returns true");

  const resAdmin = await emailService.sendAdminNewLeadNotification({
    leadId: "lead-test-1",
    name: "Test Client",
    email: "testclient@example.com",
    message: "Test message body",
    score: 85,
  });
  assert(resAdmin === true, "sendAdminNewLeadNotification returns true");

  const resOptIn = await emailService.sendNewsletterConfirmation(
    "newslettertest@example.com",
    tokenSample,
    "Test User"
  );
  assert(resOptIn === true, "sendNewsletterConfirmation returns true");

  const resWelcome = await emailService.sendNewsletterWelcome(
    "newslettertest@example.com",
    "Test User",
    "unsub-123"
  );
  assert(resWelcome === true, "sendNewsletterWelcome returns true");

  const resUnsub = await emailService.sendNewsletterUnsubscribed({
    email: "newslettertest@example.com",
  });
  assert(resUnsub === true, "sendNewsletterUnsubscribed returns true");

  const resDigest = await emailService.sendNewsletterDigest("digestuser@example.com", {
    editionTitle: "Engineering Update",
    featuredArticle: {
      title: "Architecture Principles",
      excerpt: "Testing excerpt",
      slug: "architecture-principles",
    },
    unsubscribeUrl: "https://webgent.com/unsubscribe",
  });
  assert(resDigest === true, "sendNewsletterDigest returns true");

  // -------------------------------------------------------------
  // 3. Resilience & Safe Error Handling Tests
  // -------------------------------------------------------------
  console.log("\n▶ [3/4] Testing Safe Error Handling & Resilience...");

  // Primary database operations must NEVER fail if email provider errors out
  const invalidOptions = {
    to: "", // Invalid recipient
    subject: "",
  };
  const safeFailResult = await emailService.sendEmail(invalidOptions);
  assert(safeFailResult === false, "Email service safely returns false on invalid payload without throwing uncaught exceptions");

  // Test Notification Service integration
  const mockLead = {
    id: "lead-mock-id",
    name: "Integration Test User",
    email: "mock@example.com",
    phone: "+1 555 123 4567",
    company: "Mock Enterprise",
    service: "Full Stack Development",
    budget: "$30k",
    message: "Automated test message.",
    status: "NEW" as const,
    score: 88,
    notes: null,
    followUpDate: null,
    ipAddress: "127.0.0.1",
    userAgent: "Jest/TSX",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const notificationResult = await notificationService.sendLeadEmailNotification(mockLead);
  assert(notificationResult === true, "notificationService.sendLeadEmailNotification executes gracefully");

  // -------------------------------------------------------------
  // 4. Security & Environment Configuration Tests
  // -------------------------------------------------------------
  console.log("\n▶ [4/4] Testing Security & Environment Rules...");

  // Verify RESEND_API_KEY is not exposed with NEXT_PUBLIC_ prefix
  const allEnvKeys = Object.keys(process.env);
  const leakedKey = allEnvKeys.find((k) => k.startsWith("NEXT_PUBLIC_RESEND"));
  assert(!leakedKey, "RESEND_API_KEY is never exposed with NEXT_PUBLIC_ prefix (server-side only)");

  console.log(`\n======================================================`);
  console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE 8 TESTS PASSED!`);
  console.log(`======================================================\n`);
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});

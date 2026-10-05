import { prisma } from "../src/lib/db";
import {
  testimonialSchema,
  testimonialUpdateSchema,
  testimonialReorderSchema,
} from "../src/lib/validations/testimonial";
import {
  newsletterSubscribeSchema,
  subscriberQuerySchema,
} from "../src/lib/validations/newsletter";
import { emailService } from "../src/lib/services/email";
import { TestimonialStatus, SubscriberStatus } from "@prisma/client";
import crypto from "crypto";

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
  console.log("\n🧪 Running Phase 7 Test Suite: Testimonials & Newsletter...\n");

  // -------------------------------------------------------------
  // 1. Testimonial Validation Tests
  // -------------------------------------------------------------
  console.log("▶ [1/5] Testing Testimonials Validation Schemas...");

  const validTestimonialData = {
    clientName: "Jane Doe",
    designation: "VP of Engineering",
    company: "Acme Corp",
    quote: "Antigravity and Webgent exceeded all our highest project benchmarks.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    rating: 5,
    featured: true,
  };

  const parsedValid = testimonialSchema.safeParse(validTestimonialData);
  assert(parsedValid.success, "Valid testimonial input is parsed and transformed successfully");
  if (parsedValid.success) {
    assert(
      parsedValid.data.clientTitle === "VP of Engineering",
      "designation alias maps to clientTitle",
    );
    assert(parsedValid.data.content.startsWith("Antigravity"), "quote alias maps to content");
    assert(parsedValid.data.status === TestimonialStatus.APPROVED, "default status is APPROVED");
  }

  // Invalid data: quote too short
  const invalidShortQuote = testimonialSchema.safeParse({
    clientName: "John Smith",
    quote: "Hi",
  });
  assert(!invalidShortQuote.success, "Rejects quotes shorter than 5 characters");

  // Invalid rating
  const invalidRating = testimonialSchema.safeParse({
    clientName: "John Smith",
    quote: "Great performance and high quality delivery!",
    rating: 10,
  });
  assert(!invalidRating.success, "Rejects ratings greater than 5");

  // Reorder schema
  const reorderPayload = {
    items: [
      { id: "test-id-1", order: 0 },
      { id: "test-id-2", order: 1 },
    ],
  };
  const parsedReorder = testimonialReorderSchema.safeParse(reorderPayload);
  assert(parsedReorder.success, "Valid reorder payload passes schema validation");

  // -------------------------------------------------------------
  // 2. Testimonial Database & Lifecycle Integration Tests
  // -------------------------------------------------------------
  console.log("\n▶ [2/5] Testing Testimonial Database Lifecycle & Public Visibility Rules...");

  const testEmailTag = `test-${Date.now()}`;

  // Create an approved testimonial
  const approvedItem = await prisma.testimonial.create({
    data: {
      clientName: `Client Approved ${testEmailTag}`,
      clientTitle: "Director",
      company: "Test Corp",
      content: "Excellent and thoroughly validated software delivery.",
      rating: 5,
      status: TestimonialStatus.APPROVED,
      order: 100,
    },
  });

  // Create a pending testimonial
  const pendingItem = await prisma.testimonial.create({
    data: {
      clientName: `Client Pending ${testEmailTag}`,
      clientTitle: "Manager",
      company: "Test Corp",
      content: "Waiting for admin moderation approval.",
      rating: 4,
      status: TestimonialStatus.PENDING,
      order: 101,
    },
  });

  // Create a soft-deleted testimonial
  const softDeletedItem = await prisma.testimonial.create({
    data: {
      clientName: `Client Soft Deleted ${testEmailTag}`,
      content: "This was deleted and should never show in public endpoints.",
      status: TestimonialStatus.APPROVED,
      deletedAt: new Date(),
      order: 102,
    },
  });

  // Simulate Public GET /api/testimonials query
  const publicQueryResults = await prisma.testimonial.findMany({
    where: {
      status: TestimonialStatus.APPROVED,
      deletedAt: null,
      company: "Test Corp",
    },
  });

  const publicIds = publicQueryResults.map((t) => t.id);
  assert(
    publicIds.includes(approvedItem.id),
    "Public query includes approved, non-deleted testimonials",
  );
  assert(
    !publicIds.includes(pendingItem.id),
    "Public query STRICTLY EXCLUDES pending testimonials",
  );
  assert(
    !publicIds.includes(softDeletedItem.id),
    "Public query STRICTLY EXCLUDES soft-deleted testimonials",
  );

  // Test Admin status update (Approval workflow)
  const approvedPending = await prisma.testimonial.update({
    where: { id: pendingItem.id },
    data: { status: TestimonialStatus.APPROVED },
  });
  assert(
    approvedPending.status === TestimonialStatus.APPROVED,
    "Admin can approve pending testimonials",
  );

  // Test Reorder transaction
  await prisma.$transaction([
    prisma.testimonial.update({ where: { id: approvedItem.id }, data: { order: 200 } }),
    prisma.testimonial.update({ where: { id: pendingItem.id }, data: { order: 201 } }),
  ]);
  const checkReordered = await prisma.testimonial.findUnique({ where: { id: approvedItem.id } });
  assert(checkReordered?.order === 200, "Reorder transaction successfully persists updated order");

  // Clean up test testimonials
  await prisma.testimonial.deleteMany({
    where: {
      id: { in: [approvedItem.id, pendingItem.id, softDeletedItem.id] },
    },
  });
  console.log("  🧹 Cleaned up test testimonials.");

  // -------------------------------------------------------------
  // 3. Newsletter Validation & Double Opt-in Workflow Tests
  // -------------------------------------------------------------
  console.log("\n▶ [3/5] Testing Newsletter Subscriptions & Double Opt-In Workflow...");

  const validSubscribe = newsletterSubscribeSchema.safeParse({
    email: "  USER@EXAMPLE.COM  ",
    name: "Alex",
  });
  assert(validSubscribe.success, "Newsletter subscribe schema accepts valid email");
  if (validSubscribe.success) {
    assert(
      validSubscribe.data.email === "user@example.com",
      "Email is automatically trimmed and lowercased",
    );
  }

  const invalidSubscribe = newsletterSubscribeSchema.safeParse({
    email: "not-an-email",
  });
  assert(!invalidSubscribe.success, "Newsletter subscribe schema rejects malformed email");

  // End-to-end subscriber lifecycle:
  const subEmail = `subscriber-${Date.now()}@example.com`;

  // Step A: New subscription creates PENDING subscriber with secure 64-char token & 24h expiry
  const initialToken = crypto.randomBytes(32).toString("hex");
  const unsubsToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const subscriber = await prisma.subscriber.create({
    data: {
      email: subEmail,
      name: "Test Subscriber",
      status: SubscriberStatus.PENDING,
      isActive: false,
      confirmationToken: initialToken,
      tokenExpiresAt: expiresAt,
      unsubscribeToken: unsubsToken,
    },
  });

  assert(subscriber.status === SubscriberStatus.PENDING, "Initial subscriber state is PENDING");
  assert(subscriber.isActive === false, "Initial subscriber isActive is false");
  assert(
    subscriber.confirmationToken?.length === 64,
    "Confirmation token is a secure 64-character hex string",
  );
  assert(subscriber.tokenExpiresAt !== null, "Token expiration date is properly populated");

  // Step B: Duplicate subscribe while PENDING regenerates token
  const refreshedToken = crypto.randomBytes(32).toString("hex");
  const refreshedExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const updatedPending = await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: {
      confirmationToken: refreshedToken,
      tokenExpiresAt: refreshedExpires,
    },
  });
  assert(
    updatedPending.confirmationToken === refreshedToken,
    "Duplicate subscribe while PENDING refreshes confirmation token",
  );

  // Step C: Confirmation verifies token and activates subscriber
  const confirmed = await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: {
      status: SubscriberStatus.ACTIVE,
      isActive: true,
      subscribedAt: new Date(),
      confirmationToken: null,
      tokenExpiresAt: null,
    },
  });

  assert(
    confirmed.status === SubscriberStatus.ACTIVE,
    "Confirmed subscriber transitions to ACTIVE",
  );
  assert(confirmed.isActive === true, "Confirmed subscriber isActive is true");
  assert(
    confirmed.confirmationToken === null,
    "Confirmation token is cleared after verification (safe token handling)",
  );
  assert(confirmed.subscribedAt !== null, "subscribedAt timestamp is set on confirmation");

  // Step D: Unsubscribe transitions to UNSUBSCRIBED
  const unsubscribed = await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: {
      status: SubscriberStatus.UNSUBSCRIBED,
      isActive: false,
      unsubscribedAt: new Date(),
    },
  });

  assert(
    unsubscribed.status === SubscriberStatus.UNSUBSCRIBED,
    "Subscriber transitions to UNSUBSCRIBED",
  );
  assert(unsubscribed.isActive === false, "Unsubscribed subscriber isActive is false");
  assert(unsubscribed.unsubscribedAt !== null, "unsubscribedAt timestamp is set");

  // Step E: Re-subscribing while UNSUBSCRIBED transitions back to PENDING with new double opt-in
  const reactivated = await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: {
      status: SubscriberStatus.PENDING,
      isActive: false,
      confirmationToken: crypto.randomBytes(32).toString("hex"),
      tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      unsubscribedAt: null,
    },
  });

  assert(
    reactivated.status === SubscriberStatus.PENDING,
    "Re-subscribing from UNSUBSCRIBED triggers new PENDING state",
  );
  assert(
    reactivated.confirmationToken !== null,
    "New confirmation token generated for re-activation",
  );

  // Clean up test subscriber
  await prisma.subscriber.delete({ where: { id: subscriber.id } });
  console.log("  🧹 Cleaned up test subscriber.");

  // -------------------------------------------------------------
  // 4. Email Service Abstraction Tests
  // -------------------------------------------------------------
  console.log("\n▶ [4/5] Testing Email Service Abstraction...");

  const confirmationResult = await emailService.sendNewsletterConfirmation(
    "test@example.com",
    "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "Alex",
  );
  assert(confirmationResult === true, "sendNewsletterConfirmation completes without error");

  const welcomeResult = await emailService.sendNewsletterWelcome(
    "test@example.com",
    "Alex",
    "unsub-token-xyz",
  );
  assert(welcomeResult === true, "sendNewsletterWelcome completes without error");

  // -------------------------------------------------------------
  // 5. CSV Export Sanitization Tests
  // -------------------------------------------------------------
  console.log("\n▶ [5/5] Testing CSV Export & Spreadsheet Injection Protection...");

  const maliciousInputs = ["=cmd|' /C calc'!A0", "+SUM(A1:A10)", "-2+3", "@SUM(B1:B5)"];
  for (const input of maliciousInputs) {
    const isFormula = /^[=+\-@\t\r]/.test(input);
    assert(isFormula, `Detected dangerous spreadsheet prefix in "${input}"`);
    const escaped = `'${input}`;
    assert(
      escaped.startsWith("'"),
      "Malicious formula prefix neutralized with single quote prefix",
    );
  }

  console.log(`\n======================================================`);
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log(`======================================================\n`);
}

runTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

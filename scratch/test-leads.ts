import { contactFormSchema, leadUpdateSchema } from "../src/lib/validations/contact";
import { calculateLeadScore } from "../src/lib/leads/scoring";
import { checkRateLimit } from "../src/lib/rate-limit";

async function runLeadTests() {
  console.log("🧪 Running Phase 4 Contact & Lead Management Test Suite...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // Test 1: Valid Contact Form Zod Validation
  const validContact = contactFormSchema.safeParse({
    name: "Jane Smith",
    email: "jane@company.com",
    phone: "+1 555-123-4567",
    company: "Tech Corp",
    service: "web_development",
    budget: "10k_25k",
    message: "We need a full-stack Next.js web application built with high performance and Prisma DB.",
  });
  assert(validContact.success, "Valid contact form submission passes validation");

  // Test 2: Short Message Description Rejection
  const shortMessage = contactFormSchema.safeParse({
    name: "Jane Smith",
    email: "jane@company.com",
    message: "Too short msg", // < 20 chars
  });
  assert(!shortMessage.success, "Rejects message under 20 characters");

  // Test 3: Lead Scoring Algorithm
  const highScore = calculateLeadScore({
    name: "Jane Smith",
    email: "jane@company.com",
    phone: "+1 555-123-4567",
    company: "Tech Corp",
    service: "web_development",
    budget: "10k_25k",
    message: "We need a full-stack Next.js web application built with high performance and Prisma DB. " + "A".repeat(100),
  });
  // Base 10 + Budget 30 + Company 20 + Phone 15 + Service 15 + Message 10 = 100
  assert(highScore === 100, `High intent lead receives maximum score 100 (Got: ${highScore})`);

  const lowScore = calculateLeadScore({
    name: "John Doe",
    email: "john@gmail.com",
    message: "Hello I would like to inquire about your services.",
  });
  // Base 10
  assert(lowScore === 10, `Basic lead receives score 10 (Got: ${lowScore})`);

  // Test 4: Rate Limiter (Max 3 submissions per hour)
  const clientIp = "203.0.113.42";
  for (let i = 0; i < 3; i++) {
    await checkRateLimit(`contact:${clientIp}`, 3, 3600000);
  }
  const blockedRateLimit = await checkRateLimit(`contact:${clientIp}`, 3, 3600000);
  assert(!blockedRateLimit.success, "Enforces 3 submissions per IP per hour limit");

  // Test 5: Lead Update Schema
  const validUpdate = leadUpdateSchema.safeParse({
    status: "PROPOSAL_SENT",
    notes: "Sent initial SOW document.",
    followUpDate: new Date().toISOString(),
  });
  assert(validUpdate.success, "Lead status update validation passes");

  const invalidStatus = leadUpdateSchema.safeParse({
    status: "INVALID_STATUS",
  });
  assert(!invalidStatus.success, "Rejects invalid lead status enum");

  console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runLeadTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

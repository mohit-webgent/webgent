import bcrypt from "bcryptjs";
import { loginSchema, changePasswordSchema } from "../src/lib/validations/auth";
import { checkRateLimit } from "../src/lib/rate-limit";
import { formatDatabaseError } from "../src/lib/db/utils";

async function runAuthTests() {
  console.log("🧪 Running Phase 3 Authentication & Security Test Suite...\n");
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

  // Test 1: Password hashing and comparison
  const rawPassword = "SuperSecurePassword123!";
  const hash = await bcrypt.hash(rawPassword, 10);
  const isValid = await bcrypt.compare(rawPassword, hash);
  const isInvalid = await bcrypt.compare("WrongPassword", hash);
  assert(isValid && !isInvalid, "BCrypt password hash & comparison");

  // Test 2: Login Zod Validation
  const validLogin = loginSchema.safeParse({ email: "admin@webgent.com", password: "password" });
  const invalidEmail = loginSchema.safeParse({ email: "invalid-email", password: "password" });
  const missingPassword = loginSchema.safeParse({ email: "admin@webgent.com", password: "" });
  assert(validLogin.success, "Login validation with valid input");
  assert(!invalidEmail.success, "Login validation rejects invalid email");
  assert(!missingPassword.success, "Login validation rejects empty password");

  // Test 3: Change Password Zod Validation
  const validChange = changePasswordSchema.safeParse({
    currentPassword: "OldPassword123!",
    newPassword: "NewPassword123!",
    confirmPassword: "NewPassword123!",
  });
  const mismatchChange = changePasswordSchema.safeParse({
    currentPassword: "OldPassword123!",
    newPassword: "NewPassword123!",
    confirmPassword: "DifferentPassword123!",
  });
  const weakPasswordChange = changePasswordSchema.safeParse({
    currentPassword: "OldPassword123!",
    newPassword: "weak",
    confirmPassword: "weak",
  });
  assert(validChange.success, "Change password validation with matching passwords");
  assert(!mismatchChange.success, "Change password validation rejects mismatched passwords");
  assert(!weakPasswordChange.success, "Change password validation rejects weak password");

  // Test 4: Rate Limiting
  const ip = "192.168.1.100";
  let rateLimitResult = { success: true };
  for (let i = 0; i < 5; i++) {
    rateLimitResult = await checkRateLimit(ip, 5, 60000);
  }
  const exceededResult = await checkRateLimit(ip, 5, 60000);
  assert(rateLimitResult.success && !exceededResult.success, "Rate limiter blocks excessive attempts");

  // Test 5: DB Error Masking
  const formattedError = formatDatabaseError(new Error("Database connection lost"));
  assert(formattedError.code === "UNKNOWN_DB_ERROR", "DB Error formatter masks internal errors");

  console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

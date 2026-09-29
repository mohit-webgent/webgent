import { slugify, calculateReadTime, parseTags, formatTags } from "../src/lib/blog/utils";
import { blogPostSchema, blogQuerySchema } from "../src/lib/validations/blog";

async function runBlogTests() {
  console.log("🧪 Running Phase 6 Blog CMS Functional Test Suite...\n");
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

  // Test 1: Slugification
  const slug = slugify("Next.js 14 App Router & MDX Integration in 2026!");
  assert(
    slug === "nextjs-14-app-router-mdx-integration-in-2026",
    `Slugify converts blog title properly (Got: ${slug})`
  );

  // Test 2: Read-time Calculation (~200 words/min)
  const sampleContent = Array(450).fill("word").join(" ");
  const readTime = calculateReadTime(sampleContent);
  assert(readTime === 3, `Calculates read time correctly (Expected 3 mins for 450 words, Got: ${readTime})`);

  // Test 3: Tag Parsing & Formatting
  const parsed = parseTags("nextjs, Typescript, Prisma , , architecture");
  assert(
    parsed.length === 4 && parsed.includes("nextjs") && parsed.includes("typescript"),
    "Normalizes and cleans raw comma-separated tag input"
  );
  const formatted = formatTags(["nextjs", "TypeScript"]);
  assert(formatted === "nextjs,typescript", "Formats array of tags into database string");

  // Test 4: Zod Blog Post Validation - Valid Input
  const validInput = blogPostSchema.safeParse({
    title: "Mastering Database Migration Strategies",
    content: "Detailed markdown content discussing zero-downtime database migrations...",
    status: "PUBLISHED",
    featured: true,
    tags: ["database", "postgresql"],
  });
  assert(validInput.success, "Valid blog post input passes Zod validation");

  // Test 5: Zod Blog Post Validation - Rejects Short Title & Short Content
  const invalidInput = blogPostSchema.safeParse({
    title: "Hi",
    content: "Short",
  });
  assert(!invalidInput.success, "Rejects post with title < 3 chars or content < 10 chars");

  // Test 6: Query Parameter Schema Validation
  const validQuery = blogQuerySchema.safeParse({
    page: "2",
    limit: "15",
    tag: "nextjs",
    status: "PUBLISHED",
  });
  assert(
    validQuery.success && validQuery.data.page === 2 && validQuery.data.limit === 15,
    "Coerces string pagination parameters into numbers"
  );

  console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runBlogTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

import { slugify } from "../src/lib/projects/slug";
import { projectSchema, projectReorderSchema } from "../src/lib/validations/project";
import { storageService } from "../src/lib/services/storage";

async function runProjectTests() {
  console.log("🧪 Running Phase 5 Portfolio & Project CMS Test Suite...\n");
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

  // Test 1: Slugify Utility
  const slug1 = slugify("NextGen Enterprise SaaS Platform 2026!");
  assert(slug1 === "nextgen-enterprise-saas-platform-2026", `Slugify converts title properly (Got: ${slug1})`);

  // Test 2: Valid Project Creation Zod Validation
  const validProject = projectSchema.safeParse({
    title: "Webgent AI Assistant",
    description: "An intelligent autonomous agent platform for modern web engineering.",
    category: "AI & Cloud",
    technologies: "Next.js, TypeScript, PostgreSQL",
    featured: true,
    published: true,
  });
  assert(validProject.success, "Valid project input passes Zod validation");

  // Test 3: Short Description Validation Failure
  const invalidProject = projectSchema.safeParse({
    title: "Webgent AI",
    description: "Tiny", // < 5 chars
  });
  assert(!invalidProject.success, "Rejects short description under 5 characters");

  // Test 4: Reorder Schema Validation
  const validReorder = projectReorderSchema.safeParse({
    items: [
      { id: "proj-1", order: 0 },
      { id: "proj-2", order: 1 },
    ],
  });
  assert(validReorder.success, "Valid reorder payload passes Zod validation");

  // Test 5: Storage Asset Deletion Hook
  const deletionResult = await storageService.deleteFile("https://storage.webgent.com/cover.png");
  assert(deletionResult === true, "Storage service asset deletion hook executes safely");

  console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runProjectTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

/**
 * Earlier seed data created sample portfolio projects with invented clients. This hides them from
 * the public site if they exist in your database.
 *
 * Preview:  npx tsx --env-file=.env scripts/unpublish-sample-projects.ts
 * Apply:    npx tsx --env-file=.env scripts/unpublish-sample-projects.ts --apply
 *
 * Projects are only unpublished, never deleted. Republish any of them from the admin panel.
 */
import { prisma } from "../src/lib/db";

const SAMPLE_PROJECT_SLUGS = [
  "nextgen-enterprise-saas-platform",
  "fintech-realtime-trading-portal",
  "healthcare-digital-patient-portal",
];

async function main() {
  const apply = process.argv.includes("--apply");
  const projects = await prisma.project.findMany({
    where: { slug: { in: SAMPLE_PROJECT_SLUGS }, published: true },
    select: { slug: true, title: true, clientName: true },
  });

  if (projects.length === 0) {
    console.log("No published sample projects found. Nothing to do.");
    return;
  }

  for (const project of projects) {
    console.log(`${apply ? "Unpublishing" : "Would unpublish"}: ${project.title} (${project.slug})`);
  }

  if (!apply) {
    console.log("\nPreview only. Re-run with --apply to make this change.");
    return;
  }

  const { count } = await prisma.project.updateMany({
    where: { slug: { in: projects.map((project) => project.slug) } },
    data: { published: false, featured: false },
  });
  console.log(`\nUnpublished ${count} project(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

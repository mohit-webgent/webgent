import { prisma } from "../src/lib/db";

async function main() {
  console.log("Connecting to DB...");
  const count = await prisma.testimonial.count();
  console.log("Current Testimonial count:", count);
  if (count > 0) {
    const deleted = await prisma.testimonial.deleteMany({});
    console.log("Deleted testimonials:", deleted.count);
  }

  // Also check projects with HIPAA
  const projects = await prisma.project.findMany({});
  console.log(`Found ${projects.length} projects in DB`);
  for (const p of projects) {
    if (p.description?.includes("HIPAA") || p.title?.includes("HIPAA")) {
      console.log("Updating project:", p.slug);
      await prisma.project.update({
        where: { id: p.id },
        data: {
          title: "Telehealth Patient Portal (Concept)",
          description: "Concept project: Telemedicine and appointment scheduling interface for private clinics and healthcare practitioners.",
          clientName: null,
        },
      });
    }
  }

  console.log("DB cleaning finished.");
}

main().catch(console.error).finally(() => process.exit(0));

import { prisma } from "../src/lib/db";

async function run() {
  // 1. Mark existing blog posts as DRAFT so no fabricated publication dates show
  await prisma.blogPost.updateMany({
    data: { status: "DRAFT", publishedAt: null },
  });
  console.log("✅ Updated blog posts to DRAFT (no fabricated dates)");

  // 2. Delete all placeholder testimonials
  const deletedReviews = await prisma.testimonial.deleteMany();
  console.log(`✅ Cleared ${deletedReviews.count} placeholder testimonials from DB`);

  // 3. Upsert real client work: Edayaa Jewellery
  const admin = await prisma.user.findFirst();
  if (admin) {
    await prisma.project.upsert({
      where: { slug: "edayaa-jewellery" },
      update: {
        title: "Edayaa Jewellery E-Commerce Store",
        category: "E-Commerce & Retail",
        clientName: "Edayaa Jewellery Ltd.",
        published: true,
        featured: true,
        order: 1,
      },
      create: {
        title: "Edayaa Jewellery E-Commerce Store",
        slug: "edayaa-jewellery",
        description:
          "High-performance artisan silver jewellery online store with Razorpay payment gateway, shopping cart, and mobile-optimized catalog.",
        content:
          "### Project Overview\n\nFull production e-commerce website designed and developed for Edayaa Jewellery. Features dynamic product filtering, secure UPI and card payments, and fast mobile browsing.",
        clientName: "Edayaa Jewellery Ltd.",
        category: "E-Commerce & Retail",
        imageUrl:
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
        screenshots: JSON.stringify([
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
        ]),
        demoUrl: "https://edayaajewellery.com",
        technologies: "Next.js 14, TypeScript, TailwindCSS, Razorpay, PostgreSQL, Prisma",
        featured: true,
        published: true,
        order: 1,
        seoTitle: "Edayaa Jewellery E-Commerce Case Study | Webgent",
        seoDescription:
          "Production e-commerce case study for Edayaa Jewellery built with Next.js and Razorpay.",
        authorId: admin.id,
      },
    });
    console.log("✅ Upserted Edayaa Jewellery production project");
  }
}

run().finally(() => process.exit(0));

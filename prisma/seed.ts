import {
  PrismaClient,
  UserRole,
  UserStatus,
  LeadStatus,
  TestimonialStatus,
  SubscriberStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting development database seed...");

  const isProduction = process.env.NODE_ENV === "production";
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@webgent.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("Set SEED_ADMIN_PASSWORD before seeding. There is no default password.");
  }

  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "System Admin",
        passwordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    console.log(`✅ Created admin user: ${adminUser.email}`);
  } else {
    console.log(`ℹ️ Admin user (${adminEmail}) already exists.`);
  }

  const sampleProjects = [
    {
      title: "Edayaa Jewellery E-Commerce Store",
      slug: "edayaa-jewellery",
      description:
        "High-performance artisan silver jewellery online store with Razorpay payment gateway, shopping cart, and mobile-optimized catalog.",
      content:
        "### Project Overview\n\nFull production e-commerce website designed and developed for Edayaa Jewellery. Features dynamic product filtering, secure UPI and card payments, and fast mobile browsing.",
      clientName: "Edayaa Jewellery",
      category: "E-Commerce & Retail",
      imageUrl:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      ]),
      demoUrl: "https://edayaajewellery.com",
      githubUrl: undefined,
      technologies: "Next.js 14, TypeScript, TailwindCSS, Razorpay, PostgreSQL, Prisma",
      featured: true,
      published: true,
      order: 1,
      seoTitle: "Edayaa Jewellery E-Commerce Case Study | Webgent",
      seoDescription: "Production e-commerce case study for Edayaa Jewellery built with Next.js and Razorpay.",
      authorId: adminUser.id,
    },
  ];

  for (const proj of sampleProjects) {
    await prisma.project.upsert({
      where: { slug: proj.slug },
      update: {},
      create: proj,
    });
  }
  console.log("✅ Seeded portfolio projects.");

  // Everything below this block is sample content for local development only.

  if (!isProduction) {
  const sampleLeads = [
    {
      name: "Sarah Jenkins",
      email: "sarah@acmecorp.com",
      company: "Acme Innovations",
      phone: "+1 (555) 234-5678",
      service: "Enterprise Web App",
      budget: "$25k - $50k",
      message:
        "Looking to rebuild our core B2B customer portal using Next.js, Prisma, and TailwindCSS.",
      status: LeadStatus.NEW,
      score: 85,
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
    {
      name: "David Miller",
      email: "david@nexuslabs.io",
      company: "Nexus Labs",
      phone: "+1 (555) 987-6543",
      service: "AI Integration",
      budget: "$50k+",
      message:
        "Need specialized AI engineering support to integrate autonomous agents into our SaaS app.",
      status: LeadStatus.CONTACTED,
      score: 95,
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    },
  ];

  for (const lead of sampleLeads) {
    const existing = await prisma.lead.findFirst({
      where: { email: lead.email },
    });
    if (!existing) {
      await prisma.lead.create({ data: lead });
    }
  }
  console.log("✅ Seeded sample CRM leads.");

  const samplePosts = [
    {
      title: "Building High-Scale Multi-Tenant Applications with Next.js 14 and Prisma",
      slug: "building-multitenant-apps-nextjs14-prisma",
      excerpt:
        "Explore architectural strategies for tenant isolation, database connection pool tuning, and global state management in modern Next.js 14 applications.",
      content: `# Building High-Scale Multi-Tenant Applications

Multi-tenancy is a fundamental requirement for modern SaaS platforms. In this deep dive, we explore how to design tenant-isolated architectures using Next.js 14 App Router and Prisma ORM.

## Key Architectural Principles

1. **Schema vs Row-Level Isolation**: Row-level tenant isolation using tenant IDs.
2. **Prisma Connection Pooling**: Managing database connection lifecycles across serverless routes.
3. **Middleware Authorization**: Validating tenant headers and JWT claims on incoming edge requests.

## Code Example

\`\`\`typescript
import { prisma } from "@/lib/db";

export async function getTenantData(tenantId: string) {
  return await prisma.project.findMany({
    where: { authorId: tenantId },
  });
}
\`\`\`

Conclusion: By structuring database queries with tenant scope, applications stay secure and performant.`,
      coverImage:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
      ogImage:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
      category: "Architecture",
      tags: "nextjs,prisma,typescript,architecture",
      readTime: 3,
      status: "DRAFT" as const,
      featured: false,
      publishedAt: null,
      views: 0,
      seoTitle: "Building Multi-Tenant Apps with Next.js 14 & Prisma",
      seoDescription: "Learn multi-tenant SaaS architecture principles with Next.js and Prisma.",
      authorId: adminUser.id,
    },
    {
      title: "Optimizing PostgreSQL Query Performance and Indexing Strategies",
      slug: "optimizing-postgresql-query-performance-indexing",
      excerpt:
        "A practical guide to database indexing, query execution plan analysis, and B-tree optimization for high-throughput Next.js backends.",
      content: `# Optimizing PostgreSQL Performance

Database latency is often the primary bottleneck in web application throughput. Understanding PostgreSQL indexing strategies can dramatically cut response times.

## Index Types & Recommendations

- **B-Tree Indexes**: Ideal for equality and range queries on IDs, timestamps, and numbers.
- **GIN Indexes**: Recommended for array columns and JSONB search payloads.
- **Composite Indexes**: Use multi-column indexes for queries filtering on combined predicates like \`where: { status: "PUBLISHED", publishedAt: { lte: now } }\`.`,
      coverImage:
        "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
      ogImage:
        "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
      category: "Database",
      tags: "postgresql,prisma,performance,database",
      readTime: 4,
      status: "DRAFT" as const,
      featured: false,
      publishedAt: null,
      views: 0,
      seoTitle: "PostgreSQL Query Performance & Indexing Guide",
      seoDescription: "Optimize PostgreSQL queries and index strategies for Next.js applications.",
      authorId: adminUser.id,
    },
  ];

  for (const post of samplePosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log("✅ Seeded sample blog posts.");
  }

  const defaultSettings = [
    {
      key: "site_name",
      value: "Webgent",
      description: "Official Site Name",
      isPublic: true,
    },
    {
      key: "site_tagline",
      value: "Next-Gen Web Solutions & Engineering",
      description: "Hero Tagline",
      isPublic: true,
    },
    {
      key: "contact_email",
      value: "mohitvermag75@gmail.com",
      description: "Primary Contact Email",
      isPublic: true,
    },
    {
      key: "contact_phone",
      value: "+91 8800241462",
      description: "Support Phone Number",
      isPublic: true,
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Seeded site configuration settings.");

  // Testimonials: Empty by default. Real testimonials will be added by genuine clients.
  console.log("ℹ️ Testimonials: Zero fabricated testimonials seeded.");

  if (!isProduction) {
  const sampleSubscribers = [
    {
      email: "subscriber@example.com",
      name: "Jordan Lee",
      status: SubscriberStatus.ACTIVE,
      isActive: true,
      subscribedAt: new Date(),
    },
  ];

  for (const sub of sampleSubscribers) {
    await prisma.subscriber.upsert({
      where: { email: sub.email },
      update: {},
      create: sub,
    });
  }
  console.log("✅ Seeded sample newsletter subscribers.");
  }

  console.log("\n🎉 Database seed complete! All models populated.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

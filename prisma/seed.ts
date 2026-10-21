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

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@webgent.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMeInProduction123!";

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
      clientName: "Edayaa Jewellery Ltd.",
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
    {
      title: "Cloud Analytics Platform",
      slug: "nextgen-enterprise-saas-platform",
      description:
        "High-performance multi-tenant cloud analytics dashboard designed for high-concurrency data reporting.",
      content:
        "### Technical Architecture Highlights\n\n- Multi-tenant architecture with tenant isolation\n- Real-time data processing pipeline\n- Micro-frontend architecture with Next.js App Router and TailwindCSS",
      clientName: "Enterprise Cloud Systems",
      category: "Cloud Architecture",
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80",
      ]),
      demoUrl: undefined,
      githubUrl: "https://github.com/webgent/nextgen-saas",
      technologies: "Next.js, TypeScript, PostgreSQL, Prisma, TailwindCSS, Docker",
      featured: true,
      published: true,
      order: 2,
      seoTitle: "Cloud Analytics Platform | Webgent Portfolio",
      seoDescription: "Multi-tenant SaaS analytics architecture case study.",
      authorId: adminUser.id,
    },
    {
      title: "Real-Time Trading Interface",
      slug: "fintech-realtime-trading-portal",
      description:
        "Responsive trading interface engineered with WebSockets and modular charting components.",
      content:
        "### Architecture Overview\n\nBuilt with WebSockets and custom charting components to render financial data updates with smooth frame rates.",
      clientName: "Fintech Global Markets",
      category: "Fintech Systems",
      imageUrl:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
      ]),
      demoUrl: undefined,
      githubUrl: "https://github.com/webgent/fintech-portal",
      technologies: "React, TypeScript, WebSockets, Node.js, Redis",
      featured: true,
      published: true,
      order: 3,
      seoTitle: "Real-Time Trading Interface Case Study",
      seoDescription: "High-throughput WebSockets and real-time dashboard UI.",
      authorId: adminUser.id,
    },
    {
      title: "Patient Telemedicine Portal",
      slug: "healthcare-digital-patient-portal",
      description:
        "Telemedicine and appointment scheduling interface for private clinics and healthcare practitioners.",
      content:
        "### Platform Architecture\n\nEncrypted record storage patterns, WebRTC consultation flows, and automated appointment reminders.",
      clientName: "Telehealth Care Systems",
      category: "Healthcare Technology",
      imageUrl:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
      ]),
      demoUrl: undefined,
      githubUrl: undefined,
      technologies: "Next.js, TailwindCSS, WebRTC, PostgreSQL",
      featured: true,
      published: true,
      order: 4,
      seoTitle: "Patient Telemedicine Portal Case Study",
      seoDescription: "Clinic booking and telehealth consultation platform.",
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
  console.log("✅ Seeded sample portfolio projects.");

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

  const defaultSettings = [
    {
      key: "site_name",
      value: "Webgent",
      description: "Official Site Name",
      isPublic: true,
    },
    {
      key: "site_tagline",
      value: "Next-Gen Web Solutions & Enterprise Software",
      description: "Hero Tagline",
      isPublic: true,
    },
    {
      key: "contact_email",
      value: "hello@webgent.com",
      description: "Primary Contact Email",
      isPublic: true,
    },
    {
      key: "contact_phone",
      value: "+1 (800) 555-WEBGENT",
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

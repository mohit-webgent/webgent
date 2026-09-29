import { PrismaClient, UserRole, UserStatus, LeadStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting development database seed...");

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@webgent.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMeInProduction123!";

  // 1. Admin User Seed
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

  // 2. Sample Projects / Portfolio Seed
  const sampleProjects = [
    {
      title: "NextGen Enterprise SaaS Platform",
      slug: "nextgen-enterprise-saas-platform",
      description: "An AI-powered multi-tenant cloud analytics platform designed for high-scale enterprise operations.",
      content: "### Architectural Highlights\n\n- Multi-tenant architecture with row-level tenant isolation\n- Real-time data processing pipeline handling 10k events/sec\n- Micro-frontend architecture with Next.js App Router and TailwindCSS\n- Automated CI/CD integration with automated smoke testing",
      clientName: "Enterprise Cloud Systems",
      category: "AI & Cloud Infrastructure",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80"
      ]),
      demoUrl: "https://demo.webgent.com/nextgen",
      githubUrl: "https://github.com/webgent/nextgen-saas",
      technologies: "Next.js, TypeScript, PostgreSQL, Prisma, TailwindCSS, Docker",
      featured: true,
      published: true,
      order: 1,
      seoTitle: "NextGen Enterprise SaaS Platform | Webgent Portfolio",
      seoDescription: "Case study on building a high-scale enterprise SaaS analytics engine.",
      authorId: adminUser.id,
    },
    {
      title: "Fintech Real-Time Trading Portal",
      slug: "fintech-realtime-trading-portal",
      description: "Ultra-low latency web interface for institutional crypto and stock algorithmic trading.",
      content: "### Platform Overview\n\nBuilt with WebSockets, Web Workers, and custom charting engines to render high-frequency ticker updates without frame drops.",
      clientName: "Apex Financial",
      category: "Fintech & Web3",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80"
      ]),
      demoUrl: "https://demo.webgent.com/fintech",
      githubUrl: "https://github.com/webgent/fintech-portal",
      technologies: "React, TypeScript, WebSockets, Node.js, Redis",
      featured: true,
      published: true,
      order: 2,
      seoTitle: "Fintech Real-Time Trading Portal Case Study",
      seoDescription: "High frequency trading portal built with WebSockets and React.",
      authorId: adminUser.id,
    },
    {
      title: "Healthcare Digital Patient Portal",
      slug: "healthcare-digital-patient-portal",
      description: "HIPAA-compliant telemedicine and appointment scheduling portal for modern healthcare providers.",
      content: "### Security & Compliance\n\nEnd-to-end encrypted medical record storage, WebRTC encrypted video consultations, and automated patient notifications.",
      clientName: "CarePlus Medical Group",
      category: "Healthcare Technology",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
      screenshots: JSON.stringify([
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
      ]),
      demoUrl: "https://demo.webgent.com/healthcare",
      githubUrl: undefined,
      technologies: "Next.js, TailwindCSS, WebRTC, PostgreSQL, AWS KMS",
      featured: true,
      published: true,
      order: 3,
      seoTitle: "Healthcare Telemedicine Portal Case Study",
      seoDescription: "HIPAA compliant patient booking and telehealth platform.",
      authorId: adminUser.id,
    }
  ];

  for (const proj of sampleProjects) {
    await prisma.project.upsert({
      where: { slug: proj.slug },
      update: {},
      create: proj,
    });
  }
  console.log("✅ Seeded sample portfolio projects.");

  // 3. Sample Leads Seed
  const sampleLeads = [
    {
      name: "Sarah Jenkins",
      email: "sarah@acmecorp.com",
      company: "Acme Innovations",
      phone: "+1 (555) 234-5678",
      service: "Enterprise Web App",
      budget: "$25k - $50k",
      message: "Looking to rebuild our core B2B customer portal using Next.js, Prisma, and TailwindCSS.",
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
      message: "Need specialized AI engineering support to integrate autonomous agents into our SaaS app.",
      status: LeadStatus.CONTACTED,
      score: 95,
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    }
  ];

  for (const lead of sampleLeads) {
    const existing = await prisma.lead.findFirst({ where: { email: lead.email } });
    if (!existing) {
      await prisma.lead.create({ data: lead });
    }
  }
  console.log("✅ Seeded sample CRM leads.");

  // 4. Sample Blog Posts Seed
  const samplePosts = [
    {
      title: "Building High-Scale Multi-Tenant Applications with Next.js 14 and Prisma",
      slug: "building-multitenant-apps-nextjs14-prisma",
      excerpt: "Explore architectural strategies for tenant isolation, database connection pool tuning, and global state management in modern Next.js 14 applications.",
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
      coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
      ogImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
      category: "Architecture",
      tags: "nextjs,prisma,typescript,architecture",
      readTime: 3,
      status: "PUBLISHED" as const,
      featured: true,
      publishedAt: new Date(),
      views: 142,
      seoTitle: "Building Multi-Tenant Apps with Next.js 14 & Prisma",
      seoDescription: "Learn multi-tenant SaaS architecture principles with Next.js and Prisma.",
      authorId: adminUser.id,
    },
    {
      title: "Optimizing PostgreSQL Query Performance and Indexing Strategies",
      slug: "optimizing-postgresql-query-performance-indexing",
      excerpt: "A practical guide to database indexing, query execution plan analysis, and B-tree optimization for high-throughput Next.js backends.",
      content: `# Optimizing PostgreSQL Performance

Database latency is often the primary bottleneck in web application throughput. Understanding PostgreSQL indexing strategies can dramatically cut response times.

## Index Types & Recommendations

- **B-Tree Indexes**: Ideal for equality and range queries on IDs, timestamps, and numbers.
- **GIN Indexes**: Recommended for array columns and JSONB search payloads.
- **Composite Indexes**: Use multi-column indexes for queries filtering on combined predicates like \`where: { status: "PUBLISHED", publishedAt: { lte: now } }\`.`,
      coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
      ogImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
      category: "Database",
      tags: "postgresql,prisma,performance,database",
      readTime: 4,
      status: "PUBLISHED" as const,
      featured: false,
      publishedAt: new Date(),
      views: 89,
      seoTitle: "PostgreSQL Query Performance & Indexing Guide",
      seoDescription: "Optimize PostgreSQL queries and index strategies for Next.js applications.",
      authorId: adminUser.id,
    }
  ];

  for (const post of samplePosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log("✅ Seeded sample blog posts.");

  // 4. Default Public Site Settings Seed
  const defaultSettings = [
    { key: "site_name", value: "Webgent", description: "Official Site Name", isPublic: true },
    { key: "site_tagline", value: "Next-Gen Web Solutions & Enterprise Software", description: "Hero Tagline", isPublic: true },
    { key: "contact_email", value: "hello@webgent.com", description: "Primary Contact Email", isPublic: true },
    { key: "contact_phone", value: "+1 (800) 555-WEBGENT", description: "Support Phone Number", isPublic: true },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Seeded site configuration settings.");

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

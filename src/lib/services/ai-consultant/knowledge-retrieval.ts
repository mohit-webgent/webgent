/**
 * Dynamic Website Knowledge Retrieval Layer
 * Indexes Webgent's authoritative content:
 * - Public website pages (Home, About, Work, Pricing, Services, Contact, Testimonials)
 * - Authoritative business configuration & pricing rules (packages, add-on features, architecture, maintenance)
 * - Founder profile & credentials (Mohit Verma)
 * - Dynamic portfolio case studies & testimonials from Prisma database
 * 
 * Provides safe, bounded, in-memory BM25-style keyword and semantic relevance scoring.
 * Strictly bounded to Webgent internal data (zero SSRF, zero arbitrary URL crawling).
 */

import { prisma } from "@/lib/db";
import { FOUNDER_PROFILE } from "@/data/founder-profile";
import { siteConfig } from "@/config/site";
import {
  WEBSITE_TYPES,
  COST_PER_EXTRA_PAGE,
} from "@/lib/pricing.config";
import {
  MASTER_PACKAGES,
} from "@/data/pricing-matrix-data";
import {
  MAINTENANCE_PLANS,
  DOMAIN_BLUEPRINTS,
} from "./knowledge-base";
import { logger } from "@/lib/logger";

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: "service" | "pricing" | "portfolio" | "about" | "policy" | "tech";
  url: string;
  summary: string;
  content: string;
  keywords: string[];
}

export interface RetrievalResult {
  doc: KnowledgeDocument;
  score: number;
}

let cachedIndex: KnowledgeDocument[] | null = null;
let lastIndexTimestamp = 0;
const INDEX_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

/**
 * Builds or refreshes the full Webgent knowledge document index.
 */
export async function getWebgentKnowledgeIndex(): Promise<KnowledgeDocument[]> {
  const now = Date.now();
  if (cachedIndex && now - lastIndexTimestamp < INDEX_CACHE_TTL_MS) {
    return cachedIndex;
  }

  const docs: KnowledgeDocument[] = [];

  // 1. Company Identity, Mission & Overview
  docs.push({
    id: "about_webgent",
    title: "About Webgent & Company Identity",
    category: "about",
    url: "/about",
    summary:
      "Webgent is an elite next-generation web solutions and digital engineering agency founded by Mohit Verma.",
    content: `Webgent (${siteConfig.url}) is a modern web development and digital engineering agency.
Tagline: "${siteConfig.tagline}".
Mission: Webgent designs, builds, and scales high-performance web applications, cloud infrastructure, and conversion-focused digital platforms for ambitious modern brands, local businesses, and fast-growing startups.
Location: Gurugram / Noida, India.
Contact: hello@webgent.com / direct contact form at /contact.
Core philosophy: Milestone-based payments (50% upfront, 50% upon final launch review), 100% full source code ownership transferred to the client, zero platform lock-in, and 15 days of free post-launch bug-fix warranty.`,
    keywords: [
      "webgent",
      "company",
      "agency",
      "who are you",
      "about",
      "mission",
      "location",
      "founder",
      "overview",
    ],
  });

  // 2. Founder Profile: Mohit Verma
  docs.push({
    id: "founder_mohit_verma",
    title: "Founder & Lead Developer: Mohit Verma",
    category: "about",
    url: "/about",
    summary:
      "Mohit Verma is the founder and lead software developer behind Webgent, specializing in full-stack Next.js, React, and modern web architectures.",
    content: `Mohit Verma is the Founder & Lead Web Architect at Webgent.
Professional background: Software Developer at DBA Lounge, specialized in React, Next.js 14, TypeScript, Tailwind CSS, Node.js, PostgreSQL, and Prisma.
Education & Experience: Hands-on production engineering across e-commerce, cloud dashboards, SaaS platforms, and digital client experiences.
Profiles: Portfolio (${FOUNDER_PROFILE.portfolioUrl}), GitHub (${FOUNDER_PROFILE.githubUrl}), LinkedIn (${FOUNDER_PROFILE.linkedinUrl}).
Direct Email: ${FOUNDER_PROFILE.email}.
Role in Projects: Mohit personally architectures, leads, and reviews every web engineering project at Webgent, ensuring sub-second load times, clean codebases, and production-grade security.`,
    keywords: [
      "mohit",
      "verma",
      "founder",
      "developer",
      "architect",
      "lead",
      "who built webgent",
      "team",
      "dba lounge",
      "experience",
    ],
  });

  // 3. Core Tech Stack & Engineering Standards
  docs.push({
    id: "tech_stack_standards",
    title: "Webgent Technical Stack & Engineering Standards",
    category: "tech",
    url: "/",
    summary:
      "Next.js 14 App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, Cloudflare CDN, AWS, Razorpay, and Stripe.",
    content: `Webgent builds with a modern, high-performance technology stack:
- Frontend: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, GSAP, Lucide Icons.
- Backend & APIs: Next.js Server Actions, Node.js REST APIs, Edge runtime functions.
- Database & ORM: PostgreSQL, Prisma ORM (strongly typed schemas with automated migrations).
- Caching & Rate Limiting: Upstash Redis for distributed edge caching and rate limiting.
- Cloud & Hosting: Vercel Edge Network, Cloudflare CDN, AWS S3 / Cloudflare R2 for asset storage.
- Payments: Razorpay (India UPI, Cards, Netbanking) and Stripe (Global multi-currency).
- Notifications & Communication: Resend for transactional emails, Twilio & WhatsApp Business Cloud API for instant alerts.
- Security: Cloudflare Turnstile bot protection, CSP headers, sanitized inputs, and strict rate limits.`,
    keywords: [
      "tech stack",
      "technology",
      "technologies",
      "nextjs",
      "react",
      "typescript",
      "postgresql",
      "prisma",
      "tailwind",
      "framework",
      "database",
      "backend",
    ],
  });

  // 4. Services Catalogue
  docs.push({
    id: "services_catalogue",
    title: "Webgent Core Services & Solutions",
    category: "service",
    url: "/#services",
    summary:
      "Full-stack web applications, dynamic database portals, e-commerce stores, booking platforms, internal tooling, and UI/UX design.",
    content: `Webgent offers 5 core engineering services:
1. Full-Stack Web Application Engineering: Custom SaaS MVPs, client portals, internal dashboards, and transactional web software.
2. High-Performance Business Websites: Conversion-focused corporate and brand websites with sub-second page loads and technical SEO.
3. E-Commerce & Online Stores: Custom product catalogs, shopping cart drawers, Razorpay/Stripe checkout, GST invoicing, and inventory management.
4. Booking & Appointment Platforms: Real-time calendar slot reservation, practitioner selection, advance booking payment, and WhatsApp alerts.
5. Internal Operations & Staff Portals: Secure role-based staff directories, attendance tracking, leave workflows, and executive analytics.`,
    keywords: [
      "services",
      "what do you do",
      "solutions",
      "capabilities",
      "what webgent offers",
      "custom website",
      "web apps",
      "ecommerce",
      "booking",
      "portal",
    ],
  });

  // 5. Official Pricing Packages & Architecture Tiers
  docs.push({
    id: "pricing_packages",
    title: "Webgent Pricing Packages, Plans & Architecture Options",
    category: "pricing",
    url: "/pricing",
    summary:
      "Transparent pricing: Starter (₹9,999), Business (₹19,999), Pro (₹39,999). Static vs. Dynamic architecture (+₹8,000).",
    content: `Webgent maintains transparent, milestone-based pricing packages:
- Starter Package (₹${MASTER_PACKAGES.starter.startingPrice.toLocaleString("en-IN")}): ${MASTER_PACKAGES.starter.tagline}. Best for local businesses, portfolios, and marketing pages. Includes up to 5 static pages, contact form, WhatsApp chat, and 5–7 days delivery.
- Business Package (₹${MASTER_PACKAGES.business.startingPrice.toLocaleString("en-IN")}): ${MASTER_PACKAGES.business.tagline}. Best for growing companies requiring dynamic content, lead capture, and SEO. Includes up to 8 pages, CMS integration, and 7–10 days delivery.
- Pro / E-Commerce / SaaS (₹${MASTER_PACKAGES.pro.startingPrice.toLocaleString("en-IN")}): ${MASTER_PACKAGES.pro.tagline}. For online stores, platforms, and database-backed web apps with payment gateways, user accounts, and dashboards.
- Architecture Options:
  * Static Website: ₹0 additional cost. Ultra-fast, zero database hosting cost.
  * Dynamic Website: +₹${WEBSITE_TYPES.find((t) => t.id === "dynamic")?.additionalCost.toLocaleString("en-IN") || "8,000"}. Includes PostgreSQL database, editable backend, and dynamic user data storage.
- Page Rules: Base 5 pages included. Extra pages at ₹${COST_PER_EXTRA_PAGE.toLocaleString("en-IN")}/page. Single landing page discount: -₹2,000.
- Express Priority Delivery: Fast-track delivery (3–5 business days) available with dedicated senior engineering sprints (+20% priority fee).`,
    keywords: [
      "pricing",
      "cost",
      "price",
      "packages",
      "starter",
      "business",
      "pro",
      "how much",
      "rates",
      "fees",
      "plans",
      "dynamic website",
      "static website",
    ],
  });

  // 6. Maintenance & Warranty Plans
  docs.push({
    id: "maintenance_warranty_plans",
    title: "Post-Launch Warranty & Monthly Maintenance Plans",
    category: "pricing",
    url: "/pricing",
    summary:
      "15 days of free bug-fix warranty on all projects. Optional Monthly Care: Basic (₹2,000/mo), Standard (₹5,000/mo), Advanced (₹10,000/mo).",
    content: `Every Webgent project comes standard with:
- Standard 15-Day Post-Launch Warranty: 100% free bug-fix warranty, DNS setup, and deployment assistance.
Optional ongoing Monthly Care plans:
1. Monthly Care Basic (₹${MAINTENANCE_PLANS.basic.priceMonthlyINR.toLocaleString("en-IN")}/month): Weekly security updates, 24/7 uptime monitoring, database backup integrity checks, up to 2 hours of monthly content updates. SLA: 24h.
2. Monthly Care Standard (₹${MAINTENANCE_PLANS.standard.priceMonthlyINR.toLocaleString("en-IN")}/month - Most Popular): Dedicated engineering hours (up to 5 hrs/mo), Google Core Web Vitals audits, direct developer WhatsApp channel. SLA: 12h.
3. Monthly Care Advanced (₹${MAINTENANCE_PLANS.advanced.priceMonthlyINR.toLocaleString("en-IN")}/month): Priority enterprise SLA (4h), up to 12 dedicated engineering hours/month, staging environment maintenance, and continuous speed tuning.`,
    keywords: [
      "maintenance",
      "monthly care",
      "warranty",
      "support",
      "post launch",
      "retainer",
      "updates",
      "after delivery",
      "amc",
    ],
  });

  // 7. Payment Gateway & Third-Party Integrations
  docs.push({
    id: "integrations_payments_third_party",
    title: "Payment Gateways & Third-Party Integrations",
    category: "service",
    url: "/#integrations",
    summary:
      "Official integration with Razorpay (UPI, cards, netbanking), Stripe, Shiprocket, Resend, and Meta WhatsApp Business Cloud API.",
    content: `Webgent provides certified, battle-tested integrations:
- Payment Gateways: Razorpay (ideal for India: UPI, Google Pay, PhonePe, Paytm, RuPay/Visa/MasterCard, netbanking, EMI) and Stripe (global international credit cards and multi-currency billing). Gateway transaction fees (~2%) are billed directly by Razorpay/Stripe at actuals with zero agency surcharge.
- WhatsApp Integration: Click-to-chat widgets for instant lead chats, plus automated server-side WhatsApp notifications (order confirmations, booking reminders) using Meta Cloud API or Twilio.
- Shipping & Logistics: Shiprocket API integration for automated courier pickup, tracking IDs, and rate calculation for e-commerce stores.
- Domain & Hosting: Clients retain 100% direct ownership of their domains (Namecheap/GoDaddy) and cloud hosting accounts (Vercel/Cloudflare). Webgent configures all DNS records and SSL certificates free of charge.`,
    keywords: [
      "razorpay",
      "stripe",
      "payment gateway",
      "upi",
      "google pay",
      "phonepe",
      "payments",
      "whatsapp",
      "shiprocket",
      "domain",
      "hosting",
      "third party",
    ],
  });

  // 8. Edayaa Jewellery Store Case Study & E-Commerce Blueprint
  docs.push({
    id: "case_study_edayaa_jewellery",
    title: "Portfolio Showcase: Edayaa Jewellery E-Commerce Store",
    category: "portfolio",
    url: "/work/edayaa-jewellery",
    summary:
      "Production case study for Edayaa Jewellery, an artisan silver jewelry online storefront built with Next.js 14, Tailwind CSS, and Razorpay.",
    content: `Project: Edayaa Jewellery E-Commerce Store (Artisan Silver Jewellery).
Client: Edayaa Jewellery Ltd.
Live URL / Showcase: /work/edayaa-jewellery and featured interactive assembly on the homepage.
Architecture & Features:
- Next.js 14 App Router with React Server Components for instant sub-second catalog loading.
- Tailored jewelry collections: Bangles, Bracelets, Ear Rings, Necklaces, Pendants, and Anklets.
- Seamless product details with zoomable artisan photography, stock status, and customer reviews.
- Slide-out cart drawer with Razorpay checkout (UPI, Cards, Netbanking).
- Automated customer order confirmations and WhatsApp alerts for new purchases.
- Mobile-first responsive luxury design with smooth GSAP micro-animations.`,
    keywords: [
      "edayaa",
      "jewellery",
      "jewelry",
      "silver",
      "store",
      "ecommerce",
      "case study",
      "bangles",
      "necklaces",
      "rings",
      "portfolio",
    ],
  });

  // 9. Digital Product Assembly Process (How We Build)
  docs.push({
    id: "how_we_build_process",
    title: "Webgent Engineering Methodology: The 6-Step Digital Assembly",
    category: "service",
    url: "/#process",
    summary:
      "Structured 6-step assembly: Architecture & Wireframe -> Visual Design -> Component Assembly -> Database Integration -> Core Web Vitals Optimization -> Launch.",
    content: `Webgent adheres to a structured, transparent development methodology:
1. Scoping & Architecture: Establishing technical stack, pages, data schema, and security rules.
2. High-Fidelity UI/UX: Mobile-first responsive layouts, typography, dark mode, and micro-interactions.
3. Modular Component Assembly: Clean React Server Components with Tailwind CSS and atomic design principles.
4. Database & Integrations: PostgreSQL schema setup, Prisma ORM migrations, payment gateway webhooks, and email queues.
5. Speed & SEO Tuning: 100/100 Google Core Web Vitals optimization, asset compression, edge caching, and semantic structured data.
6. Staging Review & Launch: Client staging review, milestone verification, production DNS cutover, and intellectual property transfer.`,
    keywords: [
      "how we build",
      "process",
      "methodology",
      "steps",
      "assembly",
      "development timeline",
      "milestones",
      "stages",
    ],
  });

  // 10. Pull dynamic published projects from Prisma DB
  try {
    const dbProjects = await prisma.project.findMany({
      where: { published: true },
      take: 8,
      orderBy: { order: "asc" },
    });

    for (const proj of dbProjects) {
      docs.push({
        id: `project_${proj.slug}`,
        title: `Portfolio Project: ${proj.title}`,
        category: "portfolio",
        url: `/work/${proj.slug}`,
        summary: proj.description,
        content: `Project Name: ${proj.title}
Category: ${proj.category || "Web Application"}
Client: ${proj.clientName || "Webgent Client"}
Technologies: ${proj.technologies || "Next.js, TypeScript, PostgreSQL, Tailwind"}
Overview: ${proj.description}
${proj.content ? `Details: ${proj.content.slice(0, 300)}...` : ""}
Live Project Link: /work/${proj.slug}`,
        keywords: [
          proj.slug,
          proj.title.toLowerCase(),
          (proj.category || "").toLowerCase(),
          "case study",
          "project",
        ],
      });
    }
  } catch (err) {
    logger.warn("[KnowledgeRetrieval] Could not query Prisma projects", { error: err });
  }

  // 11. Pull testimonials from Prisma DB
  try {
    const dbTestimonials = await prisma.testimonial.findMany({
      where: { status: "APPROVED", deletedAt: null },
      take: 4,
    });

    if (dbTestimonials.length > 0) {
      docs.push({
        id: "client_testimonials",
        title: "Verified Client Reviews & Social Proof",
        category: "about",
        url: "/testimonials",
        summary: "Verified feedback from founders and executives who launched with Webgent.",
        content: dbTestimonials
          .map(
            (t) =>
              `- "${t.content}" — ${t.clientName}${t.clientTitle ? `, ${t.clientTitle}` : ""}${t.company ? ` at ${t.company}` : ""} (${t.rating}/5 stars)`,
          )
          .join("\n"),
        keywords: ["testimonials", "reviews", "clients", "feedback", "ratings", "social proof"],
      });
    }
  } catch (err) {
    logger.warn("[KnowledgeRetrieval] Could not query Prisma testimonials", { error: err });
  }

  // 12. Domain Blueprints (Gym, E-Commerce, Booking, SaaS, Restaurant, etc.)
  for (const [key, bp] of Object.entries(DOMAIN_BLUEPRINTS)) {
    docs.push({
      id: `blueprint_${key}`,
      title: `${bp.displayName} Website Blueprint`,
      category: "service",
      url: `/pricing?cat=${key}`,
      summary: bp.description,
      content: `Industry Blueprint: ${bp.displayName} (${bp.industry})
Typical Pages (${bp.recommendedPageCount}): ${bp.pages.map((p) => `${p.name} (${p.slug})`).join(", ")}
Essential Features: ${bp.essentialFeatures.join(", ")}
Recommended Conversion Features: ${bp.recommendedFeatures.join(", ")}
Default Architecture: ${bp.defaultArchitecture === "dynamic" ? "Dynamic (PostgreSQL + Backend)" : "Static Website"}
Typical Webgent Delivery Timeline: ${bp.typicalTimeline}
Starting Webgent Development Rate: ₹${bp.startingPriceINR.toLocaleString("en-IN")}`,
      keywords: [
        key,
        bp.displayName.toLowerCase(),
        bp.industry.toLowerCase(),
        "blueprint",
        "requirements",
        "recommended pages",
      ],
    });
  }

  cachedIndex = docs;
  lastIndexTimestamp = now;
  return docs;
}

/**
 * Retrieves the most relevant knowledge documents for a visitor query.
 * Uses query tokenization, exact-phrase boosting, and keyword relevance scoring.
 */
export async function retrieveRelevantKnowledge(
  query: string,
  maxResults = 4,
): Promise<RetrievalResult[]> {
  const index = await getWebgentKnowledgeIndex();
  const normalizedQuery = query.toLowerCase().trim();
  const queryTokens = normalizedQuery
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (queryTokens.length === 0) {
    return [];
  }

  const results: RetrievalResult[] = [];

  for (const doc of index) {
    let score = 0;
    const docText = `${doc.title} ${doc.summary} ${doc.content}`.toLowerCase();
    const docKeywords = doc.keywords.map((k) => k.toLowerCase());

    // 1. Exact phrase matching bonus
    if (docText.includes(normalizedQuery)) {
      score += 15;
    }

    // 2. Keyword exact matches
    for (const kw of docKeywords) {
      if (normalizedQuery.includes(kw)) {
        score += 8;
      }
      for (const token of queryTokens) {
        if (kw === token) {
          score += 6;
        } else if (kw.includes(token)) {
          score += 3;
        }
      }
    }

    // 3. Body text token occurrences
    for (const token of queryTokens) {
      const occurrences = (docText.match(new RegExp(`\\b${token}\\b`, "g")) || []).length;
      if (occurrences > 0) {
        score += Math.min(10, occurrences * 1.5);
      }
    }

    // Category boosts for specific intent
    if (
      (normalizedQuery.includes("price") || normalizedQuery.includes("cost") || normalizedQuery.includes("budget") || normalizedQuery.includes("rate")) &&
      doc.category === "pricing"
    ) {
      score += 6;
    }

    if (
      (normalizedQuery.includes("jewellery") || normalizedQuery.includes("jewelry") || normalizedQuery.includes("store") || normalizedQuery.includes("ecommerce")) &&
      doc.id.includes("jewellery")
    ) {
      score += 12;
    }

    if (
      (normalizedQuery.includes("mohit") || normalizedQuery.includes("founder") || normalizedQuery.includes("developer") || normalizedQuery.includes("who are you")) &&
      doc.id.includes("founder")
    ) {
      score += 12;
    }

    if (score > 3) {
      results.push({ doc, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}

/**
 * Builds a clean prompt snippet from retrieved knowledge documents to inject into Gemini context.
 */
export function formatRetrievedKnowledgeForPrompt(results: RetrievalResult[]): string {
  if (results.length === 0) return "";

  let output = "### RETRIEVED WEBGENT GROUND TRUTH & WEBSITE CONTENT:\n";
  output += "Use the following factual information directly from Webgent's official pages and data:\n\n";

  for (const { doc } of results) {
    output += `--- [Source: ${doc.title} (${doc.url})] ---\n`;
    output += `${doc.content}\n\n`;
  }

  return output.trim();
}

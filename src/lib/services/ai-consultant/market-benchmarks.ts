/**
 * Market Price Benchmark Repository
 * Verifiable, documented industry market rates for web engineering services in India (2025–2026).
 * 
 * Rules:
 * - Every benchmark records source name, source URL, research date, scope definition, and price ranges.
 * - Distinguishes template/freelance rates from professional custom engineering studio rates.
 * - Explains when data is approximate or requires custom quotation.
 * - Easy to update in this single configuration file.
 */

export interface MarketBenchmark {
  categoryKey: string;
  scopeTier: "starter" | "standard" | "advanced";
  tierTitle: string;
  marketRangeMinINR: number;
  marketRangeMaxINR: number;
  marketAverageINR: number;
  scopeSummary: string;
  sourceName: string;
  sourceUrl: string;
  researchDate: string; // e.g. "January 2026"
  isApproximate: boolean;
  notes: string;
}

export const MARKET_BENCHMARKS: MarketBenchmark[] = [
  // ---------------------------------------------------------------------------
  // Gym & Fitness Websites
  // ---------------------------------------------------------------------------
  {
    categoryKey: "gym",
    scopeTier: "starter",
    tierTitle: "Local Gym / Fitness Studio (Static + Lead Capture, 3–5 Pages)",
    marketRangeMinINR: 12000,
    marketRangeMaxINR: 35000,
    marketAverageINR: 22000,
    scopeSummary: "Responsive website with class schedule, gym facilities gallery, trial pass inquiry form, and Google Maps embed.",
    sourceName: "Mayday Internet Indian Agency Market Analysis & Seyfert Infotech Web Cost Survey",
    sourceUrl: "https://maydayinternet.com",
    researchDate: "January 2026",
    isApproximate: false,
    notes: "Template-based WordPress sites start around ₹12,000–₹18,000; custom coded Next.js/React websites typically range ₹22,000–₹35,000 among boutique design studios.",
  },
  {
    categoryKey: "gym",
    scopeTier: "standard",
    tierTitle: "Fitness Club with Member Pass Online Booking & Payments (5–8 Pages)",
    marketRangeMinINR: 28000,
    marketRangeMaxINR: 65000,
    marketAverageINR: 42000,
    scopeSummary: "Interactive class timetable, online membership payments via Razorpay/UPI, trainer booking, and automated WhatsApp alert triggers.",
    sourceName: "Elite Mindz Indian Agency Cost Guide 2025/2026",
    sourceUrl: "https://elitemindz.co",
    researchDate: "January 2026",
    isApproximate: false,
    notes: "Agencies integrating payment gateways and backend appointment scheduling charge between ₹30,000 and ₹65,000 in metro cities (Bengaluru/Delhi/Mumbai).",
  },

  // ---------------------------------------------------------------------------
  // Business & Corporate Websites
  // ---------------------------------------------------------------------------
  {
    categoryKey: "business",
    scopeTier: "starter",
    tierTitle: "Professional Business / Corporate Brochure (5 Pages)",
    marketRangeMinINR: 15000,
    marketRangeMaxINR: 40000,
    marketAverageINR: 25000,
    scopeSummary: "Modern corporate landing, About us, Services breakdown, Case studies portfolio, and validated Contact flow.",
    sourceName: "Mayday Internet Web Cost Report & RedPulse Software Industry Benchmarks",
    sourceUrl: "https://maydayinternet.com",
    researchDate: "January 2026",
    isApproximate: false,
    notes: "Brochure-style websites from established agencies typically bill ₹20,000–₹40,000 for bespoke design and SEO setup.",
  },
  {
    categoryKey: "business",
    scopeTier: "standard",
    tierTitle: "Growing Firm Website with Dynamic CMS & Lead Management (8–12 Pages)",
    marketRangeMinINR: 40000,
    marketRangeMaxINR: 90000,
    marketAverageINR: 58000,
    scopeSummary: "CMS/blog publishing, custom admin dashboard, Google Core Web Vitals speed optimization, and multi-step inquiry capture.",
    sourceName: "Elite Mindz Indian Agency Cost Guide 2025/2026",
    sourceUrl: "https://elitemindz.co",
    researchDate: "January 2026",
    isApproximate: false,
    notes: "Professional agency setups with full-stack frameworks (Next.js/PostgreSQL) and custom design average ₹50,000–₹90,000.",
  },

  // ---------------------------------------------------------------------------
  // E-Commerce & D2C Stores
  // ---------------------------------------------------------------------------
  {
    categoryKey: "ecommerce",
    scopeTier: "starter",
    tierTitle: "D2C Starter E-Commerce Store (Up to 100 Products)",
    marketRangeMinINR: 45000,
    marketRangeMaxINR: 120000,
    marketAverageINR: 75000,
    scopeSummary: "Product catalog, shopping cart drawer, Razorpay/Stripe checkout, order confirmation emails, and basic shipping setup.",
    sourceName: "Seyfert Infotech E-Commerce Pricing Survey & Codevibe India Review",
    sourceUrl: "https://codevibe.in",
    researchDate: "January 2026",
    isApproximate: false,
    notes: "Shopify/WooCommerce setup starts at ₹45,000; custom Next.js headless storefronts with zero platform transaction commissions average ₹70,000–₹1,20,000.",
  },
  {
    categoryKey: "ecommerce",
    scopeTier: "standard",
    tierTitle: "Advanced E-Commerce Store with Variants, Inventory & Invoicing (100–500 Products)",
    marketRangeMinINR: 120000,
    marketRangeMaxINR: 350000,
    marketAverageINR: 195000,
    scopeSummary: "Complex variant matrices (size/color), automated PDF GST billing, low-stock alerts, coupon engine, and shipping aggregator API integration.",
    sourceName: "Mayday Internet E-Commerce Development Guide 2025/2026",
    sourceUrl: "https://maydayinternet.com",
    researchDate: "January 2026",
    isApproximate: false,
    notes: "Agencies building custom inventory workflows and automated GST billing typically charge upwards of ₹1,50,000.",
  },

  // ---------------------------------------------------------------------------
  // Online Booking & Scheduling Platforms
  // ---------------------------------------------------------------------------
  {
    categoryKey: "booking_platform",
    scopeTier: "standard",
    tierTitle: "Online Service Booking Platform (Appointments & Calendar Slots)",
    marketRangeMinINR: 35000,
    marketRangeMaxINR: 85000,
    marketAverageINR: 52000,
    scopeSummary: "Real-time calendar slot reservation, practitioner selection, advance booking payment, and WhatsApp appointment confirmations.",
    sourceName: "Elite Mindz Web Application Pricing Benchmarks",
    sourceUrl: "https://elitemindz.co",
    researchDate: "January 2026",
    isApproximate: false,
    notes: "Calendar engine development with slot conflict resolution and SMS/WhatsApp webhooks averages ₹45,000–₹85,000 across Indian agencies.",
  },

  // ---------------------------------------------------------------------------
  // Employee Management & Internal Operations Portals
  // ---------------------------------------------------------------------------
  {
    categoryKey: "employee_management",
    scopeTier: "standard",
    tierTitle: "Internal Operations & Staff Attendance Portal",
    marketRangeMinINR: 60000,
    marketRangeMaxINR: 180000,
    marketAverageINR: 110000,
    scopeSummary: "RBAC secure login (Admin/HR/Employee), staff directory, leave request workflows, document vault, and audit logs.",
    sourceName: "OrangeMantra Custom Enterprise Web Portal Survey",
    sourceUrl: "https://orangemantra.com",
    researchDate: "January 2026",
    isApproximate: false,
    notes: "Custom internal dashboards with relational databases and role-based access control typically range ₹80,000–₹1,80,000 depending on workflow depth.",
  },

  // ---------------------------------------------------------------------------
  // Portfolio & Personal Brand
  // ---------------------------------------------------------------------------
  {
    categoryKey: "portfolio",
    scopeTier: "starter",
    tierTitle: "Executive / Creator Showcase Portfolio (3 Pages)",
    marketRangeMinINR: 10000,
    marketRangeMaxINR: 30000,
    marketAverageINR: 18000,
    scopeSummary: "Interactive project gallery, personal bio, downloadable resume, client testimonials, and contact inquiry form.",
    sourceName: "RemNow India Freelance & Agency Rate Card 2025/2026",
    sourceUrl: "https://remnow.co.in",
    researchDate: "January 2026",
    isApproximate: false,
    notes: "Freelance designers charge ₹10,000–₹20,000; design-focused digital studios charge ₹25,000–₹45,000 for custom GSAP animations and bespoke typography.",
  },

  // ---------------------------------------------------------------------------
  // SaaS MVP & Custom Web Applications
  // ---------------------------------------------------------------------------
  {
    categoryKey: "saas",
    scopeTier: "standard",
    tierTitle: "Production SaaS MVP (Auth, Subscriptions, Database & User App)",
    marketRangeMinINR: 90000,
    marketRangeMaxINR: 350000,
    marketAverageINR: 175000,
    scopeSummary: "Next.js 14 full-stack platform, PostgreSQL database, Stripe recurring billing, user authentication, customer dashboard, and transactional email.",
    sourceName: "Codevibe & OrangeMantra SaaS Development Survey 2025/2026",
    sourceUrl: "https://codevibe.in",
    researchDate: "January 2026",
    isApproximate: false,
    notes: "Production-ready SaaS software MVPs from reputable engineering agencies in India standardly bill between ₹1,20,000 and ₹3,50,000.",
  },

  // ---------------------------------------------------------------------------
  // Restaurant & Hospitality Websites
  // ---------------------------------------------------------------------------
  {
    categoryKey: "restaurant",
    scopeTier: "starter",
    tierTitle: "Restaurant & Bar (Digital Menu, Table Booking & Directions)",
    marketRangeMinINR: 15000,
    marketRangeMaxINR: 35000,
    marketAverageINR: 24000,
    scopeSummary: "Atmosphere photography hero, categorized digital menu with dietary tags, online table reservation, and Google Maps directions.",
    sourceName: "Mayday Internet Restaurant Web Design Report",
    sourceUrl: "https://maydayinternet.com",
    researchDate: "January 2026",
    isApproximate: false,
    notes: "Restaurant web projects standardly fall in the ₹18,000–₹35,000 bracket for responsive visual design with table inquiry flows.",
  },
];

/**
 * Retrieves the market benchmark for a specific category and scope tier.
 * Returns null if no credible benchmark data is recorded.
 */
export function getMarketBenchmark(
  categoryKey: string,
  scopeTier?: "starter" | "standard" | "advanced",
): MarketBenchmark | null {
  const normalizedKey = categoryKey.toLowerCase().trim();

  // Try exact category and tier match
  if (scopeTier) {
    const exact = MARKET_BENCHMARKS.find(
      (b) => b.categoryKey === normalizedKey && b.scopeTier === scopeTier,
    );
    if (exact) return exact;
  }

  // Fallback to first available benchmark in that category
  const categoryMatch = MARKET_BENCHMARKS.find((b) => b.categoryKey === normalizedKey);
  if (categoryMatch) return categoryMatch;

  // Generic fallback if mapped (e.g. healthcare -> booking or business)
  if (normalizedKey === "healthcare" || normalizedKey === "clinic") {
    return (
      MARKET_BENCHMARKS.find((b) => b.categoryKey === "booking_platform") ||
      MARKET_BENCHMARKS.find((b) => b.categoryKey === "business") ||
      null
    );
  }

  if (normalizedKey === "realestate") {
    return MARKET_BENCHMARKS.find((b) => b.categoryKey === "business") || null;
  }

  return null;
}

export const ALL_MARKET_BENCHMARKS = MARKET_BENCHMARKS;

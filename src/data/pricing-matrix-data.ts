import { MASTER_FEATURES } from "./pricing-matrix-features";

export type MasterPackageTier = "starter" | "business" | "pro";

export type FeatureStatus =
  | "included"
  | "limited"
  | "addon"
  | "not_included"
  | "custom_quote";

export type MasterCategoryKey =
  | "design_frontend"
  | "cms_content"
  | "ecommerce"
  | "auth_accounts"
  | "admin_management"
  | "backend_database"
  | "payments_billing"
  | "communication"
  | "email_marketing"
  | "booking_scheduling"
  | "crm_productivity"
  | "ai_automation"
  | "files_storage"
  | "search_location"
  | "seo_growth"
  | "security_compliance"
  | "devops_infrastructure"
  | "testing_maintenance"
  | "integrations_workflows"
  | "custom_development";

export interface MasterCategoryMeta {
  key: MasterCategoryKey;
  number: number;
  label: string;
  shortLabel: string;
  iconName: string;
  description: string;
  featureCount: number;
}

export interface PackageDetails {
  id: MasterPackageTier;
  name: string;
  tagline: string;
  startingPrice: number;
  deliveryTime: string;
  badge?: string;
  popular?: boolean;
  idealFor: string;
  summary: string;
  keyHighlights: string[];
}

export interface MatrixFeatureItem {
  id: string;
  name: string;
  category: MasterCategoryKey;
  description: string;
  availability: {
    starter: FeatureStatus;
    business: FeatureStatus;
    pro: FeatureStatus;
  };
  availabilityNotes?: {
    starter?: string;
    business?: string;
    pro?: string;
  };
  addonPrice?: number | null;
  billingType: "onetime" | "monthly";
  isCustomQuote?: boolean;
  hasQuantity?: boolean;
  quantityUnit?: string;
  maxQuantity?: number;
  popularAddon?: boolean;
}

// ---------------------------------------------------------------------------
// PACKAGES — Updated Pricing & Inclusions
// ---------------------------------------------------------------------------
// Third-party service charges (hosting, SMS gateway, payment gateway fees,
// domain, email service, etc.) are NOT included in these prices.
// ---------------------------------------------------------------------------

export const MASTER_PACKAGES: Record<MasterPackageTier, PackageDetails> = {
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Clean & Professional Web Presence",
    startingPrice: 9999,
    deliveryTime: "5–7 Business Days",
    idealFor: "Startups, local businesses, landing pages & personal portfolios",
    summary:
      "A fast, modern responsive website with custom styling, mobile optimization, contact form with email & SMS notifications, basic on-page SEO, and social media links.",
    keyHighlights: [
      "5 Custom Styled Pages",
      "100% Responsive (Desktop, Tablet, Mobile)",
      "Contact Form with Email & SMS Notifications",
      "Basic On-Page SEO & Meta Tags",
      "Social Media Links Integration",
      "Vercel / Netlify Deployment & Free SSL",
      "Clean, Modern Typography & Layout",
      "14 Days Post-Launch Bug-Fix Support",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    tagline: "Growth-Ready Interactive Platform",
    startingPrice: 20000,
    deliveryTime: "2–3 Weeks",
    popular: true,
    badge: "MOST POPULAR",
    idealFor: "Established brands, growing service firms & content creators",
    summary:
      "A comprehensive business website with 5–10 custom pages, enhanced design, blog section, dynamic forms, testimonials, FAQ, basic admin, advance SEO, search & filters, and third-party API integration.",
    keyHighlights: [
      "5–10 Custom Styled Pages",
      "More Customized & Polished Design",
      "Blog Section with Content Management",
      "Dynamic Contact Form & Advance Validation",
      "Testimonials & FAQ Sections",
      "Basic Admin Panel for Content Management",
      "Email & SMS Notifications",
      "Advance SEO, Search Filters & Pagination",
      "Third-Party API Integration",
      "30 Days Post-Launch Bug-Fix Support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Full-Stack Web Application",
    startingPrice: 40000,
    deliveryTime: "4–6 Weeks",
    badge: "FULL-STACK",
    idealFor: "SaaS MVPs, custom portals, web apps & online stores",
    summary:
      "Production-grade web application with 10–15 best-customized screens, advance UI, custom backend APIs, database integration, authentication, admin dashboard, file handling, payment gateway, and complete error handling.",
    keyHighlights: [
      "10–15 Best Customized Screens",
      "Advance UI with Custom Components",
      "Custom Backend APIs & Database Integration",
      "User Auth (JWT/Session) & RBAC",
      "Admin Dashboard with Full CRUD",
      "File Upload & Document Handling",
      "Advance Forms & Email Automation",
      "Payment Gateway Integration",
      "Third-Party Integrations & API Validation",
      "Error Handling & Complete Validation",
      "60 Days Post-Launch Extended Support",
    ],
  },
};

export const MASTER_CATEGORIES: MasterCategoryMeta[] = [
  {
    key: "design_frontend",
    number: 1,
    label: "Website Design & Frontend",
    shortLabel: "Design & UI",
    iconName: "Layout",
    description: "Visual identity, responsive layouts, modular component systems, and high-performance interactive interfaces.",
    featureCount: 55,
  },
  {
    key: "cms_content",
    number: 2,
    label: "CMS, Blog & Content",
    shortLabel: "CMS & Blog",
    iconName: "BookOpen",
    description: "Content authoring, structured publishing, category taxonomy, markdown engines, and editorial workflows.",
    featureCount: 25,
  },
  {
    key: "ecommerce",
    number: 3,
    label: "E-Commerce & Online Store",
    shortLabel: "E-Commerce",
    iconName: "ShoppingBag",
    description: "Product catalogs, variant matrices, persistent carts, checkout pipelines, inventory, and order fulfillment.",
    featureCount: 50,
  },
  {
    key: "auth_accounts",
    number: 4,
    label: "Authentication & User Accounts",
    shortLabel: "Authentication",
    iconName: "Lock",
    description: "JWT & session security, OAuth identity providers, MFA, password recovery, RBAC, and session management.",
    featureCount: 40,
  },
  {
    key: "admin_management",
    number: 5,
    label: "Admin Dashboard & Management",
    shortLabel: "Admin Portals",
    iconName: "LayoutDashboard",
    description: "Telemetry widgets, audit logs, granular permission matrices, CSV/PDF reports, and centralized operational portals.",
    featureCount: 35,
  },
  {
    key: "backend_database",
    number: 6,
    label: "Backend, API & Database",
    shortLabel: "Backend & API",
    iconName: "Database",
    description: "Relational PostgreSQL / MySQL schemas, Prisma ORM, REST/GraphQL endpoints, caching layers, and background queues.",
    featureCount: 50,
  },
  {
    key: "payments_billing",
    number: 7,
    label: "Payments & Billing",
    shortLabel: "Payments",
    iconName: "CreditCard",
    description: "Stripe, Razorpay, Cashfree, UPI pipelines, recurring subscriptions, automated tax invoicing, and webhooks.",
    featureCount: 28,
  },
  {
    key: "communication",
    number: 8,
    label: "WhatsApp, SMS & Communication",
    shortLabel: "WhatsApp & SMS",
    iconName: "MessageCircle",
    description: "Official WhatsApp Cloud API, automated order dispatch alerts, SMS OTP, push notifications, and live support.",
    featureCount: 30,
  },
  {
    key: "email_marketing",
    number: 9,
    label: "Email & Marketing Automation",
    shortLabel: "Email & Drip",
    iconName: "Mail",
    description: "Resend / Amazon SES engines, HTML transactional templates, newsletter drip sequences, and deliverability tuning.",
    featureCount: 26,
  },
  {
    key: "booking_scheduling",
    number: 10,
    label: "Booking, Appointments & Scheduling",
    shortLabel: "Appointments",
    iconName: "Calendar",
    description: "Real-time calendar availability, Google / Outlook sync, multi-staff routing, automated reminder alerts, and paid appointments.",
    featureCount: 25,
  },
  {
    key: "crm_productivity",
    number: 11,
    label: "CRM, HR & Productivity",
    shortLabel: "CRM & Ops",
    iconName: "User",
    description: "Lead capture pipelines, task management, client extranets, employee onboarding, ATS candidate tracking, and attendance.",
    featureCount: 40,
  },
  {
    key: "ai_automation",
    number: 12,
    label: "AI, OCR & Automation",
    shortLabel: "AI & Agents",
    iconName: "Sparkles",
    description: "OpenAI/Claude/Gemini LLM integrations, RAG vector knowledge bases, OCR document parsing, and agentic workflows.",
    featureCount: 40,
  },
  {
    key: "files_storage",
    number: 13,
    label: "Files, Documents & Storage",
    shortLabel: "Files & Storage",
    iconName: "Layers",
    description: "Secure Cloudflare R2 / AWS S3 uploads, presigned URLs, PDF rendering engines, and access-controlled document vaults.",
    featureCount: 30,
  },
  {
    key: "search_location",
    number: 14,
    label: "Search, Maps & Location",
    shortLabel: "Search & Maps",
    iconName: "Search",
    description: "Full-text indexing, Algolia / Meilisearch, Google Maps geocoding, store locators, and radius-based filtering.",
    featureCount: 22,
  },
  {
    key: "seo_growth",
    number: 15,
    label: "SEO, Analytics & Growth",
    shortLabel: "SEO & Growth",
    iconName: "Zap",
    description: "JSON-LD structured schemas, Core Web Vitals optimization, Google Tag Manager events, and conversion tracking.",
    featureCount: 30,
  },
  {
    key: "security_compliance",
    number: 16,
    label: "Security & Compliance Support",
    shortLabel: "Security",
    iconName: "Shield",
    description: "Input sanitization, CSP headers, rate-limiting armor, audit trails, cookie compliance, and vulnerability reviews.",
    featureCount: 25,
  },
  {
    key: "devops_infrastructure",
    number: 17,
    label: "Deployment, Infrastructure & DevOps",
    shortLabel: "DevOps & Cloud",
    iconName: "Globe",
    description: "Vercel / AWS / VPS architectures, Docker containers, CI/CD automated deployment pipelines, and global CDN caching.",
    featureCount: 30,
  },
  {
    key: "testing_maintenance",
    number: 18,
    label: "Testing, Support & Maintenance",
    shortLabel: "Maintenance",
    iconName: "CheckCircle2",
    description: "Cross-device verification, end-to-end testing, continuous security patch monitoring, and dedicated developer hours.",
    featureCount: 30,
  },
  {
    key: "integrations_workflows",
    number: 19,
    label: "Integrations & Custom Workflows",
    shortLabel: "Integrations",
    iconName: "Bot",
    description: "HubSpot, Salesforce, Zoho, Google Workspace, Zapier / Make connectors, and webhook event-driven orchestrations.",
    featureCount: 25,
  },
  {
    key: "custom_development",
    number: 20,
    label: "Custom / Advanced Development",
    shortLabel: "Custom Engineering",
    iconName: "Building2",
    description: "Multi-tenant SaaS platforms, high-throughput message brokers, custom workflow engines, and enterprise software.",
    featureCount: 25,
  },
];

export { MASTER_FEATURES };

// Helper to look up features by category
export function getFeaturesByCategory(catKey: MasterCategoryKey): MatrixFeatureItem[] {
  return MASTER_FEATURES.filter((f) => f.category === catKey);
}

// Helper to test if a feature is already included in a package
export function isFeatureIncludedInPackage(
  featureId: string,
  tier: MasterPackageTier
): boolean {
  const feat = MASTER_FEATURES.find((f) => f.id === featureId);
  if (!feat) return false;
  return feat.availability[tier] === "included";
}

// Format INR currency
export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

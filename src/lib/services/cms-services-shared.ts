import { z } from "zod";
import { isValidSafeUrl } from "./cms-shared";

// ============================================================================
// 1. CONSTANTS & ALLOWED ICONS
// ============================================================================

export const CMS_SERVICES_CACHE_KEYS = {
  ALL_SERVICES: "cache:cms:services:all",
  HOME_SERVICES: "cache:cms:services:home",
  SERVICE_SLUG_PREFIX: "cache:cms:service:slug:",
  ALL_FEATURES: "cache:cms:features:all",
} as const;

export const CMS_SERVICES_CACHE_TTL_SECONDS = 3600; // 1 hour

export const AVAILABLE_SERVICE_ICONS = [
  "Layers",
  "Cpu",
  "Database",
  "Code",
  "Globe",
  "Shield",
  "Zap",
  "Sparkles",
  "Server",
  "Workflow",
  "Rocket",
  "Layout",
  "CreditCard",
  "MessageCircle",
  "BarChart3",
  "Cloud",
  "Terminal",
  "Smartphone",
  "Compass",
  "CheckCircle",
] as const;

export type ServiceIconName = (typeof AVAILABLE_SERVICE_ICONS)[number];

export const FEATURE_CATEGORIES = [
  "General",
  "Frontend",
  "Backend",
  "Database",
  "Authentication",
  "E-Commerce",
  "AI & Automation",
  "Performance & SEO",
  "DevOps & Cloud",
] as const;

// ============================================================================
// 2. ZOD VALIDATION SCHEMAS
// ============================================================================

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const serviceCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name must be 100 characters or fewer"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be 100 characters or fewer")
    .regex(
      slugRegex,
      "Slug must contain only lowercase alphanumeric characters and single hyphens (e.g., 'full-stack-web-apps')",
    ),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Short description must be at least 10 characters")
    .max(300, "Short description must be 300 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(10000, "Detailed description must be 10,000 characters or fewer")
    .optional()
    .nullable(),
  icon: z
    .string()
    .trim()
    .max(50)
    .optional()
    .default("Layers"),
  coverImage: z
    .string()
    .trim()
    .refine((val) => !val || isValidSafeUrl(val), "Cover image must be a safe root-relative path or https:// URL")
    .optional()
    .nullable(),
  startingPrice: z
    .number()
    .int("Starting price must be an integer")
    .min(0, "Starting price cannot be negative")
    .max(10000000, "Starting price cannot exceed ₹10,000,000")
    .optional()
    .nullable(),
  priceLabel: z
    .string()
    .trim()
    .max(60, "Price label must be 60 characters or fewer")
    .optional()
    .nullable(),
  displayOrder: z.number().int().min(0).max(10000).optional().default(0),
  featured: z.boolean().optional().default(false),
  showOnHome: z.boolean().optional().default(true),
  published: z.boolean().optional().default(true),
  seoTitle: z
    .string()
    .trim()
    .max(150, "SEO title must be 150 characters or fewer")
    .optional()
    .nullable(),
  seoDescription: z
    .string()
    .trim()
    .max(300, "SEO description must be 300 characters or fewer")
    .optional()
    .nullable(),
  ogImage: z
    .string()
    .trim()
    .refine((val) => !val || isValidSafeUrl(val), "OG image must be a safe root-relative path or https:// URL")
    .optional()
    .nullable(),
  featureIds: z
    .array(z.string().uuid("Invalid feature ID format"))
    .max(50, "Maximum 50 features per service allowed")
    .optional()
    .default([]),
});

export const serviceUpdateSchema = serviceCreateSchema.partial().extend({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z.string().trim().min(2).max(100).regex(slugRegex).optional(),
  shortDescription: z.string().trim().min(10).max(300).optional(),
});

export const featureCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Feature title must be at least 2 characters")
    .max(120, "Feature title must be 120 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(1000, "Feature description must be 1,000 characters or fewer")
    .optional()
    .nullable(),
  icon: z
    .string()
    .trim()
    .max(50)
    .optional()
    .default("Check"),
  category: z
    .string()
    .trim()
    .max(50)
    .optional()
    .default("General"),
  displayOrder: z.number().int().min(0).max(10000).optional().default(0),
  enabled: z.boolean().optional().default(true),
  showOnPublic: z.boolean().optional().default(true),
  serviceIds: z
    .array(z.string().uuid("Invalid service ID format"))
    .max(50, "Maximum 50 services allowed per feature")
    .optional()
    .default([]),
});

export const featureUpdateSchema = featureCreateSchema.partial().extend({
  title: z.string().trim().min(2).max(120).optional(),
});

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export type FeatureCreateInput = z.infer<typeof featureCreateSchema>;
export type FeatureUpdateInput = z.infer<typeof featureUpdateSchema>;

// ============================================================================
// 3. TYPED DATA INTERFACES
// ============================================================================

export interface ServiceFeatureItem {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  displayOrder: number;
  enabled: boolean;
  showOnPublic: boolean;
  orderInService?: number;
}

export interface CmsService {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string | null;
  icon: string | null;
  coverImage: string | null;
  startingPrice: number | null;
  priceLabel: string | null;
  displayOrder: number;
  featured: boolean;
  showOnHome: boolean;
  published: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  features: ServiceFeatureItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CmsFeature {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  displayOrder: number;
  enabled: boolean;
  showOnPublic: boolean;
  serviceCount?: number;
  serviceIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 4. PRODUCTION FALLBACK DEFAULTS
// ============================================================================

export const DEFAULT_FALLBACK_SERVICES: CmsService[] = [
  {
    id: "fallback-fullstack",
    name: "Full-Stack Web Applications",
    slug: "full-stack-web-apps",
    shortDescription:
      "Modern web applications engineered with Next.js 14 App Router, TypeScript, and React Server Components for maximum speed, security, and atomic reactivity.",
    description:
      "We design and build bespoke, enterprise-grade web applications from initial architecture to global edge deployment. Every application leverages modern server-side rendering, strict TypeScript type safety, automated database migrations, and responsive design systems designed to convert visitors into loyal clients.",
    icon: "Layers",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    startingPrice: 24999,
    priceLabel: "Starting at ₹24,999",
    displayOrder: 1,
    featured: true,
    showOnHome: true,
    published: true,
    seoTitle: "Full-Stack Web Application Engineering | Webgent",
    seoDescription:
      "Custom Next.js and React full-stack web applications engineered for performance, scale, and SEO dominance.",
    ogImage: null,
    features: [
      {
        id: "feat-nextjs-rsc",
        title: "Next.js 14 App Router & Server Components",
        description: "Zero client-bundle overhead with edge hydration and streaming responses.",
        icon: "Cpu",
        category: "Frontend",
        displayOrder: 1,
        enabled: true,
        showOnPublic: true,
        orderInService: 1,
      },
      {
        id: "feat-typescript",
        title: "Strict TypeScript & Type Safety",
        description: "End-to-end typed contracts between database, API endpoints, and UI state.",
        icon: "Code",
        category: "Frontend",
        displayOrder: 2,
        enabled: true,
        showOnPublic: true,
        orderInService: 2,
      },
      {
        id: "feat-postgres-prisma",
        title: "PostgreSQL with Prisma ORM",
        description: "Optimized connection pooling, transactional integrity, and automated schema migrations.",
        icon: "Database",
        category: "Database",
        displayOrder: 3,
        enabled: true,
        showOnPublic: true,
        orderInService: 3,
      },
      {
        id: "feat-auth-security",
        title: "Secure Authentication & RBAC",
        description: "Session-based or JWT authentication, OAuth providers, and role-based permissions.",
        icon: "Shield",
        category: "Authentication",
        displayOrder: 4,
        enabled: true,
        showOnPublic: true,
        orderInService: 4,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-ecommerce",
    name: "E-Commerce & Digital Storefronts",
    slug: "ecommerce-storefronts",
    shortDescription:
      "High-converting online shopping platforms with seamless payment gateways, dynamic catalogs, inventory synchronization, and transactional notifications.",
    description:
      "Transform your retail brand into a digital flagship. We build custom headless e-commerce stores featuring instantaneous client-side navigation, mobile-optimized checkout flows, multi-currency support, Razorpay/Stripe integrations, and automated order fulfillment notifications via WhatsApp and email.",
    icon: "CreditCard",
    coverImage: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200&auto=format&fit=crop",
    startingPrice: 34999,
    priceLabel: "Starting at ₹34,999",
    displayOrder: 2,
    featured: true,
    showOnHome: true,
    published: true,
    seoTitle: "E-Commerce Development & Custom Stores | Webgent",
    seoDescription:
      "Custom e-commerce storefronts with Razorpay/Stripe, WhatsApp order alerts, and fast checkout flows.",
    ogImage: null,
    features: [
      {
        id: "feat-razorpay-stripe",
        title: "Razorpay & Stripe Payment Integration",
        description: "Secure webhooks, automated reconciliation, and instant confirmation receipts.",
        icon: "CreditCard",
        category: "E-Commerce",
        displayOrder: 1,
        enabled: true,
        showOnPublic: true,
        orderInService: 1,
      },
      {
        id: "feat-whatsapp-alerts",
        title: "Automated WhatsApp & Email Order Alerts",
        description: "Instant order receipts and shipping milestone updates directly to customers.",
        icon: "MessageCircle",
        category: "E-Commerce",
        displayOrder: 2,
        enabled: true,
        showOnPublic: true,
        orderInService: 2,
      },
      {
        id: "feat-custom-catalog",
        title: "Dynamic Product Catalog & Filtering",
        description: "Fast multi-attribute filtering by category, price, variant, and availability.",
        icon: "Layout",
        category: "E-Commerce",
        displayOrder: 3,
        enabled: true,
        showOnPublic: true,
        orderInService: 3,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-saas",
    name: "SaaS MVPs & Internal Portals",
    slug: "saas-mvp-portals",
    shortDescription:
      "Rapidly launch scalable SaaS platforms, client administration portals, and internal business tools with multi-tenant architecture and real-time dashboards.",
    description:
      "Accelerate time to market for your software concept. We build turn-key SaaS MVPs equipped with self-serve billing, tiered subscriptions, team member invites, audit logs, and analytics telemetry to help you acquire your first paying customers.",
    icon: "Workflow",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    startingPrice: 44999,
    priceLabel: "Starting at ₹44,999",
    displayOrder: 3,
    featured: true,
    showOnHome: true,
    published: true,
    seoTitle: "SaaS MVP Development & Web Portals | Webgent",
    seoDescription:
      "Scalable SaaS platforms, subscription portals, and internal dashboards built for rapid validation.",
    ogImage: null,
    features: [
      {
        id: "feat-subscription-billing",
        title: "Subscription Management & Invoicing",
        description: "Recurring plan tiers, automated billing cycles, and invoice generation.",
        icon: "CreditCard",
        category: "Backend",
        displayOrder: 1,
        enabled: true,
        showOnPublic: true,
        orderInService: 1,
      },
      {
        id: "feat-admin-telemetry",
        title: "Real-time Telemetry & Metrics Cards",
        description: "Interactive data visualization and customer activity reporting.",
        icon: "BarChart3",
        category: "Frontend",
        displayOrder: 2,
        enabled: true,
        showOnPublic: true,
        orderInService: 2,
      },
      {
        id: "feat-team-tenancy",
        title: "Multi-tenant Isolation & Team Invites",
        description: "Organization-level data segregation with member invitation flows.",
        icon: "Shield",
        category: "Authentication",
        displayOrder: 3,
        enabled: true,
        showOnPublic: true,
        orderInService: 3,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-ai",
    name: "AI Solutions & Workflow Automation",
    slug: "ai-solutions-automation",
    shortDescription:
      "Intelligent conversational assistants, retrieval-augmented knowledge bases, automated document processing, and deterministic lead qualification bots.",
    description:
      "Empower your business operations with custom artificial intelligence integrations. We deploy context-aware AI consultants, custom Retrieval-Augmented Generation (RAG) pipelines over your private documentation, and automated lead capture workflows powered by Google Gemini and OpenAI.",
    icon: "Sparkles",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
    startingPrice: 29999,
    priceLabel: "Starting at ₹29,999",
    displayOrder: 4,
    featured: false,
    showOnHome: true,
    published: true,
    seoTitle: "AI Integration & Workflow Automation | Webgent",
    seoDescription:
      "Context-aware AI chatbots, Gemini integrations, and automated lead assistants for modern brands.",
    ogImage: null,
    features: [
      {
        id: "feat-gemini-rag",
        title: "Gemini & LLM Knowledge Grounding",
        description: "Accurate responses grounded in your specific product catalogs and documentation.",
        icon: "Sparkles",
        category: "AI & Automation",
        displayOrder: 1,
        enabled: true,
        showOnPublic: true,
        orderInService: 1,
      },
      {
        id: "feat-lead-scoring",
        title: "Autonomous Lead Scoring & Routing",
        description: "Automatic qualification of inbound inquiries with direct email and CRM dispatch.",
        icon: "Workflow",
        category: "AI & Automation",
        displayOrder: 2,
        enabled: true,
        showOnPublic: true,
        orderInService: 2,
      },
      {
        id: "feat-offline-fallbacks",
        title: "Deterministic Offline Fallbacks",
        description: "Graceful non-AI algorithmic fallbacks when quota limits or network errors occur.",
        icon: "Shield",
        category: "AI & Automation",
        displayOrder: 3,
        enabled: true,
        showOnPublic: true,
        orderInService: 3,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

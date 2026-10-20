import { z } from "zod";

// ============================================================================
// 1. TYPED INTERFACES & SCHEMAS
// ============================================================================

export const HOMEPAGE_CANONICAL_SECTION_IDS = [
  "hero",
  "capabilities",
  "howWeBuild",
  "showcase",
  "testimonials",
  "blog",
  "cta",
] as const;

export type HomeSectionId = (typeof HOMEPAGE_CANONICAL_SECTION_IDS)[number];

export function isValidSafeUrl(val: string): boolean {
  if (!val || typeof val !== "string") return false;
  // 1. Strip ASCII control characters and trim
  const cleanVal = val.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
  if (!cleanVal) return false;

  // 2. Reject protocol-relative URLs (e.g. //example.com, /\evil.com, \\evil.com)
  if (
    cleanVal.startsWith("//") ||
    cleanVal.startsWith("/\\") ||
    cleanVal.startsWith("\\\\") ||
    cleanVal.startsWith("\\/")
  ) {
    return false;
  }

  // 3. Check for any explicit protocol scheme (contains a colon before any path separator)
  const colonIndex = cleanVal.indexOf(":");
  const firstSlashIndex = cleanVal.indexOf("/");

  if (colonIndex !== -1 && (firstSlashIndex === -1 || colonIndex < firstSlashIndex)) {
    // Protocol scheme exists before the first path slash
    const scheme = cleanVal.slice(0, colonIndex).replace(/\s+/g, "").toLowerCase();
    // Strictly allow only http and https protocols; reject javascript:, data:, vbscript:, file:, etc.
    if (scheme !== "http" && scheme !== "https") {
      return false;
    }
    // Must be a well-formed http(s) URL with valid host
    return /^https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9@:%._+~#=]{0,256}(\.[a-zA-Z0-9()]{1,6})?\b[-a-zA-Z0-9()@:%_+.~#?&/=]*$/i.test(
      cleanVal,
    );
  }

  // 4. For scheme-less paths: must be a root-relative path (e.g. /contact, /work?tab=1, /#faq)
  // Must start with a single slash (not double slash or backslash)
  return /^\/[^/\\]/.test(cleanVal) || cleanVal === "/";
}

export function isValidCanonicalBaseUrl(val: string): boolean {
  if (!val || typeof val !== "string") return false;
  const clean = val.trim();
  if (clean.endsWith("/")) return false;
  if (
    clean.startsWith("//") ||
    clean.startsWith("\\\\") ||
    clean.startsWith("/\\") ||
    clean.startsWith("\\/")
  ) {
    return false;
  }
  try {
    const url = new URL(clean);
    return (url.protocol === "http:" || url.protocol === "https:") && clean === url.origin;
  } catch {
    return false;
  }
}

export function sanitizeText(val: string): string {
  // Strip control characters, normalize space
  return val.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim();
}

export const homePageContentUpdateSchema = z.object({
  hero: z.object({
    eyebrow: z
      .string()
      .trim()
      .min(1, "Eyebrow is required")
      .max(120, "Eyebrow must be 120 characters or fewer"),
    headlineLine1: z
      .string()
      .trim()
      .min(1, "Headline line 1 is required")
      .max(80, "Headline line 1 must be 80 characters or fewer"),
    headlineLine2: z
      .string()
      .trim()
      .min(1, "Headline line 2 is required")
      .max(80, "Headline line 2 must be 80 characters or fewer"),
    headlineLine3: z
      .string()
      .trim()
      .min(1, "Headline line 3 is required")
      .max(80, "Headline line 3 must be 80 characters or fewer"),
    subheadline: z
      .string()
      .trim()
      .min(1, "Subheadline is required")
      .max(400, "Subheadline must be 400 characters or fewer"),
    primaryCtaText: z
      .string()
      .trim()
      .min(1, "Primary CTA text is required")
      .max(50, "Primary CTA text must be 50 characters or fewer"),
    primaryCtaLink: z
      .string()
      .trim()
      .min(1, "Primary CTA link is required")
      .max(200, "Primary CTA link must be 200 characters or fewer")
      .refine(
        isValidSafeUrl,
        "Primary CTA link must be a safe path (e.g., /contact) or http(s) URL without unsafe protocols.",
      ),
    secondaryCtaText: z
      .string()
      .trim()
      .min(1, "Secondary CTA text is required")
      .max(50, "Secondary CTA text must be 50 characters or fewer"),
    secondaryCtaLink: z
      .string()
      .trim()
      .min(1, "Secondary CTA link is required")
      .max(200, "Secondary CTA link must be 200 characters or fewer")
      .refine(
        isValidSafeUrl,
        "Secondary CTA link must be a safe path (e.g., /work) or http(s) URL without unsafe protocols.",
      ),
  }),
  sections: z
    .array(
      z.object({
        id: z.enum(HOMEPAGE_CANONICAL_SECTION_IDS),
        enabled: z.boolean(),
        order: z.number().int().min(1).max(20),
      }),
    )
    .length(
      HOMEPAGE_CANONICAL_SECTION_IDS.length,
      `All ${HOMEPAGE_CANONICAL_SECTION_IDS.length} canonical sections must be configured.`,
    )
    .refine((sectionsList) => {
      const ids = sectionsList.map((s) => s.id);
      const uniqueIds = new Set(ids);
      if (uniqueIds.size !== sectionsList.length) return false;
      return HOMEPAGE_CANONICAL_SECTION_IDS.every((canonicalId) => uniqueIds.has(canonicalId));
    }, "All 7 canonical homepage sections must be present exactly once without duplicates or omissions."),
});

export interface HomeHeroContent {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineLine3: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

export interface HomeSectionItem {
  id: HomeSectionId;
  enabled: boolean;
  order: number;
}

export interface HomeSectionsConfig {
  sections: HomeSectionItem[];
}

export interface NavItem {
  id?: string;
  title: string;
  href: string;
  order?: number;
  isExternal?: boolean;
  published?: boolean;
}

export interface NavigationMenuConfig {
  items: NavItem[];
}

export interface FooterLinkItem {
  id?: string;
  title: string;
  href: string;
  isExternal?: boolean;
  published?: boolean;
}

export interface FooterConfig {
  brandTagline: string;
  systemsLinks: FooterLinkItem[];
  coreStack: string[];
  connectLinks: FooterLinkItem[];
  copyrightText?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  officeAddress: string;
  businessHours: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  discordUrl?: string;
}

export interface SiteFaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  published?: boolean;
}

export interface SiteFaqsConfig {
  faqs: SiteFaqItem[];
}

export interface GlobalSeoConfig {
  siteName: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  canonicalBaseUrl: string;
  defaultOgImage: string;
  twitterCard: "summary" | "summary_large_image";
  twitterHandle: string;
  defaultRobotsIndex: boolean;
  defaultRobotsFollow: boolean;
}

export interface PageSeoOverride {
  route: string;
  title?: string;
  description?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface SiteSeoSettings {
  global: GlobalSeoConfig;
  pages: Record<string, PageSeoOverride>;
}

// ============================================================================
// 1B. CMS ZOD VALIDATION SCHEMAS
// ============================================================================

export const siteFaqItemSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "FAQ ID is required")
    .max(100, "FAQ ID must be 100 characters or fewer")
    .regex(/^[a-zA-Z0-9_-]+$/, "FAQ ID must contain only alphanumeric characters, dashes, and underscores"),
  question: z
    .string()
    .trim()
    .min(3, "Question must be at least 3 characters")
    .max(300, "Question must be 300 characters or fewer"),
  answer: z
    .string()
    .trim()
    .min(5, "Answer must be at least 5 characters")
    .max(3000, "Answer must be 3000 characters or fewer"),
  category: z
    .string()
    .trim()
    .max(60, "Category must be 60 characters or fewer")
    .optional()
    .default("General"),
  order: z.number().int().min(1).max(1000).optional().default(1),
  published: z.boolean().optional().default(true),
});

export const siteFaqsUpdateSchema = z.object({
  faqs: z
    .array(siteFaqItemSchema)
    .max(100, "Maximum 100 FAQs allowed")
    .refine((items) => {
      const ids = items.map((item) => item.id.toLowerCase());
      return new Set(ids).size === items.length;
    }, "All FAQ items must have unique identifiers without duplicates."),
});

export const navItemSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Nav item ID is required")
    .max(100, "Nav item ID must be 100 characters or fewer")
    .regex(/^[a-zA-Z0-9_-]+$/, "Nav item ID must contain only alphanumeric characters, dashes, and underscores")
    .optional(),
  title: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(60, "Label must be 60 characters or fewer"),
  href: z
    .string()
    .trim()
    .min(1, "Destination URL is required")
    .max(300, "Destination URL must be 300 characters or fewer")
    .refine(
      isValidSafeUrl,
      "Destination must be a safe root-relative path (e.g. /work) or http(s) URL without unsafe protocols.",
    ),
  order: z.number().int().min(1).max(1000).optional().default(1),
  isExternal: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
});

export const footerLinkItemSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Link ID is required")
    .max(100, "Link ID must be 100 characters or fewer")
    .regex(/^[a-zA-Z0-9_-]+$/, "Link ID must contain only alphanumeric characters, dashes, and underscores")
    .optional(),
  title: z
    .string()
    .trim()
    .min(1, "Link title is required")
    .max(60, "Link title must be 60 characters or fewer"),
  href: z
    .string()
    .trim()
    .min(1, "Destination URL is required")
    .max(300, "Destination URL must be 300 characters or fewer")
    .refine(
      isValidSafeUrl,
      "Destination must be a safe root-relative path (e.g. /work) or http(s) URL without unsafe protocols.",
    ),
  isExternal: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
});

export const navigationContentUpdateSchema = z.object({
  navigation: z.object({
    items: z
      .array(navItemSchema)
      .min(1, "At least one navigation item is required")
      .max(30, "Maximum 30 navigation items allowed")
      .refine((items) => {
        const ids = items.map((i, idx) => (i.id ? i.id.toLowerCase() : `item-${idx}`));
        return new Set(ids).size === items.length;
      }, "Navigation items must have unique identifiers without duplicates."),
  }),
  footer: z.object({
    brandTagline: z
      .string()
      .trim()
      .min(1, "Brand tagline is required")
      .max(500, "Brand tagline must be 500 characters or fewer"),
    systemsLinks: z
      .array(footerLinkItemSchema)
      .max(30, "Maximum 30 systems links allowed")
      .refine((items) => {
        const ids = items.map((i, idx) => (i.id ? i.id.toLowerCase() : `sys-${idx}`));
        return new Set(ids).size === items.length;
      }, "Systems links must have unique identifiers without duplicates."),
    coreStack: z
      .array(
        z.string().trim().min(1, "Stack entry cannot be empty").max(50, "Stack entry must be 50 characters or fewer"),
      )
      .min(1, "At least one core stack technology is required")
      .max(30, "Maximum 30 core stack items allowed"),
    connectLinks: z
      .array(footerLinkItemSchema)
      .max(30, "Maximum 30 connect links allowed")
      .refine((items) => {
        const ids = items.map((i, idx) => (i.id ? i.id.toLowerCase() : `conn-${idx}`));
        return new Set(ids).size === items.length;
      }, "Connect links must have unique identifiers without duplicates."),
    copyrightText: z
      .string()
      .trim()
      .max(200, "Copyright text must be 200 characters or fewer")
      .optional()
      .default("All rights reserved."),
  }),
});

export const globalSeoSchema = z.object({
  siteName: z
    .string()
    .trim()
    .min(1, "Site name is required")
    .max(100, "Site name must be 100 characters or fewer"),
  defaultTitle: z
    .string()
    .trim()
    .min(1, "Default title is required")
    .max(150, "Default title must be 150 characters or fewer"),
  titleTemplate: z
    .string()
    .trim()
    .min(1, "Title template is required")
    .max(100, "Title template must be 100 characters or fewer")
    .refine((v) => v.includes("%s"), "Title template must contain '%s' placeholder (e.g. '%s | Webgent')"),
  defaultDescription: z
    .string()
    .trim()
    .min(10, "Default description must be at least 10 characters")
    .max(300, "Default description must be 300 characters or fewer"),
  canonicalBaseUrl: z
    .string()
    .trim()
    .refine(
      isValidCanonicalBaseUrl,
      "Canonical base URL must be a valid http(s) origin without trailing slash or path (e.g. 'https://webgent.vercel.app')",
    ),
  defaultOgImage: z
    .string()
    .trim()
    .refine(isValidSafeUrl, "Default OpenGraph image must be a valid safe URL"),
  twitterCard: z.enum(["summary", "summary_large_image"]),
  twitterHandle: z
    .string()
    .trim()
    .max(50, "Twitter handle must be 50 characters or fewer")
    .refine((v) => !v || /^@?[a-zA-Z0-9_]{1,30}$/.test(v), "Twitter handle must be alphanumeric or @handle"),
  defaultRobotsIndex: z.boolean().default(true),
  defaultRobotsFollow: z.boolean().default(true),
});

export const pageSeoOverrideSchema = z.object({
  route: z
    .string()
    .trim()
    .min(1, "Route path is required")
    .max(100, "Route path must be 100 characters or fewer")
    .refine((r) => r.startsWith("/"), "Route must start with a leading slash (e.g. '/about')"),
  title: z.string().trim().max(150, "Title override must be 150 characters or fewer").optional(),
  description: z.string().trim().max(300, "Description override must be 300 characters or fewer").optional(),
  canonicalUrl: z
    .string()
    .trim()
    .refine((u) => !u || isValidSafeUrl(u), "Canonical URL must be a valid root-relative path or safe http(s) URL")
    .optional(),
  noIndex: z.boolean().optional(),
  ogTitle: z.string().trim().max(150, "Social title must be 150 characters or fewer").optional(),
  ogDescription: z.string().trim().max(300, "Social description must be 300 characters or fewer").optional(),
  ogImage: z
    .string()
    .trim()
    .refine((u) => !u || isValidSafeUrl(u), "OpenGraph image must be a valid safe URL")
    .optional(),
});

export const siteSeoSettingsUpdateSchema = z.object({
  global: globalSeoSchema,
  pages: z.record(pageSeoOverrideSchema),
});

// ============================================================================
// 2. SAFE PRODUCTION DEFAULTS
// ============================================================================

export const DEFAULT_HERO_CONTENT: HomeHeroContent = {
  eyebrow: "WEBGENT / DIGITAL ENGINEERING STUDIO",
  headlineLine1: "YOU IMAGINE",
  headlineLine2: "WE ENGINEER",
  headlineLine3: "REALITY.",
  subheadline: "We design and build digital products for ambitious businesses.",
  primaryCtaText: "START YOUR PROJECT",
  primaryCtaLink: "/contact",
  secondaryCtaText: "EXPLORE PORTFOLIO",
  secondaryCtaLink: "/work",
};

export const DEFAULT_HOME_SECTIONS: HomeSectionsConfig = {
  sections: [
    { id: "hero", enabled: true, order: 1 },
    { id: "capabilities", enabled: true, order: 2 },
    { id: "howWeBuild", enabled: true, order: 3 },
    { id: "showcase", enabled: true, order: 4 },
    { id: "testimonials", enabled: true, order: 5 },
    { id: "blog", enabled: true, order: 6 },
    { id: "cta", enabled: true, order: 7 },
  ],
};

export const DEFAULT_NAVIGATION_MENU: NavigationMenuConfig = {
  items: [
    { id: "nav-home", title: "Home", href: "/", order: 1, isExternal: false, published: true },
    { id: "nav-work", title: "Work", href: "/work", order: 2, isExternal: false, published: true },
    { id: "nav-about", title: "About", href: "/about", order: 3, isExternal: false, published: true },
    { id: "nav-blog", title: "Blog", href: "/blog", order: 4, isExternal: false, published: true },
    { id: "nav-pricing", title: "Pricing", href: "/pricing", order: 5, isExternal: false, published: true },
    { id: "nav-contact", title: "Contact", href: "/contact", order: 6, isExternal: false, published: true },
  ],
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  brandTagline:
    "Designing and engineering high-performance web applications, scalable cloud backends, and digital platforms for growing businesses and modern brands.",
  systemsLinks: [
    { id: "footer-case-studies", title: "Selected Case Studies", href: "/work", isExternal: false, published: true },
    { id: "footer-blog", title: "Engineering Blog", href: "/blog", isExternal: false, published: true },
    { id: "footer-pricing", title: "Pricing & Plans", href: "/pricing", isExternal: false, published: true },
    { id: "footer-about", title: "About Founder", href: "/about", isExternal: false, published: true },
    { id: "footer-contact", title: "Contact Us", href: "/contact", isExternal: false, published: true },
  ],
  coreStack: ["Next.js 14", "PostgreSQL & Prisma", "TypeScript", "Tailwind CSS", "GSAP Motion"],
  connectLinks: [
    { id: "footer-github", title: "GitHub", href: "https://github.com/mohit-webgent/webgent", isExternal: true, published: true },
    { id: "footer-twitter", title: "Twitter / X", href: "https://twitter.com/webgent", isExternal: true, published: true },
    { id: "footer-linkedin", title: "LinkedIn", href: "https://linkedin.com/company/webgent", isExternal: true, published: true },
    { id: "footer-inquiries", title: "Direct Inquiries", href: "/contact", isExternal: false, published: true },
  ],
  copyrightText: "All rights reserved.",
};

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  email: "hello@webgent.com",
  phone: "+1 (800) 555-WEBGENT",
  officeAddress: "548 Market St, Suite 342, San Francisco, CA 94104",
  businessHours: "Mon - Fri: 9:00 AM - 6:00 PM PST",
  githubUrl: "https://github.com/mohit-webgent/webgent",
  twitterUrl: "https://twitter.com/webgent",
  linkedinUrl: "https://linkedin.com/company/webgent",
  discordUrl: "https://discord.gg/webgent",
};

export const DEFAULT_SITE_FAQS: SiteFaqsConfig = {
  faqs: [
    {
      id: "faq-revisions",
      question: "How do revisions work?",
      answer:
        "Each project includes 2 full rounds of feedback and revisions. The first round occurs after the initial design and structure layout. The second round takes place on the interactive staging deployment before launch. Additional revisions can be scheduled if needed at standard rates.",
      category: "Process",
      order: 1,
      published: true,
    },
    {
      id: "faq-hosting",
      question: "How are domain and hosting billed?",
      answer:
        "We believe you should have complete autonomy over your online presence. You register and pay for your domain and hosting directly with providers (such as Vercel, AWS, or Cloudflare) at actual costs. We handle complete DNS setup and deployment configuration for you.",
      category: "Hosting",
      order: 2,
      published: true,
    },
    {
      id: "faq-source-code",
      question: "Do I get full ownership of the source code?",
      answer:
        "Yes. Once final payment is settled, full ownership of the Git repository, production code, design files, and database schemas is transferred to your organization. There are no proprietary lock-ins or recurring licensing fees to Webgent.",
      category: "Ownership",
      order: 3,
      published: true,
    },
    {
      id: "faq-not-included",
      question: "What is not included in this pricing estimate?",
      answer:
        "Third-party provider usage fees (such as domain registration, cloud server hosting tiers, WhatsApp Business API message usage, third-party AI API tokens, and payment gateway transaction fees) are billed by their respective providers at actuals. Professional copywriting and photo shoot production are also available separately if needed.",
      category: "Pricing",
      order: 4,
      published: true,
    },
  ],
};

export const DEFAULT_GLOBAL_SEO: GlobalSeoConfig = {
  siteName: "Webgent",
  defaultTitle: "Webgent — Modern Web Development & Engineering Solutions",
  titleTemplate: "%s | Webgent",
  defaultDescription:
    "Webgent designs and engineers high-performance web applications, scalable cloud backends, and digital platforms for growing businesses and modern brands.",
  canonicalBaseUrl: "https://webgent.vercel.app",
  defaultOgImage: "https://webgent.vercel.app/api/og?title=Webgent&badge=Web+Engineering",
  twitterCard: "summary_large_image",
  twitterHandle: "@webgent",
  defaultRobotsIndex: true,
  defaultRobotsFollow: true,
};

export const DEFAULT_PAGE_SEO_OVERRIDES: Record<string, PageSeoOverride> = {
  "/": {
    route: "/",
    title: "Webgent — Modern Web Development & Engineering Solutions",
    description:
      "Webgent designs and engineers high-performance web applications, scalable cloud backends, and digital platforms for growing businesses and modern brands.",
    canonicalUrl: "/",
    noIndex: false,
  },
  "/about": {
    route: "/about",
    title: "Meet Mohit Verma — Founder & Developer at Webgent",
    description:
      "Software developer and founder of Webgent. Professional journey, technical expertise in React and full-stack development, selected projects, and development methodology.",
    canonicalUrl: "/about",
    noIndex: false,
  },
  "/work": {
    route: "/work",
    title: "Selected Client Work & Engineering Case Studies",
    description:
      "Explore production web applications, SaaS platforms, and digital products engineered by Webgent. Highlighting architecture, performance, and impact.",
    canonicalUrl: "/work",
    noIndex: false,
  },
  "/pricing": {
    route: "/pricing",
    title: "Website Pricing & Cost Estimator",
    description:
      "Explore transparent starting rates and configure your project with our interactive budget calculator for web development, React/Next.js apps, SaaS MVPs, and integrations.",
    canonicalUrl: "/pricing",
    noIndex: false,
  },
  "/blog": {
    route: "/blog",
    title: "Engineering Blog & Technical Insights",
    description:
      "In-depth articles, case studies, and practical guides on full-stack web development, modern cloud architecture, Next.js performance, and database design.",
    canonicalUrl: "/blog",
    noIndex: false,
  },
  "/contact": {
    route: "/contact",
    title: "Start a Project — Contact Webgent",
    description:
      "Get in touch with Webgent to discuss your web application, SaaS platform, or cloud engineering needs. Receive a transparent estimate and architecture proposal.",
    canonicalUrl: "/contact",
    noIndex: false,
  },
  "/testimonials": {
    route: "/testimonials",
    title: "Client Testimonials & Verified Reviews",
    description:
      "Read what founders, engineering leaders, and product managers say about partnering with Webgent for high-performance web engineering.",
    canonicalUrl: "/testimonials",
    noIndex: false,
  },
};

export const DEFAULT_SITE_SEO_SETTINGS: SiteSeoSettings = {
  global: DEFAULT_GLOBAL_SEO,
  pages: DEFAULT_PAGE_SEO_OVERRIDES,
};

// ============================================================================
// 3. CACHE KEYS & CONSTANTS
// ============================================================================

export const CMS_CACHE_KEYS = {
  HERO: "cache:cms:hero_v1",
  HOME_SECTIONS: "cache:cms:home_sections_v1",
  NAVIGATION: "cache:cms:navigation_v1",
  FOOTER: "cache:cms:footer_v1",
  CONTACT_INFO: "cache:cms:contact_info_v1",
  CONTACT: "cache:cms:contact_info_v1",
  FAQS: "cache:cms:faqs_v1",
  SEO: "cache:cms:seo_v1",
} as const;

export const CMS_CACHE_TTL_SECONDS = 300; // 5 minutes cache TTL

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
  title: string;
  href: string;
  order?: number;
  isExternal?: boolean;
}

export interface NavigationMenuConfig {
  items: NavItem[];
}

export interface FooterLinkItem {
  title: string;
  href: string;
  isExternal?: boolean;
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
}

export interface SiteFaqsConfig {
  faqs: SiteFaqItem[];
}

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
    { title: "Home", href: "/", order: 1 },
    { title: "Work", href: "/work", order: 2 },
    { title: "About", href: "/about", order: 3 },
    { title: "Blog", href: "/blog", order: 4 },
    { title: "Pricing", href: "/pricing", order: 5 },
    { title: "Contact", href: "/contact", order: 6 },
  ],
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  brandTagline:
    "Designing and engineering high-performance web applications, scalable cloud backends, and digital platforms for growing businesses and modern brands.",
  systemsLinks: [
    { title: "Selected Case Studies", href: "/work" },
    { title: "Engineering Blog", href: "/blog" },
    { title: "Pricing & Plans", href: "/pricing" },
    { title: "About Founder", href: "/about" },
    { title: "Contact Us", href: "/contact" },
  ],
  coreStack: ["Next.js 14", "PostgreSQL & Prisma", "TypeScript", "Tailwind CSS", "GSAP Motion"],
  connectLinks: [
    { title: "GitHub", href: "https://github.com/mohit-webgent/webgent", isExternal: true },
    { title: "Twitter / X", href: "https://twitter.com/webgent", isExternal: true },
    { title: "LinkedIn", href: "https://linkedin.com/company/webgent", isExternal: true },
    { title: "Direct Inquiries", href: "/contact" },
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
    },
    {
      id: "faq-hosting",
      question: "How are domain and hosting billed?",
      answer:
        "We believe you should have complete autonomy over your online presence. You register and pay for your domain and hosting directly with providers (such as Vercel, AWS, or Cloudflare) at actual costs. We handle complete DNS setup and deployment configuration for you.",
      category: "Hosting",
      order: 2,
    },
    {
      id: "faq-source-code",
      question: "Do I get full ownership of the source code?",
      answer:
        "Yes. Once final payment is settled, full ownership of the Git repository, production code, design files, and database schemas is transferred to your organization. There are no proprietary lock-ins or recurring licensing fees to Webgent.",
      category: "Ownership",
      order: 3,
    },
    {
      id: "faq-not-included",
      question: "What is not included in this pricing estimate?",
      answer:
        "Third-party provider usage fees (such as domain registration, cloud server hosting tiers, WhatsApp Business API message usage, third-party AI API tokens, and payment gateway transaction fees) are billed by their respective providers at actuals. Professional copywriting and photo shoot production are also available separately if needed.",
      category: "Pricing",
      order: 4,
    },
  ],
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
} as const;

export const CMS_CACHE_TTL_SECONDS = 300; // 5 minutes cache TTL

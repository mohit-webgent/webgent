/**
 * Centralized Webgent Pricing & Estimator Configuration
 * Single source of truth for all categories, architecture types, features, delivery options, page limits, and pricing calculation logic.
 */

export interface WebsiteCategory {
  id: string;
  title: string;
  subtitle: string;
  startingPrice: number;
  deliveryDays: string;
  defaultFeatures: string[];
  recommendedPages: number;
  icon: string;
}

export interface WebsiteTypeOption {
  id: "static" | "dynamic";
  title: string;
  subtitle: string;
  additionalCost: number;
  description: string;
  bestFor: string;
}

export interface DeliveryOption {
  id: "standard" | "express";
  title: string;
  subtitle: string;
  multiplier: number;
  badge?: string;
  description: string;
  estimatedTimeline: string;
}

export interface FeatureOption {
  id: string;
  name: string;
  simpleDescription: string;
  price: number;
  icon: string;
  categoryTag: string;
  popularFor?: string[];
  includedInDynamic?: boolean;
  costNote?: string;
}

export interface PageCountSettings {
  minPages: number;
  maxPages: number;
  basePagesIncluded: number;
  costPerExtraPage: number;
  discountForOnePage: number;
}

export interface PricingSettings {
  currency: string;
  currencySymbol: string;
  minProjectCost: number;
  expressMultiplier: number;
}

// ---------------------------------------------------------------------------
// Base Settings & Constants
// ---------------------------------------------------------------------------

export const BASE_PAGES_INCLUDED = 5;
export const COST_PER_EXTRA_PAGE = 1000;
export const DISCOUNT_FOR_ONE_PAGE = 2000;
export const MIN_PAGES = 1;
export const MAX_PAGES = 30;
export const MIN_PROJECT_COST = 4999;
export const EXPRESS_DELIVERY_MULTIPLIER = 0.2;

export const PAGE_SETTINGS: PageCountSettings = {
  minPages: MIN_PAGES,
  maxPages: MAX_PAGES,
  basePagesIncluded: BASE_PAGES_INCLUDED,
  costPerExtraPage: COST_PER_EXTRA_PAGE,
  discountForOnePage: DISCOUNT_FOR_ONE_PAGE,
};

export const PRICING_SETTINGS: PricingSettings = {
  currency: "INR",
  currencySymbol: "₹",
  minProjectCost: MIN_PROJECT_COST,
  expressMultiplier: EXPRESS_DELIVERY_MULTIPLIER,
};

// ---------------------------------------------------------------------------
// Architecture Options
// Copy updated per Task 3:
// - Dynamic Website = editable content plus database storage.
// - Admin Dashboard = inquiry/lead management and data export.
// ---------------------------------------------------------------------------

export const WEBSITE_TYPES: WebsiteTypeOption[] = [
  {
    id: "static",
    title: "Static Website",
    subtitle: "Fast & Informational (No Database Needed)",
    additionalCost: 0,
    description:
      "Website content is fixed (Home, About, Services, Contact). Lightning-fast load speed, zero database hosting cost, zero monthly maintenance required.",
    bestFor: "Best for: Businesses, Portfolios, Local Services, and Marketing Landing Pages",
  },
  {
    id: "dynamic",
    title: "Dynamic Website",
    subtitle: "Editable Content & Database Storage",
    additionalCost: 8000,
    description:
      "Editable content plus database storage. Allows updating text, images, and content with a dedicated database to store customer records and power backend features.",
    bestFor: "Best for: Stores, Clinics, Blogs, SaaS, and database-backed web applications",
  },
];

// ---------------------------------------------------------------------------
// Delivery Options
// ---------------------------------------------------------------------------

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "standard",
    title: "Standard SLA Delivery",
    subtitle: "Normal delivery timeline per selected category",
    multiplier: 0,
    description: "Standard production queue with weekly milestone updates",
    estimatedTimeline: "Standard Timeline",
  },
  {
    id: "express",
    title: "Express Fast-Track Delivery",
    subtitle: "Priority engineering sprint (3–5 Business Days)",
    multiplier: EXPRESS_DELIVERY_MULTIPLIER,
    badge: "50% Faster",
    description: "Dedicated full-stack team allocated with daily deliverables",
    estimatedTimeline: "Fast-Track Priority (3–5 Days)",
  },
];

// ---------------------------------------------------------------------------
// Dynamic Dependencies Map (Task 2)
// Features requiring backend / database architecture ("Dynamic Website")
// ---------------------------------------------------------------------------

export const DYNAMIC_REQUIRED_FEATURES: readonly string[] = [
  "user_login",
  "admin_dashboard",
  "blog",
  "payment_gateway",
  "booking_calendar",
] as const;

// Backward-compatible alias mapping for legacy feature IDs
export const FEATURE_ID_ALIASES: Record<string, string> = {
  appointment_booking: "booking_calendar",
  user_auth: "user_login",
  admin_panel: "admin_dashboard",
  blog_cms: "blog",
};

/**
 * Normalizes any feature ID to its canonical version
 */
export function normalizeFeatureId(id: string): string {
  return FEATURE_ID_ALIASES[id] || id;
}

/**
 * Checks whether a feature ID requires the Dynamic Website architecture
 */
export function featureRequiresDynamic(featureId: string): boolean {
  const canonicalId = normalizeFeatureId(featureId);
  return DYNAMIC_REQUIRED_FEATURES.includes(canonicalId);
}

// ---------------------------------------------------------------------------
// Popular Features Catalog
// ---------------------------------------------------------------------------

export const POPULAR_FEATURES: FeatureOption[] = [
  {
    id: "contact_form",
    name: "Interactive Lead & Inquiry Form",
    simpleDescription:
      "Custom inquiry form with validation, spam protection (reCAPTCHA/Turnstile), and instant email alerts.",
    price: 1000,
    icon: "Mail",
    categoryTag: "Communication",
    popularFor: [
      "business",
      "healthcare",
      "realestate",
      "portfolio",
      "restaurant",
      "education",
      "custom",
    ],
  },
  {
    id: "payment_gateway",
    name: "Online Payment Gateway",
    simpleDescription:
      "Accept direct payments via UPI, Google Pay, PhonePe, Debit/Credit Cards & Netbanking (Razorpay/Stripe).",
    price: 4500,
    icon: "CreditCard",
    categoryTag: "Payments",
    popularFor: ["ecommerce", "saas", "education"],
    costNote: "Gateway transaction fees apply (billed by Razorpay/Stripe at standard rates)",
  },
  {
    id: "whatsapp_chat",
    name: "WhatsApp Quick Chat Button",
    simpleDescription:
      "Direct click-to-chat button linking directly to your WhatsApp with a prefilled inquiry message.",
    price: 500,
    icon: "MessageCircle",
    categoryTag: "Communication",
    popularFor: ["business", "healthcare", "restaurant", "realestate", "portfolio"],
  },
  {
    id: "whatsapp_alerts",
    name: "Automated WhatsApp Alerts",
    simpleDescription:
      "Automatic instant WhatsApp notification sent to your team and customer on new order or lead submission.",
    price: 3500,
    icon: "Send",
    categoryTag: "Communication",
    popularFor: ["ecommerce", "healthcare", "realestate"],
    costNote: "WhatsApp Business API/provider message charges at actuals",
  },
  {
    id: "booking_calendar",
    name: "Online Booking / Appointment Calendar",
    simpleDescription:
      "Interactive calendar allowing visitors to schedule appointments, consultations, or bookings directly.",
    price: 4000,
    icon: "Calendar",
    categoryTag: "Functionality",
    popularFor: ["healthcare", "education", "restaurant"],
  },
  {
    id: "ecommerce_cart",
    name: "Product Catalog & Shopping Cart",
    simpleDescription:
      "Product grid showcase, image zoom, slide-out shopping cart drawer, and live subtotal calculator.",
    price: 6000,
    icon: "ShoppingBag",
    categoryTag: "E-Commerce",
    popularFor: ["ecommerce"],
  },
  {
    id: "user_login",
    name: "User Login & Registration",
    simpleDescription:
      "Secure user account creation with Email/Password or 1-Click Sign in with Google.",
    price: 3500,
    icon: "Lock",
    categoryTag: "Security",
    popularFor: ["saas", "ecommerce", "education"],
  },
  {
    id: "admin_dashboard",
    name: "Custom Admin Dashboard",
    simpleDescription:
      "Inquiry/lead management and data export. Private dashboard for reviewing inquiries, tracking leads, and exporting customer data.",
    price: 5000,
    icon: "LayoutDashboard",
    categoryTag: "Management",
    includedInDynamic: true,
    popularFor: ["saas", "business", "realestate"],
  },
  {
    id: "blog",
    name: "Blog / Articles Section",
    simpleDescription:
      "Editorial article publication system with tags and search to significantly boost Google SEO ranking.",
    price: 3500,
    icon: "BookOpen",
    categoryTag: "Content",
    popularFor: ["business", "healthcare", "saas"],
  },
  {
    id: "gallery_showcase",
    name: "Photo / Project Showcase Gallery",
    simpleDescription:
      "High-resolution photo lightbox gallery or interactive case study grid with smooth transitions.",
    price: 1500,
    icon: "Image",
    categoryTag: "Design",
    popularFor: ["portfolio", "realestate", "restaurant"],
  },
  {
    id: "email_notifications",
    name: "Automatic Email Notifications",
    simpleDescription:
      "Instant automated confirmation email to the client and notification alerts dispatched to your team.",
    price: 1500,
    icon: "Mail",
    categoryTag: "Automation",
    popularFor: ["business", "saas", "education"],
  },
  {
    id: "seo_basic",
    name: "Complete On-Page Google SEO Setup",
    simpleDescription:
      "Google Search Console verification, XML sitemap, robots.txt, and semantic meta tags setup.",
    price: 2500,
    icon: "Search",
    categoryTag: "Growth",
    popularFor: ["business", "healthcare", "realestate", "ecommerce"],
  },
  {
    id: "speed_optimization",
    name: "Ultra-Fast Speed Optimization (95+ Score)",
    simpleDescription:
      "WebP asset compression, critical CSS, and instant page rendering passing Google Core Web Vitals.",
    price: 2500,
    icon: "Zap",
    categoryTag: "Performance",
  },
  {
    id: "animations_smooth",
    name: "Studio-Grade Smooth Animations (GSAP)",
    simpleDescription:
      "Curated kinetic micro-interactions, scroll-triggered reveals, and modern visual polish.",
    price: 3000,
    icon: "Sparkles",
    categoryTag: "Design",
  },
  {
    id: "multilanguage",
    name: "Multi-Language Support (e.g. English + Hindi)",
    simpleDescription:
      "Header language selector with localized translations allowing visitors to toggle languages.",
    price: 3500,
    icon: "Globe",
    categoryTag: "Content",
  },
  {
    id: "ai_chatbot",
    name: "AI Customer Support Chatbot",
    simpleDescription:
      "Custom GPT-powered conversational assistant trained on your business information to answer client queries 24/7.",
    price: 7500,
    icon: "Bot",
    categoryTag: "AI Integration",
    costNote: "Third-party AI API usage billed by the provider at actuals",
  },
  {
    id: "newsletter_subscribe",
    name: "Newsletter & Email Lead Capture",
    simpleDescription:
      "Branded newsletter subscription form with double opt-in validation and auto-sync to Mailchimp or Brevo.",
    price: 1500,
    icon: "Mail",
    categoryTag: "Communication",
    popularFor: ["business", "saas", "education"],
  },
  {
    id: "live_chat_support",
    name: "Live Chat Concierge (Crisp / Tawk)",
    simpleDescription:
      "Real-time visitor chat widget integrated with mobile app notifications for instant client replies.",
    price: 2000,
    icon: "MessageCircle",
    categoryTag: "Communication",
    popularFor: ["business", "ecommerce", "healthcare"],
  },
  {
    id: "coupon_discounts",
    name: "Promotional Coupons & Discount Rules",
    simpleDescription:
      "Create coupon codes, percentage or flat discounts, expiration schedules, and minimum order limits.",
    price: 2500,
    icon: "CreditCard",
    categoryTag: "Payments",
    popularFor: ["ecommerce", "saas"],
  },
  {
    id: "inventory_stock",
    name: "Live Inventory & Low Stock Alerts",
    simpleDescription:
      "Live product stock counter, sold-out badges, and automated email alerts to store managers.",
    price: 3000,
    icon: "ShoppingBag",
    categoryTag: "E-Commerce",
    popularFor: ["ecommerce"],
  },
  {
    id: "invoice_generation",
    name: "Automated PDF Invoice & GST Billing",
    simpleDescription:
      "Instant branded PDF invoice generation dispatched automatically to customers upon order placement.",
    price: 3000,
    icon: "Building2",
    categoryTag: "Payments",
    popularFor: ["ecommerce", "business", "saas"],
  },
  {
    id: "customer_reviews",
    name: "Client Testimonials & Rating Carousel",
    simpleDescription:
      "Verified client review showcase with 5-star ratings and structured schema markup for Google SERP display.",
    price: 1500,
    icon: "Sparkles",
    categoryTag: "Content",
    popularFor: ["business", "healthcare", "realestate", "portfolio"],
  },
  {
    id: "video_embed",
    name: "High-Definition Video Showcase & Reels",
    simpleDescription:
      "Responsive video hero backgrounds, interactive YouTube/Vimeo modals, and smooth HTML5 video player.",
    price: 1500,
    icon: "Image",
    categoryTag: "Design",
    popularFor: ["portfolio", "restaurant", "realestate"],
  },
  {
    id: "faq_accordion",
    name: "Searchable Interactive FAQ Section",
    simpleDescription:
      "Categorized accordion FAQ with live keyword search and Google FAQ schema markup.",
    price: 1000,
    icon: "BookOpen",
    categoryTag: "Content",
    popularFor: ["business", "saas", "healthcare", "education"],
  },
  {
    id: "pdf_download",
    name: "Downloadable Resource Library (Gated)",
    simpleDescription:
      "Gated PDF brochure, menu, or case study downloads with contact form capture before download access.",
    price: 1500,
    icon: "Layers",
    categoryTag: "Content",
    popularFor: ["business", "education", "realestate"],
  },
  {
    id: "analytics_tracking",
    name: "Google Analytics 4 & Meta Pixel Setup",
    simpleDescription:
      "Complete custom conversion event tracking, CTA button click monitors, and custom executive reports.",
    price: 2000,
    icon: "Search",
    categoryTag: "Growth",
    popularFor: ["business", "ecommerce", "saas"],
  },
  {
    id: "schema_structured",
    name: "Rich Google Snippets Schema Markup",
    simpleDescription:
      "JSON-LD structured data implementation for LocalBusiness, FAQ, Breadcrumbs, and Organization entities.",
    price: 1500,
    icon: "Search",
    categoryTag: "Growth",
    popularFor: ["business", "healthcare", "realestate"],
  },
  {
    id: "pwa_offline",
    name: "Progressive Web App (PWA) Offline Support",
    simpleDescription:
      "Installable app icon on mobile home screens with offline asset caching and ultra-fast launch speeds.",
    price: 4000,
    icon: "Zap",
    categoryTag: "Performance",
    popularFor: ["saas", "ecommerce", "business"],
  },
  {
    id: "dark_mode",
    name: "Dark / Light Mode Dynamic Switcher",
    simpleDescription:
      "Seamless theme toggle with localStorage user persistence and tailored high-contrast color palettes.",
    price: 2000,
    icon: "Sparkles",
    categoryTag: "Design",
    popularFor: ["saas", "portfolio", "business"],
  },
  {
    id: "interactive_calculator",
    name: "Custom ROI / Pricing Interactive Calculator",
    simpleDescription:
      "Interactive multi-slider cost estimator or savings calculator tailored to your specific service packages.",
    price: 4500,
    icon: "Calendar",
    categoryTag: "Functionality",
    popularFor: ["business", "saas", "realestate"],
  },
];

// ---------------------------------------------------------------------------
// Website Categories
// ---------------------------------------------------------------------------

export const WEBSITE_CATEGORIES: WebsiteCategory[] = [
  {
    id: "business",
    title: "Business & Corporate",
    subtitle: "For companies, agencies, consultancies & professional services",
    startingPrice: 9999,
    deliveryDays: "5–7 Days",
    defaultFeatures: ["contact_form", "whatsapp_chat", "seo_basic"],
    recommendedPages: 5,
    icon: "Building2",
  },
  {
    id: "ecommerce",
    title: "E-Commerce & Store",
    subtitle: "Product catalog, shopping cart, and online checkout",
    startingPrice: 19999,
    deliveryDays: "10–14 Days",
    defaultFeatures: ["ecommerce_cart", "payment_gateway", "whatsapp_alerts", "contact_form"],
    recommendedPages: 6,
    icon: "ShoppingBag",
  },
  {
    id: "healthcare",
    title: "Healthcare & Clinic",
    subtitle: "Doctors, private clinics, hospitals & diagnostic labs",
    startingPrice: 14999,
    deliveryDays: "7–10 Days",
    defaultFeatures: ["booking_calendar", "whatsapp_chat", "contact_form", "seo_basic"],
    recommendedPages: 5,
    icon: "HeartPulse",
  },
  {
    id: "portfolio",
    title: "Portfolio & Personal Brand",
    subtitle: "Creators, freelancers, photographers & senior executives",
    startingPrice: 6999,
    deliveryDays: "3–5 Days",
    defaultFeatures: ["gallery_showcase", "contact_form", "whatsapp_chat"],
    recommendedPages: 3,
    icon: "User",
  },
  {
    id: "saas",
    title: "SaaS Project & Web App",
    subtitle: "Software startups, customer portals & cloud tools",
    startingPrice: 34999,
    deliveryDays: "3–4 Weeks",
    defaultFeatures: ["user_login", "admin_dashboard", "payment_gateway", "email_notifications"],
    recommendedPages: 8,
    icon: "Sparkles",
  },
  {
    id: "realestate",
    title: "Real Estate & Builders",
    subtitle: "Property listings, architects, brokers & construction",
    startingPrice: 16999,
    deliveryDays: "7–10 Days",
    defaultFeatures: ["contact_form", "whatsapp_chat", "seo_basic", "gallery_showcase"],
    recommendedPages: 6,
    icon: "Home",
  },
  {
    id: "restaurant",
    title: "Restaurant, Cafe & Food",
    subtitle: "Digital food menu, table reservation & catering inquiries",
    startingPrice: 9999,
    deliveryDays: "5–7 Days",
    defaultFeatures: ["contact_form", "whatsapp_chat", "gallery_showcase"],
    recommendedPages: 4,
    icon: "Utensils",
  },
  {
    id: "education",
    title: "Education & Coaching",
    subtitle: "Institutes, academies, tutors & course admissions",
    startingPrice: 14999,
    deliveryDays: "7–10 Days",
    defaultFeatures: ["contact_form", "whatsapp_chat", "seo_basic", "booking_calendar"],
    recommendedPages: 6,
    icon: "GraduationCap",
  },
  {
    id: "custom",
    title: "Custom / Specialized",
    subtitle: "Bespoke digital product or multi-purpose requirement",
    startingPrice: 9999,
    deliveryDays: "Custom Scope",
    defaultFeatures: ["contact_form"],
    recommendedPages: 4,
    icon: "Layers",
  },
];

// ---------------------------------------------------------------------------
// Pure Calculation Types & Function
// ---------------------------------------------------------------------------

export interface EstimatorCalculationInput {
  categoryId?: string | null;
  typeId?: "static" | "dynamic" | string | null;
  pageCount?: number | null;
  deliverySpeed?: "standard" | "express" | string | null;
  selectedFeatureIds?: string[] | null;
}

export interface EstimatorCalculationConfig {
  categories?: WebsiteCategory[];
  types?: WebsiteTypeOption[];
  features?: FeatureOption[];
  pageSettings?: Partial<PageCountSettings>;
  pricingSettings?: Partial<PricingSettings>;
}

export interface PricingCalculationResult {
  category: WebsiteCategory;
  type: WebsiteTypeOption;
  effectiveTypeId: "static" | "dynamic";
  baseCategoryPrice: number;
  typePrice: number;
  pagesPrice: number;
  featuresCost: number;
  subtotal: number;
  expressPrice: number;
  grandTotal: number;
  selectedFeaturesList: FeatureOption[];
  normalizedFeatureIds: string[];
  estimatedDays: string;
  pageCount: number;
  deliverySpeed: "standard" | "express";
  // Dependency metadata
  requiresDynamic: boolean;
  conflictingFeatures: FeatureOption[];
  autoSwitchedToDynamic: boolean;
}

/**
 * Pure, exported pricing calculation function.
 * Preserves the exact pricing formula:
 * 1. Base category price
 * 2. Architecture type cost (Dynamic adds 8000)
 * 3. Page count cost: 1 page = -2000 discount, >5 pages = +1000 per extra page
 * 4. Features cost: sum of feature prices (admin_dashboard bundled free if dynamic)
 * 5. Subtotal = Math.max(4999, base + typeCost + pagesCost + featuresCost)
 * 6. Express delivery = 20% surcharge if express selected
 * 7. Grand total = Subtotal + Express
 *
 * Handles dependency auto-switching:
 * If static is requested but any feature requires dynamic (user_login, admin_dashboard,
 * blog, payment_gateway, booking_calendar), effectiveTypeId auto-switches to "dynamic".
 * Unknown or invalid feature IDs are safely ignored.
 */
export function calculatePricing(
  input: EstimatorCalculationInput = {},
  config: EstimatorCalculationConfig = {}
): PricingCalculationResult {
  const categories = config.categories && config.categories.length > 0
    ? config.categories
    : WEBSITE_CATEGORIES;
  const types = config.types && config.types.length > 0
    ? config.types
    : WEBSITE_TYPES;
  const allFeatures = config.features && config.features.length > 0
    ? config.features
    : POPULAR_FEATURES;

  const pageSettings: PageCountSettings = {
    ...PAGE_SETTINGS,
    ...(config.pageSettings || {}),
  };

  const pricingSettings: PricingSettings = {
    ...PRICING_SETTINGS,
    ...(config.pricingSettings || {}),
  };

  // 1. Resolve Category safely
  const resolvedCategory =
    categories.find((c) => c.id === input.categoryId) ||
    categories[0] ||
    WEBSITE_CATEGORIES[0];
  const baseCategoryPrice = resolvedCategory.startingPrice;

  // 2. Resolve Page Count safely (clamped between min and max)
  let rawPage = input.pageCount;
  if (typeof rawPage !== "number" || isNaN(rawPage)) {
    rawPage = resolvedCategory.recommendedPages || pageSettings.basePagesIncluded;
  }
  const pageCount = Math.max(pageSettings.minPages, Math.min(pageSettings.maxPages, Math.round(rawPage)));

  // Calculate page cost
  let pagesPrice = 0;
  if (pageCount === 1) {
    pagesPrice = -pageSettings.discountForOnePage;
  } else if (pageCount > pageSettings.basePagesIncluded) {
    pagesPrice = (pageCount - pageSettings.basePagesIncluded) * pageSettings.costPerExtraPage;
  }

  // 3. Resolve Delivery Speed safely
  const deliverySpeed: "standard" | "express" =
    input.deliverySpeed === "express" ? "express" : "standard";

  // 4. Resolve Features safely (filter invalid IDs and normalize aliases)
  const rawFeatureIds = Array.isArray(input.selectedFeatureIds)
    ? input.selectedFeatureIds
    : resolvedCategory.defaultFeatures || [];

  const selectedFeaturesList: FeatureOption[] = [];
  const normalizedFeatureIds: string[] = [];
  const seenIds = new Set<string>();

  rawFeatureIds.forEach((rawId) => {
    if (!rawId || typeof rawId !== "string") return;
    const normalized = normalizeFeatureId(rawId.trim());
    if (seenIds.has(normalized)) return;

    // Find in available features list (safely ignore unknown/invalid IDs)
    const feat = allFeatures.find((f) => f.id === normalized || f.id === rawId);
    if (feat) {
      seenIds.add(feat.id);
      normalizedFeatureIds.push(feat.id);
      selectedFeaturesList.push(feat);
    }
  });

  // 5. Dependency check: do any selected features require Dynamic?
  const conflictingFeatures = selectedFeaturesList.filter((f) =>
    featureRequiresDynamic(f.id)
  );
  const requiresDynamic = conflictingFeatures.length > 0;

  // 6. Resolve Architecture Type and Auto-switching
  const requestedType: "static" | "dynamic" =
    input.typeId === "dynamic" ? "dynamic" : "static";

  let effectiveTypeId: "static" | "dynamic" = requestedType;
  let autoSwitchedToDynamic = false;

  if (requiresDynamic && requestedType === "static") {
    effectiveTypeId = "dynamic";
    autoSwitchedToDynamic = true;
  }

  const resolvedType =
    types.find((t) => t.id === effectiveTypeId) ||
    types[0] ||
    WEBSITE_TYPES[0];
  const typePrice = resolvedType.additionalCost;

  // 7. Calculate Feature Costs
  let featuresCost = 0;
  selectedFeaturesList.forEach((feat) => {
    // admin_dashboard / admin_panel is bundled free if Dynamic architecture is selected
    const isBundled = Boolean(feat.includedInDynamic && effectiveTypeId === "dynamic");
    if (!isBundled) {
      featuresCost += feat.price;
    }
  });

  // 8. Calculate Totals preserving exact formula
  const subtotal = Math.max(
    pricingSettings.minProjectCost,
    baseCategoryPrice + typePrice + pagesPrice + featuresCost
  );

  const expressPrice =
    deliverySpeed === "express"
      ? Math.round(subtotal * pricingSettings.expressMultiplier)
      : 0;

  const grandTotal = subtotal + expressPrice;

  // 9. Estimate Timeline
  let estimatedDays = resolvedCategory.deliveryDays;
  if (deliverySpeed === "express") {
    estimatedDays = "Fast-Track Priority (3–5 Days)";
  } else if (effectiveTypeId === "dynamic" || pageCount > 8 || selectedFeaturesList.length > 5) {
    estimatedDays = "2–3 Weeks";
  }

  return {
    category: resolvedCategory,
    type: resolvedType,
    effectiveTypeId,
    baseCategoryPrice,
    typePrice,
    pagesPrice,
    featuresCost,
    subtotal,
    expressPrice,
    grandTotal,
    selectedFeaturesList,
    normalizedFeatureIds,
    estimatedDays,
    pageCount,
    deliverySpeed,
    requiresDynamic,
    conflictingFeatures,
    autoSwitchedToDynamic,
  };
}

// ---------------------------------------------------------------------------
// Trust Badges Configuration (Task 4)
// Enabled by default: "100% Source Code Ownership" and "Transparent Pricing"
// Disabled by default: "95+ Speed Score", "Milestone Escrow", "Guaranteed SLA"
// ---------------------------------------------------------------------------

export interface TrustBadgeConfig {
  id: string;
  label: string;
  enabled: boolean;
  iconName: "Shield" | "CheckCircle2" | "Zap" | "Lock" | "Clock";
}

export const TRUST_BADGES: TrustBadgeConfig[] = [
  {
    id: "source_code_ownership",
    label: "100% Source Code Ownership",
    enabled: true,
    iconName: "Shield",
  },
  {
    id: "transparent_pricing",
    label: "Transparent Pricing",
    enabled: true,
    iconName: "CheckCircle2",
  },
  {
    id: "speed_score",
    label: "95+ Speed Score",
    enabled: false,
    iconName: "Zap",
  },
  {
    id: "milestone_escrow",
    label: "Milestone Escrow",
    enabled: false,
    iconName: "Lock",
  },
  {
    id: "guaranteed_sla",
    label: "Guaranteed SLA",
    enabled: false,
    iconName: "Clock",
  },
];

// ---------------------------------------------------------------------------
// Launch Pricing Badge Configuration (Task 7)
// Enabled by default near the total. Does not change any prices.
// ---------------------------------------------------------------------------

export interface LaunchPricingBadgeConfig {
  enabled: boolean;
  label: string;
  description: string;
}

export const LAUNCH_PRICING_CONFIG: LaunchPricingBadgeConfig = {
  enabled: true,
  label: "Launch Pricing",
  description: "Introductory promotional rates for new projects",
};

// ---------------------------------------------------------------------------
// Terms & FAQ Configuration (Task 6)
// ---------------------------------------------------------------------------

export interface PricingTermsConfig {
  advancePercentage: number;
  deliveryPercentage: number;
  revisionRounds: number;
  freeSupportDays: number;
  gst: {
    enabled: boolean; // Configurable flag
    taxRatePercentage: number;
    statement: string;
  };
  timelineNote: string;
  extraPageDefinition: string;
  hostingAndDomainNote: string;
}

export const PRICING_TERMS: PricingTermsConfig = {
  advancePercentage: 50,
  deliveryPercentage: 50,
  revisionRounds: 2,
  freeSupportDays: 15,
  gst: {
    enabled: true,
    taxRatePercentage: 18,
    statement: "Prices are exclusive of applicable 18% GST. A valid tax invoice with GSTIN is issued upon milestone payments.",
  },
  timelineNote: "The delivery timeline officially begins after all necessary project content, branding assets, and external credentials are provided.",
  extraPageDefinition: "An extra page is defined as any distinct URL route or custom layout containing independent content beyond the included base pages.",
  hostingAndDomainNote: "Domain registration and cloud hosting accounts are maintained directly by the client and billed at provider actuals.",
};

export interface PricingFaqItem {
  id: string;
  question: string;
  answer: string;
}

export const PRICING_FAQS: PricingFaqItem[] = [
  {
    id: "faq-revisions",
    question: "How do revisions work?",
    answer:
      "Each project includes 2 full rounds of feedback and revisions. The first round occurs after the initial design and structure layout. The second round takes place on the interactive staging deployment before launch. Additional revisions can be scheduled if needed at standard rates.",
  },
  {
    id: "faq-hosting",
    question: "How are domain and hosting billed?",
    answer:
      "We believe you should have complete autonomy over your online presence. You register and pay for your domain and hosting directly with providers (such as Vercel, AWS, or Cloudflare) at actual costs. We handle complete DNS setup and deployment configuration for you.",
  },
  {
    id: "faq-source-code",
    question: "Do I get full ownership of the source code?",
    answer:
      "Yes. Once final payment is settled, full ownership of the Git repository, production code, design files, and database schemas is transferred to your organization. There are no proprietary lock-ins or recurring licensing fees to Webgent.",
  },
  {
    id: "faq-not-included",
    question: "What is not included in this pricing estimate?",
    answer:
      "Third-party provider usage fees (such as domain registration, cloud server hosting tiers, WhatsApp Business API message usage, third-party AI API tokens, and payment gateway transaction fees) are billed by their respective providers at actuals. Professional copywriting and photo shoot production are also available separately if needed.",
  },
];

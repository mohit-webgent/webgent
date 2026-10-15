import { MASTER_FEATURES } from "./pricing-matrix-features";

export type MasterPackageTier = "starter" | "business" | "pro";

export type FeatureStatus =
  | "included"
  | "limited"
  | "addon"
  | "not_included"
  | "custom_quote";

// 12 Client-Focused Master Category Keys
export type MasterCategoryKey =
  | "website_pages"
  | "content_cms"
  | "ecommerce"
  | "user_accounts"
  | "admin_business"
  | "backend_database"
  | "payments_subscriptions"
  | "communication_notifications"
  | "booking_scheduling"
  | "seo_analytics"
  | "integrations_ai"
  | "deployment_maintenance"
  // Legacy keys preserved for backward compatibility
  | "design_frontend"
  | "cms_content"
  | "auth_accounts"
  | "admin_management"
  | "payments_billing"
  | "communication"
  | "email_marketing"
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
// PACKAGES — Clean, Transparent Pricing & Verified Highlights
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
      "A fast, modern responsive website with custom styling, mobile optimization, lead inquiry form, technical SEO, and social media integration.",
    keyHighlights: [
      "Up to 5 Custom Styled Pages",
      "100% Responsive Design (Desktop, Tablet & Mobile)",
      "Interactive Lead & Inquiry Contact Form",
      "Technical On-Page SEO & Schema Markup",
      "Social Media Share Cards (OpenGraph)",
      "Production Cloud Deployment & Free SSL",
      "Clean Typography & Modular Layout",
      "14 Days Post-Launch Bug-Fix Warranty",
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
      "A comprehensive business website with up to 10 custom pages, custom design system, blog & content CMS, dynamic forms, testimonials, FAQ, lead management CRM, advance SEO, search & filters, and third-party API integration.",
    keyHighlights: [
      "Up to 10 Custom Styled Pages",
      "Custom Design System & Component Library",
      "Blog & Resource Publication Engine",
      "Built-in Admin Content Management Portal",
      "Interactive Media Showcase & Lightbox Gallery",
      "Lead Management & Operations Mini-CRM",
      "Advanced Search, Dynamic Filters & Pagination",
      "Transactional Email & SMS Notifications",
      "Google Analytics 4 & Conversion Tracking",
      "Core Web Vitals & Speed Optimization",
      "Zapier & Webhook Connectors",
      "30 Days Post-Launch Bug-Fix Warranty",
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
      "Production-grade web application with up to 15 custom screens, custom backend APIs, database integration, user authentication with RBAC, full admin dashboard, file uploads, payment gateway, WhatsApp automation, and complete error handling.",
    keyHighlights: [
      "Up to 15 Custom Application Screens",
      "Custom Backend APIs & Relational Database (Prisma/Postgres)",
      "User Authentication & Role-Based Access (RBAC)",
      "Full CRUD Admin Operations Dashboard",
      "Production Payment Gateway Integration (Razorpay/Stripe)",
      "Product Catalog, Cart & Checkout Pipeline",
      "Secure File Uploads & Cloud Storage (AWS S3/R2)",
      "Official WhatsApp Business API Automation",
      "Interactive Booking & Appointment Calendar",
      "Two-Way Google & Outlook Calendar Sync",
      "Fast In-Memory Caching & Background Queues",
      "60 Days Post-Launch Extended Warranty",
    ],
  },
};

// ---------------------------------------------------------------------------
// 12 Client-Focused Master Categories
// ---------------------------------------------------------------------------
export const MASTER_CATEGORIES: MasterCategoryMeta[] = [
  {
    key: "website_pages",
    number: 1,
    label: "Website & Pages",
    shortLabel: "Pages & UI",
    iconName: "Layout",
    description: "Modern responsive layouts, multi-page architectures, landing pages, design systems, and fluid UI experiences.",
    featureCount: 11,
  },
  {
    key: "content_cms",
    number: 2,
    label: "Content & CMS",
    shortLabel: "Content & CMS",
    iconName: "BookOpen",
    description: "Content authoring, blog publishing, headless CMS integrations, and self-managed client editorial portals.",
    featureCount: 8,
  },
  {
    key: "ecommerce",
    number: 3,
    label: "E-Commerce",
    shortLabel: "E-Commerce",
    iconName: "ShoppingBag",
    description: "Product catalogs, shopping cart drawer, checkout workflows, inventory management, and order tracking.",
    featureCount: 9,
  },
  {
    key: "user_accounts",
    number: 4,
    label: "User Accounts & Permissions",
    shortLabel: "User Accounts",
    iconName: "Lock",
    description: "Secure user registration, authentication, social login (Google/Apple), profile portals, and role-based permissions.",
    featureCount: 5,
  },
  {
    key: "admin_business",
    number: 5,
    label: "Admin Dashboard & Business Management",
    shortLabel: "Admin & Business",
    iconName: "LayoutDashboard",
    description: "Centralized administrative portals, lead/inquiry management, reporting metrics, audit logs, and data exports.",
    featureCount: 5,
  },
  {
    key: "backend_database",
    number: 6,
    label: "Backend & Database",
    shortLabel: "Backend & DB",
    iconName: "Database",
    description: "High-performance databases (PostgreSQL/MySQL), Prisma ORM, custom APIs, fast caching, and cloud file storage.",
    featureCount: 6,
  },
  {
    key: "payments_subscriptions",
    number: 7,
    label: "Payments & Subscriptions",
    shortLabel: "Payments & Billing",
    iconName: "CreditCard",
    description: "Payment gateway integration (Razorpay/Stripe), UPI, recurring subscriptions, automated GST invoicing, and webhooks.",
    featureCount: 5,
  },
  {
    key: "communication_notifications",
    number: 8,
    label: "Email, WhatsApp & Notifications",
    shortLabel: "Notifications",
    iconName: "MessageCircle",
    description: "Transactional email delivery, official WhatsApp Business API alerts, SMS notifications, and marketing integrations.",
    featureCount: 5,
  },
  {
    key: "booking_scheduling",
    number: 9,
    label: "Booking & Scheduling",
    shortLabel: "Booking & Calendar",
    iconName: "Calendar",
    description: "Interactive appointment calendars, time-slot selection, multi-staff scheduling, and calendar synchronization.",
    featureCount: 5,
  },
  {
    key: "seo_analytics",
    number: 10,
    label: "SEO, Analytics & Performance",
    shortLabel: "SEO & Analytics",
    iconName: "Zap",
    description: "Technical on-page SEO, rich schema markup, Google Analytics 4, Core Web Vitals optimization, and conversion tracking.",
    featureCount: 5,
  },
  {
    key: "integrations_ai",
    number: 11,
    label: "Third-Party Integrations & AI",
    shortLabel: "Integrations & AI",
    iconName: "Bot",
    description: "AI support chatbots, document parsing, CRM integrations (HubSpot/Zoho), Zapier webhooks, and third-party APIs.",
    featureCount: 5,
  },
  {
    key: "deployment_maintenance",
    number: 12,
    label: "Deployment, Security & Maintenance",
    shortLabel: "Cloud & Support",
    iconName: "Shield",
    description: "Cloud deployment (Vercel/AWS), custom domain & SSL setup, post-launch bug-fix warranty, and monthly developer hours.",
    featureCount: 6,
  },
];

// ---------------------------------------------------------------------------
// Backward Compatibility / Legacy ID Migration Map
// ---------------------------------------------------------------------------
export const LEGACY_FEATURE_ID_MAP: Record<string, string> = {
  // Website & Pages
  design_frontend_additional_website_pages: "website_pages_additional_pages",
  designfrontend_additional_website_pages: "website_pages_additional_pages",
  design_frontend_custom_website_design: "website_pages_responsive_design",
  designfrontend_custom_website_design: "website_pages_responsive_design",
  design_frontend_responsive_desktop_design: "website_pages_responsive_design",
  design_frontend_responsive_tablet_design: "website_pages_responsive_design",
  design_frontend_responsive_mobile_design: "website_pages_responsive_design",
  design_frontend_landing_page: "website_pages_landing_page",
  design_frontend_multi_page_website: "website_pages_multi_page",
  design_frontend_design_system_and_reusable_components: "website_pages_ui_design_system",
  design_frontend_component_library: "website_pages_ui_design_system",
  design_frontend_dark_light_theme: "website_pages_dark_light_mode",
  design_frontend_multi_step_form: "website_pages_multistep_form",
  design_frontend_image_gallery: "website_pages_media_gallery",
  design_frontend_image_carousel: "website_pages_media_gallery",
  design_frontend_multi_language_ui: "website_pages_multilingual_ui",
  design_frontend_gsap_animations: "website_pages_motion_choreography",
  design_frontend_framer_motion_animations: "website_pages_motion_choreography",
  design_frontend_scroll_triggered_animations: "website_pages_motion_choreography",
  design_frontend_interactive_three_js_section: "website_pages_3d_webgl_hero",
  // Content & CMS
  cms_content_blog_listing: "content_cms_blog_engine",
  cmscontent_blog_listing: "content_cms_blog_engine",
  cms_content_blog_detail_pages: "content_cms_blog_engine",
  cms_content_admin_content_management: "content_cms_admin_portal",
  cmscontent_admin_content_management: "content_cms_admin_portal",
  cms_content_headless_cms_integration: "content_cms_headless_integration",
  cms_content_rich_text_editor: "content_cms_rich_text_editor",
  cms_content_documentation_knowledge_base: "content_cms_knowledge_base",
  cms_content_case_study_management: "content_cms_case_study_showcase",
  cms_content_testimonial_management: "content_cms_testimonials_faq_manager",
  cms_content_faq_management: "content_cms_testimonials_faq_manager",
  cms_content_scheduled_publishing: "content_cms_scheduled_publishing",
  // E-commerce
  ecommerce_product_catalog: "ecommerce_product_catalog",
  ecommerce_shopping_cart: "ecommerce_cart_drawer",
  ecommerce_slide_out_cart: "ecommerce_cart_drawer",
  ecommerce_checkout: "ecommerce_checkout_pipeline",
  ecommerce_product_variants: "ecommerce_variants_inventory",
  ecommerce_coupons_and_discounts: "ecommerce_discounts_coupons",
  ecommerce_order_management: "ecommerce_order_management",
  ecommerce_product_reviews: "ecommerce_customer_reviews",
  ecommerce_wishlist: "ecommerce_wishlist",
  ecommerce_abandoned_cart_recovery: "ecommerce_abandoned_cart",
  // User Accounts
  auth_accounts_user_authentication: "user_accounts_authentication",
  auth_accounts_jwt_session: "user_accounts_authentication",
  auth_accounts_oauth_social_login: "user_accounts_social_login",
  auth_accounts_social_login: "user_accounts_social_login",
  auth_accounts_role_based_access_control: "user_accounts_rbac",
  auth_accounts_two_factor_authentication: "user_accounts_two_factor",
  auth_accounts_team_accounts: "user_accounts_team_workspaces",
  // Admin & Business
  admin_management_admin_dashboard: "admin_business_operations_dashboard",
  adminmanagement_admin_dashboard: "admin_business_operations_dashboard",
  crm_productivity_lead_management: "admin_business_lead_crm",
  crmproductivity_lead_management: "admin_business_lead_crm",
  admin_management_data_export: "admin_business_data_export",
  admin_management_audit_logs: "admin_business_audit_logs",
  // Backend & Database
  backend_database_prisma_schema: "backend_database_prisma_schema",
  backenddatabase_prisma_schema: "backend_database_prisma_schema",
  files_storage_s3_upload: "backend_database_file_storage",
  filesstorage_s3_upload: "backend_database_file_storage",
  backend_database_redis_cache: "backend_database_caching",
  backend_database_search_indexing: "backend_database_search_filtering",
  backend_database_background_queues: "backend_database_background_jobs",
  search_location_google_maps: "backend_database_location_maps",
  // Payments
  payments_billing_online_payment_gateway: "payments_subscriptions_gateway",
  paymentsbilling_online_payment_gateway: "payments_subscriptions_gateway",
  payments_billing_recurring_subscriptions: "payments_subscriptions_recurring_billing",
  payments_billing_automated_invoicing: "payments_subscriptions_automated_invoicing",
  payments_billing_multi_currency_support: "payments_subscriptions_multi_currency",
  // Communication
  communication_whatsapp_cloud_api: "communication_notifications_whatsapp_business",
  communication_sms_otp: "communication_notifications_sms_otp",
  email_marketing_transactional_email: "communication_notifications_transactional_email",
  email_marketing_newsletter_signup: "communication_notifications_email_newsletter",
  communication_web_push: "communication_notifications_web_push",
  // Booking
  booking_scheduling_appointment_calendar: "booking_scheduling_appointment_calendar",
  bookingscheduling_appointment_calendar: "booking_scheduling_appointment_calendar",
  booking_scheduling_calendar_sync: "booking_scheduling_calendar_sync",
  booking_scheduling_multi_staff_calendar: "booking_scheduling_multistaff",
  booking_scheduling_paid_bookings: "booking_scheduling_paid_consultations",
  booking_scheduling_automated_reminders: "booking_scheduling_automated_reminders",
  // SEO & Analytics
  seo_growth_technical_on_page_seo: "seo_analytics_onpage_technical_seo",
  seogrowth_technical_on_page_seo: "seo_analytics_onpage_technical_seo",
  seo_growth_google_analytics_4: "seo_analytics_google_analytics_tracking",
  seo_growth_core_web_vitals: "seo_analytics_core_web_vitals",
  seo_growth_cookie_banner: "seo_analytics_cookie_consent",
  // Integrations & AI
  ai_automation_ai_chatbot: "integrations_ai_support_chatbot",
  aiautomation_ai_chatbot: "integrations_ai_support_chatbot",
  ai_automation_ocr_parsing: "integrations_ai_ocr_document_parsing",
  integrations_workflows_crm_sync: "integrations_ai_crm_connectors",
  integrations_workflows_zapier_integration: "integrations_ai_zapier_webhooks",
  // Deployment & Maintenance
  devops_infrastructure_cloud_deployment: "deployment_maintenance_cloud_deployment",
  devopsinfrastructure_cloud_deployment: "deployment_maintenance_cloud_deployment",
  testing_maintenance_warranty: "deployment_maintenance_bugfix_warranty",
  testing_maintenance_uptime_monitoring: "deployment_maintenance_uptime_monitoring",
  security_compliance_rate_limiting: "deployment_maintenance_security_hardening",
  testing_maintenance_monthly_development_hours: "deployment_maintenance_monthly_hours",
  testingmaintenance_monthly_development_hours: "deployment_maintenance_monthly_hours",
  backend_database_automated_backups: "deployment_maintenance_backup_recovery",
};

/**
 * Safely resolves any legacy, aliased, or un-underscored feature ID to its canonical version
 */
export function normalizeMatrixFeatureId(id: string): string {
  if (!id) return id;
  const direct = LEGACY_FEATURE_ID_MAP[id];
  if (direct) return direct;
  const noUnderscore = id.replace(/_/g, "");
  const normalizedMatch = Object.entries(LEGACY_FEATURE_ID_MAP).find(
    ([k]) => k.replace(/_/g, "") === noUnderscore
  );
  if (normalizedMatch) return normalizedMatch[1];
  return id;
}

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
  const canonicalId = normalizeMatrixFeatureId(featureId);
  const feat = MASTER_FEATURES.find((f) => f.id === canonicalId || f.id === featureId);
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

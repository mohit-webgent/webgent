const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// 12 Client-Focused Master Categories & Production Features
// ---------------------------------------------------------------------------
const rawCategories = [
  {
    key: "website_pages",
    number: 1,
    label: "Website & Pages",
    shortLabel: "Pages & UI",
    iconName: "Layout",
    description: "Modern responsive layouts, multi-page architectures, landing pages, design systems, and fluid UI experiences.",
    items: [
      {
        id: "website_pages_responsive_design",
        name: "100% Responsive Design (Desktop, Tablet & Mobile)",
        desc: "Adaptive fluid layouts optimized for all viewport sizes, from high-resolution 4K monitors to smartphones.",
        s: "included", b: "included", p: "included",
        price: 0,
      },
      {
        id: "website_pages_landing_page",
        name: "High-Conversion Landing Page",
        desc: "Single-page architecture with hero proposition, visual proof, feature highlights, and clear call-to-actions.",
        s: "included", b: "included", p: "included",
        price: 0,
      },
      {
        id: "website_pages_multi_page",
        name: "Multi-Page Website Structure",
        desc: "Multi-route application with header navigation, hierarchical information architecture, and structured footer.",
        s: "limited", b: "included", p: "included",
        sNote: "Up to 5 pages", bNote: "Up to 10 pages", pNote: "Up to 15 pages",
        price: 4999,
      },
      {
        id: "website_pages_additional_pages",
        name: "Additional Custom Website Pages",
        desc: "Bespoke custom-designed pages matching your visual identity and modular component system.",
        s: "addon", b: "addon", p: "addon",
        price: 1000,
        hasQty: true, unit: "Pages", maxQty: 25,
      },
      {
        id: "website_pages_ui_design_system",
        name: "Custom Design System & Component Library",
        desc: "Tailored brand design system with standardized color tokens, typography scales, buttons, inputs, and reusable components.",
        s: "limited", b: "included", p: "included",
        sNote: "Core design tokens",
        price: 3999,
      },
      {
        id: "website_pages_dark_light_mode",
        name: "Dark & Light Mode Switcher",
        desc: "Persistent theme switcher with system preference detection and zero-flash layout hydration.",
        s: "addon", b: "included", p: "included",
        price: 2999,
      },
      {
        id: "website_pages_multistep_form",
        name: "Multi-Step Onboarding & Inquiry Questionnaire",
        desc: "Interactive multi-step form with progression indicators, condition-based branching, and client-side validation.",
        s: "addon", b: "addon", p: "included",
        price: 3999,
      },
      {
        id: "website_pages_media_gallery",
        name: "Interactive Media Showcase & Lightbox Gallery",
        desc: "Responsive image and video grid with category filters, touch-swipe lightbox modal, and lazy loading.",
        s: "addon", b: "included", p: "included",
        price: 2499,
      },
      {
        id: "website_pages_multilingual_ui",
        name: "Multi-Language UI (Internationalization)",
        desc: "Multi-language locale switcher with localized strings, route-based localization, and bidirectional layout (LTR/RTL).",
        s: "addon", b: "addon", p: "included",
        price: 5999,
      },
      {
        id: "website_pages_motion_choreography",
        name: "Advanced Motion & Scroll-Driven Animations",
        desc: "Smooth scroll choreography, entrance transitions, and interactive visual feedback using GSAP and Framer Motion.",
        s: "addon", b: "included", p: "included",
        price: 3999,
      },
      {
        id: "website_pages_3d_webgl_hero",
        name: "Interactive 3D / WebGL Experience (Three.js)",
        desc: "Custom 3D canvas with interactive camera controls, dynamic lighting, and immersive brand storytelling.",
        s: "addon", b: "addon", p: "addon",
        price: 9999,
      },
    ],
  },
  {
    key: "content_cms",
    number: 2,
    label: "Content & CMS",
    shortLabel: "Content & CMS",
    iconName: "BookOpen",
    description: "Content authoring, blog publishing, headless CMS integrations, and self-managed client editorial portals.",
    items: [
      {
        id: "content_cms_blog_engine",
        name: "Blog & Resource Publication Engine",
        desc: "Clean publication section with category filtering, reading-time estimates, author bylines, and social sharing.",
        s: "addon", b: "included", p: "included",
        price: 3499,
      },
      {
        id: "content_cms_admin_portal",
        name: "Built-in Content Management Portal",
        desc: "Secure back-office admin panel allowing non-technical team members to create, edit, draft, and publish content.",
        s: "addon", b: "included", p: "included",
        price: 4999,
      },
      {
        id: "content_cms_headless_integration",
        name: "Headless CMS Integration (Sanity / Strapi / Contentful)",
        desc: "Integration with external enterprise headless CMS platforms via GraphQL or REST API for structured publishing.",
        s: "addon", b: "addon", p: "included",
        price: 5999,
      },
      {
        id: "content_cms_rich_text_editor",
        name: "Rich Text & Visual WYSIWYG Editor",
        desc: "In-browser rich editor with header formatting, code blocks, quote callouts, lists, and inline media embeds.",
        s: "addon", b: "included", p: "included",
        price: 2999,
      },
      {
        id: "content_cms_knowledge_base",
        name: "Documentation Hub & Knowledge Base",
        desc: "Hierarchical documentation tree with nested sidebar navigation, instant article search, and code syntax highlighting.",
        s: "addon", b: "addon", p: "included",
        price: 5999,
      },
      {
        id: "content_cms_case_study_showcase",
        name: "Case Studies & Client Portfolio Showcase",
        desc: "Filterable work portfolio with client metrics, challenge/solution deep dives, visual galleries, and live links.",
        s: "addon", b: "included", p: "included",
        price: 3499,
      },
      {
        id: "content_cms_testimonials_faq_manager",
        name: "Testimonials & FAQ Dynamic Manager",
        desc: "Dynamic management to add, update, and reorder client testimonials, partner logos, and FAQ accordions.",
        s: "included", b: "included", p: "included",
        sNote: "Static content in Starter",
        price: 2499,
      },
      {
        id: "content_cms_scheduled_publishing",
        name: "Scheduled Publishing & Editorial Revisions",
        desc: "Automated timed publishing calendar with content version history and instant snapshot rollback.",
        s: "not_included", b: "addon", p: "included",
        price: 3999,
      },
    ],
  },
  {
    key: "ecommerce",
    number: 3,
    label: "E-commerce",
    shortLabel: "E-Commerce",
    iconName: "ShoppingBag",
    description: "Product catalogs, shopping cart drawer, checkout workflows, inventory management, and order tracking.",
    items: [
      {
        id: "ecommerce_product_catalog",
        name: "Product Catalog & Showcase Grid",
        desc: "Categorized product listings with high-resolution imagery, quick view modals, pricing, and availability badges.",
        s: "addon", b: "addon", p: "included",
        price: 4999,
      },
      {
        id: "ecommerce_cart_drawer",
        name: "Slide-Out Shopping Cart & Mini-Cart",
        desc: "Persistent client-side cart drawer with item quantity adjustments, live subtotal updates, and free shipping triggers.",
        s: "addon", b: "addon", p: "included",
        price: 3999,
      },
      {
        id: "ecommerce_checkout_pipeline",
        name: "Multi-Step Checkout Pipeline",
        desc: "Frictionless checkout experience with address autocomplete, order summary, tax calculation, and order confirmation.",
        s: "addon", b: "addon", p: "included",
        price: 6999,
      },
      {
        id: "ecommerce_variants_inventory",
        name: "Product Variants & Inventory Tracking",
        desc: "Multi-attribute variant selector (size, color, material) with SKU management, stock counters, and low-inventory alerts.",
        s: "addon", b: "addon", p: "included",
        price: 4499,
      },
      {
        id: "ecommerce_discounts_coupons",
        name: "Discount Codes & Promotional Coupons",
        desc: "Promo code engine supporting percentage discounts, flat reductions, expiration dates, and minimum cart rules.",
        s: "addon", b: "addon", p: "included",
        price: 2999,
      },
      {
        id: "ecommerce_order_management",
        name: "Order Management & Tracking Portal",
        desc: "Admin order fulfillment dashboard with status progression (Placed, Processing, Dispatched, Delivered) and tracking links.",
        s: "addon", b: "addon", p: "included",
        price: 5999,
      },
      {
        id: "ecommerce_customer_reviews",
        name: "Verified Customer Reviews & Ratings",
        desc: "Product review submission with star ratings, verified purchase tags, photo uploads, and admin moderation queue.",
        s: "addon", b: "addon", p: "included",
        price: 3499,
      },
      {
        id: "ecommerce_wishlist",
        name: "Wishlist & Saved Items",
        desc: "Customer saved-items list with one-click transfer to cart and local storage / account synchronization.",
        s: "addon", b: "addon", p: "included",
        price: 2499,
      },
      {
        id: "ecommerce_abandoned_cart",
        name: "Abandoned Cart Recovery Automation",
        desc: "Automated trigger system capturing abandoned sessions and sending timely reminder notifications.",
        s: "not_included", b: "addon", p: "addon",
        price: 4999,
      },
    ],
  },
  {
    key: "user_accounts",
    number: 4,
    label: "User Accounts & Permissions",
    shortLabel: "User Accounts",
    iconName: "Lock",
    description: "Secure user registration, authentication, social login (Google/Apple), profile portals, and role-based permissions.",
    items: [
      {
        id: "user_accounts_authentication",
        name: "User Authentication & Account Portal",
        desc: "Complete account system with email/password signup, secure session management, password recovery, and profile editing.",
        s: "addon", b: "addon", p: "included",
        price: 5999,
      },
      {
        id: "user_accounts_social_login",
        name: "Social Login Integration (Google, Apple, GitHub)",
        desc: "One-click OAuth authentication allowing users to sign up and log in via trusted identity providers.",
        s: "addon", b: "addon", p: "included",
        price: 3499,
      },
      {
        id: "user_accounts_rbac",
        name: "Role-Based Access Control (RBAC)",
        desc: "Granular permission tiers (Super Admin, Manager, Editor, Member) with route guards and action restrictions.",
        s: "not_included", b: "addon", p: "included",
        price: 4999,
      },
      {
        id: "user_accounts_two_factor",
        name: "Two-Factor Authentication (2FA / OTP)",
        desc: "Enhanced login security via TOTP authenticator apps (Google Authenticator) or SMS/Email verification codes.",
        s: "not_included", b: "addon", p: "addon",
        price: 3999,
      },
      {
        id: "user_accounts_team_workspaces",
        name: "Multi-User Team Workspaces & Member Invites",
        desc: "Multi-tenancy workspace architecture with team member email invites, role assignment, and organization settings.",
        s: "not_included", b: "custom_quote", p: "included",
        price: 7999,
      },
    ],
  },
  {
    key: "admin_business",
    number: 5,
    label: "Admin Dashboard & Business Management",
    shortLabel: "Admin & Business",
    iconName: "LayoutDashboard",
    description: "Centralized administrative portals, lead/inquiry management, reporting metrics, audit logs, and data exports.",
    items: [
      {
        id: "admin_business_operations_dashboard",
        name: "Admin Dashboard & Operations Portal",
        desc: "Comprehensive back-office panel displaying business KPIs, recent activity, system health, and management shortcuts.",
        s: "addon", b: "limited", p: "included",
        bNote: "Basic management", pNote: "Full CRUD & analytics",
        price: 6999,
      },
      {
        id: "admin_business_lead_crm",
        name: "Lead Management & Mini-CRM",
        desc: "Centralized inquiry inbox with status tags (New, Contacted, Qualified, Closed), internal team notes, and assignment.",
        s: "addon", b: "included", p: "included",
        price: 4499,
      },
      {
        id: "admin_business_data_export",
        name: "Data Export & Report Generation (CSV / PDF / Excel)",
        desc: "One-click export of customer records, transaction histories, and analytics summaries into structured CSV/Excel or branded PDF.",
        s: "addon", b: "included", p: "included",
        price: 2999,
      },
      {
        id: "admin_business_audit_logs",
        name: "Activity Audit Logs & Security History",
        desc: "Immutable event audit trail logging admin actions, logins, status updates, and critical system modifications.",
        s: "not_included", b: "addon", p: "included",
        price: 3499,
      },
      {
        id: "admin_business_custom_workflows",
        name: "Custom Business Approval & Processing Workflows",
        desc: "Multi-step operational pipelines tailored to custom business rules, application approvals, and departmental sign-offs.",
        s: "not_included", b: "custom_quote", p: "custom_quote",
        price: null, isCustomQuote: true,
      },
    ],
  },
  {
    key: "backend_database",
    number: 6,
    label: "Backend & Database",
    shortLabel: "Backend & DB",
    iconName: "Database",
    description: "High-performance databases (PostgreSQL/MySQL), Prisma ORM, custom APIs, fast caching, and cloud file storage.",
    items: [
      {
        id: "backend_database_prisma_schema",
        name: "Custom Backend APIs & Database Integration",
        desc: "Production database setup (PostgreSQL / MySQL) with relational schema modeling, Prisma ORM, and secure REST/Server Actions.",
        s: "addon", b: "addon", p: "included",
        price: 7999,
      },
      {
        id: "backend_database_file_storage",
        name: "Secure File Uploads & Cloud Storage (AWS S3 / R2)",
        desc: "Direct-to-cloud file uploads with presigned security URLs, file-type validation, size limits, and CDN distribution.",
        s: "addon", b: "addon", p: "included",
        price: 4499,
      },
      {
        id: "backend_database_caching",
        name: "Fast In-Memory Caching (Redis / Upstash)",
        desc: "High-speed caching layer reducing database queries, accelerating API responses, and handling rate-limiting.",
        s: "not_included", b: "addon", p: "included",
        price: 3499,
      },
      {
        id: "backend_database_search_filtering",
        name: "Advanced Search, Dynamic Filters & Pagination",
        desc: "Full-text database indexing, multi-category faceted filters, price range sliders, and instant debounced search.",
        s: "addon", b: "included", p: "included",
        price: 3499,
      },
      {
        id: "backend_database_background_jobs",
        name: "Background Queue & Cron Job Processing",
        desc: "Asynchronous task queue for long-running workflows, automated nightly cleanups, and batch data processing.",
        s: "not_included", b: "addon", p: "included",
        price: 4999,
      },
      {
        id: "backend_database_location_maps",
        name: "Interactive Maps & Location Geocoding",
        desc: "Google Maps / Mapbox integration with store locator, custom map markers, direction links, and radius searching.",
        s: "addon", b: "included", p: "included",
        price: 2999,
      },
    ],
  },
  {
    key: "payments_subscriptions",
    number: 7,
    label: "Payments & Subscriptions",
    shortLabel: "Payments & Billing",
    iconName: "CreditCard",
    description: "Payment gateway integration (Razorpay/Stripe), UPI, recurring subscriptions, automated GST invoicing, and webhooks.",
    items: [
      {
        id: "payments_subscriptions_gateway",
        name: "Online Payment Gateway Integration (Razorpay / Stripe)",
        desc: "End-to-end payment processing for UPI, Credit/Debit cards, Netbanking, and digital wallets with instant webhook receipts.",
        s: "addon", b: "addon", p: "included",
        price: 5999,
      },
      {
        id: "payments_subscriptions_recurring_billing",
        name: "Recurring Subscriptions & Membership Billing",
        desc: "Automated recurring billing cycles (Monthly/Annual), plan upgrade/downgrade handling, proration, and cancellation workflows.",
        s: "not_included", b: "addon", p: "addon",
        price: 6999,
      },
      {
        id: "payments_subscriptions_automated_invoicing",
        name: "Automated GST Invoicing & Tax Receipts",
        desc: "System-generated PDF tax invoices with business GSTIN calculation, sequential numbering, and automatic email dispatch.",
        s: "addon", b: "addon", p: "included",
        price: 3499,
      },
      {
        id: "payments_subscriptions_multi_currency",
        name: "Multi-Currency & International Payments",
        desc: "Global checkout handling dynamic currency conversion (USD, EUR, GBP, INR) with localized payment methods.",
        s: "not_included", b: "addon", p: "addon",
        price: 4999,
      },
      {
        id: "payments_subscriptions_custom_escrow",
        name: "Marketplace Payouts & Custom Split Payments",
        desc: "Custom multi-party payment split (Razorpay Route / Stripe Connect) for marketplace vendor commissions.",
        s: "not_included", b: "custom_quote", p: "custom_quote",
        price: null, isCustomQuote: true,
      },
    ],
  },
  {
    key: "communication_notifications",
    number: 8,
    label: "Email, WhatsApp & Notifications",
    shortLabel: "Notifications",
    iconName: "MessageCircle",
    description: "Transactional email delivery, official WhatsApp Business API alerts, SMS notifications, and marketing integrations.",
    items: [
      {
        id: "communication_notifications_transactional_email",
        name: "Transactional Email Delivery (Resend / AWS SES)",
        desc: "High-deliverability automated emails for order confirmations, inquiry alerts, password resets, and branded HTML templates.",
        s: "included", b: "included", p: "included",
        sNote: "Standard SMTP in Starter",
        price: 2499,
      },
      {
        id: "communication_notifications_whatsapp_business",
        name: "Official WhatsApp Business API Automation",
        desc: "Automated real-time WhatsApp message triggers on new inquiries, appointment bookings, and dispatch updates.",
        s: "addon", b: "addon", p: "included",
        price: 4499,
      },
      {
        id: "communication_notifications_sms_otp",
        name: "SMS Notifications & OTP Verification",
        desc: "High-speed SMS delivery for mobile phone number verification, authentication OTPs, and urgent operational alerts.",
        s: "addon", b: "included", p: "included",
        price: 2999,
      },
      {
        id: "communication_notifications_email_newsletter",
        name: "Email Newsletter & Marketing Sync",
        desc: "Subscriber capture forms connected to Mailchimp, ConvertKit, or Brevo with automated lead list synchronization.",
        s: "addon", b: "included", p: "included",
        price: 2499,
      },
      {
        id: "communication_notifications_web_push",
        name: "Web Push Notifications",
        desc: "Browser-level opt-in push notifications alerting active subscribers about new blog posts, deals, or announcements.",
        s: "addon", b: "addon", p: "included",
        price: 2999,
      },
    ],
  },
  {
    key: "booking_scheduling",
    number: 9,
    label: "Booking & Scheduling",
    shortLabel: "Booking & Calendar",
    iconName: "Calendar",
    description: "Interactive appointment calendars, time-slot selection, multi-staff scheduling, and calendar synchronization.",
    items: [
      {
        id: "booking_scheduling_appointment_calendar",
        name: "Interactive Appointment & Booking Calendar",
        desc: "Client-facing appointment scheduler with real-time available time-slots, buffer times, and service duration options.",
        s: "addon", b: "addon", p: "included",
        price: 4999,
      },
      {
        id: "booking_scheduling_calendar_sync",
        name: "Two-Way Google & Outlook Calendar Sync",
        desc: "Real-time calendar synchronization automatically blocking booked client slots on team calendars to prevent double-booking.",
        s: "not_included", b: "addon", p: "included",
        price: 3499,
      },
      {
        id: "booking_scheduling_multistaff",
        name: "Multi-Staff & Resource Scheduling",
        desc: "Assign bookings to specific doctors, consultants, or service staff with individual availability schedules.",
        s: "not_included", b: "addon", p: "included",
        price: 4499,
      },
      {
        id: "booking_scheduling_paid_consultations",
        name: "Paid Appointments & Consultation Deposits",
        desc: "Require upfront full payment or advance deposit at the moment of booking before calendar confirmation.",
        s: "not_included", b: "addon", p: "included",
        price: 3999,
      },
      {
        id: "booking_scheduling_automated_reminders",
        name: "Automated Booking Reminders (Email & WhatsApp)",
        desc: "Automated reminder alerts sent 24 hours and 1 hour before scheduled appointments to eliminate no-shows.",
        s: "addon", b: "addon", p: "included",
        price: 2999,
      },
    ],
  },
  {
    key: "seo_analytics",
    number: 10,
    label: "SEO, Analytics & Performance",
    shortLabel: "SEO & Analytics",
    iconName: "Zap",
    description: "Technical on-page SEO, rich schema markup, Google Analytics 4, Core Web Vitals optimization, and conversion tracking.",
    items: [
      {
        id: "seo_analytics_onpage_technical_seo",
        name: "Technical On-Page SEO & Schema Markup",
        desc: "Semantic HTML5 markup, automated XML sitemaps, robots.txt, canonical links, and JSON-LD structured business data.",
        s: "included", b: "included", p: "included",
        sNote: "Basic metadata in Starter",
        price: 2999,
      },
      {
        id: "seo_analytics_google_analytics_tracking",
        name: "Google Analytics 4 & Conversion Event Tracking",
        desc: "GA4 integration with custom event tracking for button clicks, form submissions, phone call clicks, and ecommerce funnel.",
        s: "addon", b: "included", p: "included",
        price: 2499,
      },
      {
        id: "seo_analytics_core_web_vitals",
        name: "Core Web Vitals & Speed Optimization",
        desc: "Image compression (WebP/AVIF), asset minification, script deferral, font optimization, and sub-second page delivery tuning.",
        s: "limited", b: "included", p: "included",
        sNote: "Standard speed in Starter",
        price: 3999,
      },
      {
        id: "seo_analytics_cookie_consent",
        name: "Privacy-Compliant Cookie Consent Banner",
        desc: "Custom branded cookie consent banner with script blocking until visitor acceptance, compliant with privacy standards.",
        s: "addon", b: "included", p: "included",
        price: 1999,
      },
      {
        id: "seo_analytics_social_opengraph",
        name: "Social Media Share Cards (OpenGraph & Twitter)",
        desc: "Dynamic preview cards with custom brand imagery, engaging titles, and summaries when links are shared on social platforms.",
        s: "included", b: "included", p: "included",
        price: 0,
      },
    ],
  },
  {
    key: "integrations_ai",
    number: 11,
    label: "Third-party Integrations & AI",
    shortLabel: "Integrations & AI",
    iconName: "Bot",
    description: "AI support chatbots, document parsing, CRM integrations (HubSpot/Zoho), Zapier webhooks, and third-party APIs.",
    items: [
      {
        id: "integrations_ai_support_chatbot",
        name: "AI Customer Support Chatbot",
        desc: "Custom AI chatbot trained on your company website knowledge and FAQs (OpenAI / Claude / Gemini) for 24/7 client inquiries.",
        s: "addon", b: "addon", p: "addon",
        price: 6999,
      },
      {
        id: "integrations_ai_ocr_document_parsing",
        name: "AI Document OCR & Automated Data Parsing",
        desc: "Automated scanning and data extraction from client-uploaded invoices, IDs, or receipts into structured database records.",
        s: "not_included", b: "custom_quote", p: "addon",
        price: 8999,
      },
      {
        id: "integrations_ai_crm_connectors",
        name: "CRM & Sales Integration (HubSpot / Salesforce / Zoho)",
        desc: "Bi-directional customer and lead sync directly sending website submissions into your existing sales CRM.",
        s: "not_included", b: "addon", p: "included",
        price: 4999,
      },
      {
        id: "integrations_ai_zapier_webhooks",
        name: "Zapier / Make / Custom Webhook Automation",
        desc: "Event-driven webhook dispatcher sending live website events into 5,000+ third-party tools via Zapier or Make.",
        s: "addon", b: "included", p: "included",
        price: 3499,
      },
      {
        id: "integrations_ai_custom_llm_pipeline",
        name: "Custom AI Workflow & Vector Database (RAG)",
        desc: "Enterprise private AI pipelines with vector embeddings (Pinecone/pgvector) for personalized client recommendations.",
        s: "not_included", b: "custom_quote", p: "custom_quote",
        price: null, isCustomQuote: true,
      },
    ],
  },
  {
    key: "deployment_maintenance",
    number: 12,
    label: "Deployment, Security & Maintenance",
    shortLabel: "Cloud & Support",
    iconName: "Shield",
    description: "Cloud deployment (Vercel/AWS), custom domain & SSL setup, post-launch bug-fix warranty, and monthly developer hours.",
    items: [
      {
        id: "deployment_maintenance_cloud_deployment",
        name: "Production Cloud Deployment & Custom Domain/SSL",
        desc: "High-availability deployment on Vercel / AWS cloud with automated edge CDN, custom domain routing, and free SSL security.",
        s: "included", b: "included", p: "included",
        price: 0,
      },
      {
        id: "deployment_maintenance_bugfix_warranty",
        name: "Included Bug-Fix Warranty",
        desc: "Complimentary post-launch support covering technical bug fixes, layout stability, and browser compatibility.",
        s: "included", b: "included", p: "included",
        sNote: "14 Days Warranty", bNote: "30 Days Warranty", pNote: "60 Days Warranty",
        price: 0,
      },
      {
        id: "deployment_maintenance_uptime_monitoring",
        name: "Website Health & Uptime Monitoring",
        desc: "Automated 24/7 server uptime monitoring and error alert dispatch ensuring your site never goes down unnoticed.",
        s: "addon", b: "addon", p: "included",
        price: 2499,
      },
      {
        id: "deployment_maintenance_security_hardening",
        name: "Security Hardening, Rate Limiting & Firewall",
        desc: "API rate-limiting protection, Cross-Site Scripting (XSS) defenses, Content Security Policy (CSP), and SQL injection shields.",
        s: "limited", b: "included", p: "included",
        sNote: "Standard shields in Starter",
        price: 3999,
      },
      {
        id: "deployment_maintenance_monthly_hours",
        name: "Monthly Dedicated Engineer Support Retainer",
        desc: "Dedicated block of senior engineer hours each month for continuous section updates, feature additions, and optimizations.",
        s: "addon", b: "addon", p: "addon",
        price: 4999,
        billingType: "monthly",
        hasQty: true, unit: "Blocks (5 hrs)", maxQty: 10,
      },
      {
        id: "deployment_maintenance_backup_recovery",
        name: "Automated Database Backups & Disaster Recovery",
        desc: "Automated daily snapshot database backups with point-in-time recovery and off-site cloud storage archives.",
        s: "not_included", b: "addon", p: "included",
        price: 2999,
      },
    ],
  },
];

// Helper to generate slug ID if not explicitly specified
function generateId(catKey, name) {
  const cleanCat = catKey.replace(/_/g, "");
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36);
  return `${cleanCat}_${cleanName}`;
}

const allFeatures = [];
let totalCount = 0;

rawCategories.forEach((cat) => {
  cat.items.forEach((item, idx) => {
    totalCount++;
    const id = item.id || generateId(cat.key, item.name);
    const feature = {
      id,
      name: item.name,
      category: cat.key,
      description: item.desc,
      availability: {
        starter: item.s,
        business: item.b,
        pro: item.p,
      },
      availabilityNotes: {
        starter: item.sNote || (item.s === "included" ? "Included in Starter" : undefined),
        business: item.bNote || (item.b === "included" ? "Included in Business" : undefined),
        pro: item.pNote || (item.p === "included" ? "Included in Pro" : undefined),
      },
      addonPrice: item.price > 0 ? item.price : null,
      billingType: item.billingType || "onetime",
      isCustomQuote: Boolean(
        item.isCustomQuote ||
        item.s === "custom_quote" ||
        item.b === "custom_quote" ||
        item.p === "custom_quote" ||
        item.price === null
      ),
      hasQuantity: Boolean(item.hasQty),
      quantityUnit: item.unit,
      maxQuantity: item.maxQty,
      popularAddon: item.price > 0 && idx < 4,
    };
    allFeatures.push(feature);
  });
});

console.log(`Generated ${allFeatures.length} features across ${rawCategories.length} categories.`);

// Check uniqueness of IDs
const idSet = new Set();
allFeatures.forEach((f) => {
  if (idSet.has(f.id)) {
    console.error(`DUPLICATE ID DETECTED: ${f.id}`);
  }
  idSet.add(f.id);
});

// Category metadata table
const categoriesMeta = rawCategories.map((c) => ({
  key: c.key,
  number: c.number,
  label: c.label,
  shortLabel: c.shortLabel,
  iconName: c.iconName,
  description: c.description,
  featureCount: c.items.length,
}));

// Output TypeScript features file
const tsFeaturesContent = `// Auto-generated master features catalog containing 12 client-focused categories and ${allFeatures.length} production features
import { MatrixFeatureItem } from "./pricing-matrix-data";

export const MASTER_FEATURES: MatrixFeatureItem[] = ${JSON.stringify(allFeatures, null, 2)};
`;

fs.writeFileSync(
  path.join(__dirname, "../src/data/pricing-matrix-features.ts"),
  tsFeaturesContent,
  "utf8"
);
console.log("Successfully wrote src/data/pricing-matrix-features.ts");

module.exports = {
  rawCategories,
  categoriesMeta,
  allFeatures,
};

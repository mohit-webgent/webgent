/**
 * Structured Webgent Knowledge Base
 * Server-side source of truth for:
 * - Project categories and domain blueprints (Gym, E-commerce, SaaS, Booking, HR, etc.)
 * - Standard pages and page purpose definitions
 * - Feature catalog with essential, recommended, and optional classifications
 * - Pricing rules, minimum project prices, and delivery SLAs
 * - Exclusions, recurring third-party charges, and maintenance plans
 * - Explicitly tagged [REQUIRES_OWNER_INPUT] items for unconfigured business details
 */


export interface PageDefinition {
  name: string;
  slug: string;
  purpose: string;
  isEssential: boolean;
  sampleContent: string;
}

export interface DomainBlueprint {
  categoryKey: string;
  displayName: string;
  industry: string;
  description: string;
  recommendedPageCount: number;
  pages: PageDefinition[];
  essentialFeatures: string[];
  recommendedFeatures: string[];
  optionalAddons: string[];
  defaultArchitecture: "static" | "dynamic";
  startingPriceINR: number;
  typicalTimeline: string;
  commonIntegrations: string[];
  businessOwnerInputNeeded?: string[];
}

// -----------------------------------------------------------------------------
// 1. Domain Blueprints (Gym, E-commerce, Booking, HR, SaaS, Corporate, etc.)
// -----------------------------------------------------------------------------

export const DOMAIN_BLUEPRINTS: Record<string, DomainBlueprint> = {
  gym: {
    categoryKey: "gym",
    displayName: "Gym, Fitness Center & Personal Training",
    industry: "Health, Fitness & Wellness",
    description:
      "High-energy, conversion-oriented website designed to convert local searchers into gym members with trial passes, class schedules, and trainer profiles.",
    recommendedPageCount: 5,
    pages: [
      {
        name: "Home",
        slug: "/",
        purpose: "High-impact hero section showcasing gym vibe, free trial pass offer, member transformations, and quick WhatsApp inquiry.",
        isEssential: true,
        sampleContent: "Facility video hero, promotional pass banner, 3-step joining process, customer reviews.",
      },
      {
        name: "About & Facilities",
        slug: "/about",
        purpose: "Establish trust by showcasing gym equipment (cardio, free weights, CrossFit), hygiene standards, and floor space.",
        isEssential: true,
        sampleContent: "Photo gallery of gym floor, locker rooms, steam/sauna, certifications, and safety standards.",
      },
      {
        name: "Programs & Classes",
        slug: "/programs",
        purpose: "Explain workout categories so prospective members can choose their fitness track (Strength, HIIT, Yoga, Zumba, Boxing).",
        isEssential: true,
        sampleContent: "Detailed breakdown of each program, difficulty level, target audience, and trainer in charge.",
      },
      {
        name: "Class Schedule & Timetable",
        slug: "/schedule",
        purpose: "Allow active and prospective members to view daily morning and evening batch timings and reserve class slots.",
        isEssential: false,
        sampleContent: "Interactive weekly schedule filterable by class type, time slot, and trainer.",
      },
      {
        name: "Membership Plans & Pricing",
        slug: "/pricing",
        purpose: "Transparent membership tiers (Monthly, Quarterly, Annual, Day Pass) with clear inclusions and online signup.",
        isEssential: true,
        sampleContent: "Comparison pricing table, benefits checklist, student/corporate discount terms, and refund policy.",
      },
      {
        name: "Trainers & Coaches",
        slug: "/trainers",
        purpose: "Highlight personal trainer expertise, certifications, and client transformation track records.",
        isEssential: false,
        sampleContent: "Trainer photo cards, ACE/K11 certification badges, specialty areas, and book personal consultation CTA.",
      },
      {
        name: "Contact & Location",
        slug: "/contact",
        purpose: "Drive foot traffic with interactive Google Maps, gym timings, parking details, phone, and direct WhatsApp chat.",
        isEssential: true,
        sampleContent: "Working hours, Google Map directions, contact form, WhatsApp click-to-chat button.",
      },
    ],
    essentialFeatures: ["contact_form", "whatsapp_chat", "seo_basic", "customer_reviews"],
    recommendedFeatures: ["booking_calendar", "gallery_showcase", "faq_accordion"],
    optionalAddons: ["payment_gateway", "user_login", "whatsapp_alerts"],
    defaultArchitecture: "static",
    startingPriceINR: 11999,
    typicalTimeline: "5–7 Business Days",
    commonIntegrations: ["Google Maps Embed", "WhatsApp Direct Chat", "Razorpay Payment Gateway (for passes)", "Google Analytics 4"],
  },

  business: {
    categoryKey: "business",
    displayName: "Business, Corporate & Consulting",
    industry: "Professional Services & B2B",
    description:
      "Authority-building corporate digital presence focused on credibility, client case studies, structured service offerings, and inbound lead capture.",
    recommendedPageCount: 5,
    pages: [
      {
        name: "Home",
        slug: "/",
        purpose: "Communicate unique value proposition, client social proof, core service highlights, and primary discovery call CTA.",
        isEssential: true,
        sampleContent: "Value proposition, client logos, core capabilities matrix, case study teaser.",
      },
      {
        name: "About Us",
        slug: "/about",
        purpose: "Narrate company mission, leadership team backgrounds, operating philosophy, and industry milestones.",
        isEssential: true,
        sampleContent: "Company origin story, executive profiles, core values, certifications.",
      },
      {
        name: "Services / Solutions",
        slug: "/services",
        purpose: "Detail each commercial service, deliverables, methodology, and business outcomes achieved for clients.",
        isEssential: true,
        sampleContent: "Categorized service offerings, process flowchart, deliverable checklists, FAQ.",
      },
      {
        name: "Case Studies / Portfolio",
        slug: "/work",
        purpose: "Demonstrate verifiable ROI and project success through structured client problem-solution-impact narratives.",
        isEssential: true,
        sampleContent: "Metrics achieved (+140% conversions), client testimonial, visual project gallery.",
      },
      {
        name: "Contact & Consultation",
        slug: "/contact",
        purpose: "High-conversion consultation booking form with spam protection, direct email alerts, and office details.",
        isEssential: true,
        sampleContent: "Project scoping form, direct email/phone, office map, NDA assurance statement.",
      },
    ],
    essentialFeatures: ["contact_form", "whatsapp_chat", "seo_basic", "customer_reviews"],
    recommendedFeatures: ["faq_accordion", "gallery_showcase", "analytics_tracking"],
    optionalAddons: ["blog", "multilanguage", "admin_dashboard"],
    defaultArchitecture: "static",
    startingPriceINR: 9999,
    typicalTimeline: "5–7 Business Days",
    commonIntegrations: ["Google Analytics 4", "Turnstile Spam Protection", "Resend Automated Email Notifications"],
  },

  ecommerce: {
    categoryKey: "ecommerce",
    displayName: "E-Commerce & Online Store",
    industry: "Retail & Direct-to-Consumer (D2C)",
    description:
      "Fast, high-converting digital storefront with product catalog, shopping cart, UPI/card checkout, automated invoices, and customer orders.",
    recommendedPageCount: 6,
    pages: [
      {
        name: "Storefront Home",
        slug: "/",
        purpose: "Showcase trending products, seasonal sales, category grids, brand story, and trust badges (free shipping/easy returns).",
        isEssential: true,
        sampleContent: "Promotional hero banner, best-seller slider, featured collection, customer reviews.",
      },
      {
        name: "Shop / Product Catalog",
        slug: "/shop",
        purpose: "Browse and filter items by category, price, size, color, and availability with quick-add to cart.",
        isEssential: true,
        sampleContent: "Product grid with badges, price tags, sort dropdown, instant category pills.",
      },
      {
        name: "Product Detail View",
        slug: "/product/[id]",
        purpose: "High-resolution photo gallery, variant selector, detailed specs, size chart, customer ratings, and Buy Now button.",
        isEssential: true,
        sampleContent: "Zoomable images, stock availability status, customer reviews, delivery estimator.",
      },
      {
        name: "Shopping Cart & Checkout",
        slug: "/cart",
        purpose: "Slide-out or dedicated cart drawer showing order subtotal, discount coupons, shipping calculation, and Razorpay payment.",
        isEssential: true,
        sampleContent: "Item counter, promo code field, UPI/Credit Card gateway, address validation.",
      },
      {
        name: "Order Tracking & History",
        slug: "/orders",
        purpose: "Allow customers to view past purchases, order status, courier tracking IDs, and download GST tax invoices.",
        isEssential: false,
        sampleContent: "Order timeline, courier tracking link, download PDF invoice button.",
      },
      {
        name: "Shipping & Return Policy",
        slug: "/policies",
        purpose: "Build buyer confidence by clearly outlining return windows, exchange procedures, and customer support channels.",
        isEssential: true,
        sampleContent: "Step-by-step return guidelines, FAQ, customer care email/WhatsApp.",
      },
    ],
    essentialFeatures: ["ecommerce_cart", "payment_gateway", "whatsapp_alerts", "contact_form", "seo_basic"],
    recommendedFeatures: ["coupon_discounts", "invoice_generation", "inventory_stock"],
    optionalAddons: ["user_login", "admin_dashboard", "customer_reviews"],
    defaultArchitecture: "dynamic",
    startingPriceINR: 19999,
    typicalTimeline: "10–14 Business Days",
    commonIntegrations: ["Razorpay / Stripe Payments", "Shiprocket Shipping", "WhatsApp Order Alerts", "PDF Invoice Engine"],
  },

  booking_platform: {
    categoryKey: "booking_platform",
    displayName: "Online Booking & Appointment Platform",
    industry: "Services, Salons, Medical & Rentals",
    description:
      "Interactive appointment scheduler allowing clients to book specific service slots, staff members, or rental equipment with automated calendar confirmations.",
    recommendedPageCount: 5,
    pages: [
      {
        name: "Home",
        slug: "/",
        purpose: "Highlight key services, instant slot availability widget, customer reviews, and step-by-step booking overview.",
        isEssential: true,
        sampleContent: "Hero with 'Book Appointment' CTA, service highlights, verified reviews, location hours.",
      },
      {
        name: "Services & Rates",
        slug: "/services",
        purpose: "List service offerings with duration (e.g. 45 mins), pricing, practitioner assignment, and direct Book button.",
        isEssential: true,
        sampleContent: "Service category tabs, duration tags, price cards, inclusions/requirements.",
      },
      {
        name: "Interactive Booking Flow",
        slug: "/book",
        purpose: "Step-by-step interactive calendar: Select Service -> Choose Staff Member -> Pick Date & Slot -> Enter Details -> Confirm.",
        isEssential: true,
        sampleContent: "Live date picker, available time pill selector, client detail inputs, advance payment option.",
      },
      {
        name: "Team / Practitioners",
        slug: "/team",
        purpose: "Introduce staff members, their specializations, experience, and individual appointment calendars.",
        isEssential: false,
        sampleContent: "Doctor/stylist bios, certifications, customer ratings, direct booking link.",
      },
      {
        name: "Contact & Directions",
        slug: "/contact",
        purpose: "Detailed parking directions, cancellation terms, clinic/salon timings, and emergency phone lines.",
        isEssential: true,
        sampleContent: "Google Map, transit directions, cancellation policy, instant WhatsApp hotline.",
      },
    ],
    essentialFeatures: ["booking_calendar", "whatsapp_chat", "contact_form", "seo_basic"],
    recommendedFeatures: ["whatsapp_alerts", "email_notifications", "faq_accordion"],
    optionalAddons: ["payment_gateway", "user_login", "admin_dashboard"],
    defaultArchitecture: "dynamic",
    startingPriceINR: 16999,
    typicalTimeline: "7–10 Business Days",
    commonIntegrations: ["Google Calendar Sync", "Twilio / Meta WhatsApp Alerts", "Razorpay Booking Deposit"],
  },

  employee_management: {
    categoryKey: "employee_management",
    displayName: "Employee Management & Internal Operations Portal",
    industry: "Internal Enterprise Tooling & HR",
    description:
      "Secure role-based internal web portal for staff directory, daily attendance, leave approvals, task assignments, and document management.",
    recommendedPageCount: 6,
    pages: [
      {
        name: "Login & Secure Authentication",
        slug: "/login",
        purpose: "Role-based authentication (Admin vs. HR vs. Employee) with session management and password recovery.",
        isEssential: true,
        sampleContent: "Email/password login, Google SSO, password reset request flow.",
      },
      {
        name: "Executive Dashboard",
        slug: "/dashboard",
        purpose: "Central hub displaying headcount metrics, today's attendance summary, pending leave requests, and company announcements.",
        isEssential: true,
        sampleContent: "Metric cards (Total Staff, On Leave, Present), quick action buttons, recent activity feed.",
      },
      {
        name: "Employee Directory",
        slug: "/employees",
        purpose: "Searchable database of all staff members, department filters, contact information, designation, and employment status.",
        isEssential: true,
        sampleContent: "Employee table, department dropdown filter, export to CSV button, Add Employee modal.",
      },
      {
        name: "Attendance & Leave Tracking",
        slug: "/attendance",
        purpose: "Daily check-in/out records, leave request submission, manager approval workflow, and monthly balance tracking.",
        isEssential: true,
        sampleContent: "Monthly calendar view, Leave balance chips (Sick, Casual, Paid), pending approval cards.",
      },
      {
        name: "Documents & Company Policies",
        slug: "/documents",
        purpose: "Centralized repository for offer letters, HR guidelines, salary slips, and compliance certificates.",
        isEssential: false,
        sampleContent: "Categorized document list, secure PDF upload/download, view permissions by role.",
      },
      {
        name: "Settings & Access Control",
        slug: "/settings",
        purpose: "Configure department names, user roles & permissions (RBAC), and company profile information.",
        isEssential: true,
        sampleContent: "Role permission toggles, department creator, audit log view.",
      },
    ],
    essentialFeatures: ["user_login", "admin_dashboard", "email_notifications"],
    recommendedFeatures: ["faq_accordion", "invoice_generation"],
    optionalAddons: ["whatsapp_alerts", "pwa_offline"],
    defaultArchitecture: "dynamic",
    startingPriceINR: 29999,
    typicalTimeline: "2–3 Weeks",
    commonIntegrations: ["PostgreSQL Database", "NextAuth RBAC Authentication", "Resend Transactional Emails"],
  },

  restaurant: {
    categoryKey: "restaurant",
    displayName: "Restaurant, Cafe & Dining Lounge",
    industry: "Hospitality, Food & Beverage",
    description:
      "Mouth-watering visual menu showcase, online table reservation, Google Map directions, and direct catering inquiries.",
    recommendedPageCount: 4,
    pages: [
      {
        name: "Home",
        slug: "/",
        purpose: "Atmosphere video/photo hero, chef specials, online table reservation button, and awards/press highlights.",
        isEssential: true,
        sampleContent: "Hero slider, chef recommendation grid, opening hours banner, Google Maps snippet.",
      },
      {
        name: "Digital Food & Bar Menu",
        slug: "/menu",
        purpose: "Categorized interactive menu (Appetizers, Mains, Desserts, Cocktails) with dietary tags (Veg, Vegan, Gluten-Free) and prices.",
        isEssential: true,
        sampleContent: "Tabbed food categories, dish photos, ingredients, spice meter, downloadable PDF menu.",
      },
      {
        name: "Table Reservations & Events",
        slug: "/reservations",
        purpose: "Interactive table booking form for dates, time slots, guest counts, and special private dining requests.",
        isEssential: true,
        sampleContent: "Guest count selector, date/time picker, dietary preferences box, instant confirmation alert.",
      },
      {
        name: "Location, Hours & Contact",
        slug: "/contact",
        purpose: "Help diners locate the venue with Google Maps, valet parking info, dress code guidelines, and direct phone/WhatsApp.",
        isEssential: true,
        sampleContent: "Interactive map, phone click-to-call, WhatsApp table booking, parking guidelines.",
      },
    ],
    essentialFeatures: ["contact_form", "whatsapp_chat", "gallery_showcase", "seo_basic"],
    recommendedFeatures: ["booking_calendar", "customer_reviews", "faq_accordion"],
    optionalAddons: ["payment_gateway", "newsletter_subscribe"],
    defaultArchitecture: "static",
    startingPriceINR: 9999,
    typicalTimeline: "5–7 Business Days",
    commonIntegrations: ["Google Maps Embed", "WhatsApp Quick Reservation", "Instagram Feed Embed"],
  },

  portfolio: {
    categoryKey: "portfolio",
    displayName: "Portfolio, Creative & Personal Brand",
    industry: "Creators, Freelancers & Executives",
    description:
      "Sleek, high-polish showcase highlighting featured case studies, skill proficiencies, testimonials, and direct hire inquiries.",
    recommendedPageCount: 3,
    pages: [
      {
        name: "Home & Intro",
        slug: "/",
        purpose: "Hero introducing specialty, notable clients/employers, featured works grid, and 'Hire Me' direct CTA.",
        isEssential: true,
        sampleContent: "Bio summary, client logos, 3 featured project cards, skill badges, resume download.",
      },
      {
        name: "Works & Case Studies",
        slug: "/work",
        purpose: "Deep-dive case studies explaining the problem, design/engineering process, metrics achieved, and live project link.",
        isEssential: true,
        sampleContent: "Project screenshots, tech stack tags, outcome stats (+200% speed), client testimonial.",
      },
      {
        name: "Contact & Collaboration",
        slug: "/contact",
        purpose: "Inquiry form for project proposals, speaking engagements, and direct social/email links.",
        isEssential: true,
        sampleContent: "Project scoping form, Calendly discovery call embed, GitHub/LinkedIn links.",
      },
    ],
    essentialFeatures: ["gallery_showcase", "contact_form", "whatsapp_chat"],
    recommendedFeatures: ["customer_reviews", "dark_mode", "animations_smooth"],
    optionalAddons: ["blog", "pdf_download"],
    defaultArchitecture: "static",
    startingPriceINR: 6999,
    typicalTimeline: "3–5 Business Days",
    commonIntegrations: ["GitHub / Dribbble Links", "Calendly Call Booking", "Resend Notification Alert"],
  },

  saas: {
    categoryKey: "saas",
    displayName: "SaaS Product & Custom Web App",
    industry: "Software, Startups & Cloud Platforms",
    description:
      "Production-grade software platform with secure authentication, multi-tenant databases, subscription billing, and user dashboards.",
    recommendedPageCount: 8,
    pages: [
      {
        name: "Marketing Landing Page",
        slug: "/",
        purpose: "Product feature showcase, animated interactive demos, customer logos, and free trial signup buttons.",
        isEssential: true,
        sampleContent: "Hero with product screenshot, interactive feature tabs, ROI calculator, FAQ.",
      },
      {
        name: "Pricing & Tier Comparison",
        slug: "/pricing",
        purpose: "Monthly vs. Annual billing toggle, feature comparison matrix, enterprise tier inquiry, and Stripe checkout.",
        isEssential: true,
        sampleContent: "Tier cards (Starter, Pro, Enterprise), feature checkmarks, FAQ, checkout button.",
      },
      {
        name: "Authentication (Login/Signup)",
        slug: "/auth",
        purpose: "Secure email/password or OAuth (Google/GitHub) authentication with session tokens and email verification.",
        isEssential: true,
        sampleContent: "1-Click Google sign-in, magic links, terms consent, password reset flow.",
      },
      {
        name: "Customer Web App Dashboard",
        slug: "/app",
        purpose: "Core product workflow where logged-in users interact with the tool, manage data, and view reports.",
        isEssential: true,
        sampleContent: "Navigation sidebar, data visualization charts, record tables, action modals.",
      },
      {
        name: "Account & Billing Settings",
        slug: "/app/settings",
        purpose: "Manage organization profile, upgrade/cancel subscription plans, view past invoices, and invite team members.",
        isEssential: true,
        sampleContent: "Subscription management portal, team invites, invoice history download.",
      },
      {
        name: "Documentation & API",
        slug: "/docs",
        purpose: "Help center, developer documentation, and tutorials to accelerate customer onboarding.",
        isEssential: false,
        sampleContent: "Searchable documentation sidebar, code snippets, step-by-step guides.",
      },
      {
        name: "Blog / Product Updates",
        slug: "/blog",
        purpose: "Changelog and educational content to drive organic technical SEO traffic.",
        isEssential: false,
        sampleContent: "Product release notes, technical case studies, category tags.",
      },
      {
        name: "Legal (Privacy & Terms)",
        slug: "/legal",
        purpose: "GDPR/compliance privacy policy and terms of service for SaaS operations.",
        isEssential: true,
        sampleContent: "Standard SaaS privacy agreement, data handling terms, sub-processors list.",
      },
    ],
    essentialFeatures: ["user_login", "admin_dashboard", "payment_gateway", "email_notifications"],
    recommendedFeatures: ["dark_mode", "analytics_tracking", "faq_accordion"],
    optionalAddons: ["whatsapp_alerts", "pwa_offline", "ai_chatbot"],
    defaultArchitecture: "dynamic",
    startingPriceINR: 34999,
    typicalTimeline: "3–4 Weeks",
    commonIntegrations: ["Stripe / Razorpay Billing", "PostgreSQL / Prisma", "AWS / Cloudflare R2", "Resend Transactional Mail"],
  },
};

// -----------------------------------------------------------------------------
// 2. Standard Tech Stack & Engineering Standards
// -----------------------------------------------------------------------------

export const WEBGENT_TECH_STACK = {
  frontend: "Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons",
  backend: "Node.js, Next.js Server Actions & API Routes, Edge Runtime support",
  database: "PostgreSQL, Prisma ORM (Type-safe schema with automated migrations)",
  authentication: "NextAuth / Auth.js (JWT sessions, OAuth Google/GitHub, RBAC roles)",
  security: "Cloudflare Turnstile bot challenge, strict rate limiting, CSP headers, sanitized inputs",
  hosting: "Vercel Edge Network / Cloudflare CDN, AWS S3 / Cloudflare R2 for assets",
  communications: "Resend (Email), Twilio / Meta Cloud API (WhatsApp & SMS)",
  payments: "Razorpay (India UPI, Cards, Netbanking) & Stripe (Global Multi-currency)",
};

// -----------------------------------------------------------------------------
// 3. Maintenance Plans & Recurring Service Tiers
// -----------------------------------------------------------------------------

export interface MaintenancePlan {
  id: string;
  name: string;
  priceMonthlyINR: number;
  description: string;
  includedHours: number;
  slaHours: string;
  features: string[];
}

export const MAINTENANCE_PLANS: Record<string, MaintenancePlan> = {
  none: {
    id: "none",
    name: "Standard 15-Day Post-Launch Warranty (Included Free)",
    priceMonthlyINR: 0,
    description: "Every Webgent project includes 15 days of free bug-fix warranty and handover assistance.",
    includedHours: 0,
    slaHours: "48 Hours",
    features: [
      "15 days of functional bug fixes included at zero extra cost",
      "Full source code handover to your private Git repository",
      "DNS connection and live deployment setup included",
    ],
  },
  basic: {
    id: "basic",
    name: "Monthly Care — Basic",
    priceMonthlyINR: 2000,
    description: "Weekly dependency updates, security vulnerability patches, uptime monitoring, and basic content edits.",
    includedHours: 2,
    slaHours: "24 Hours",
    features: [
      "Weekly Next.js & npm package security updates",
      "Automated 24/7 uptime monitoring & crash alerts",
      "Up to 2 hours of monthly content updates or visual adjustments",
      "Database backup integrity verification",
    ],
  },
  standard: {
    id: "standard",
    name: "Monthly Care — Standard (Most Popular)",
    priceMonthlyINR: 5000,
    description: "Active server health monitoring, database backup checks, security updates, and dedicated engineering hours.",
    includedHours: 5,
    slaHours: "12 Hours",
    features: [
      "Priority resolution for code regressions and third-party API changes",
      "Up to 5 hours of dedicated full-stack development time each month",
      "Monthly performance and Google Core Web Vitals audit",
      "Direct developer WhatsApp communication channel",
    ],
  },
  advanced: {
    id: "advanced",
    name: "Engineering Retainer — Advanced",
    priceMonthlyINR: 10000,
    description: "Priority enterprise SLA, continuous speed tuning, automated backups, and 12 hours dedicated sprint allocation.",
    includedHours: 12,
    slaHours: "4 Hours (Business Days)",
    features: [
      "Up to 12 hours of dedicated senior engineering sprints per month",
      "Priority 4-hour critical issue response SLA",
      "Feature enhancements, database indexing & ongoing conversion optimization",
      "Dedicated staging environment maintenance",
    ],
  },
};

// -----------------------------------------------------------------------------
// 4. Missing Configuration Items Requiring Business Owner Input
// -----------------------------------------------------------------------------

export const UNCONFIGURED_BUSINESS_ITEMS = [
  {
    key: "enterprise_custom_erp_integrations",
    label: "Enterprise SAP / Oracle / Custom ERP Sync",
    status: "[REQUIRES_OWNER_INPUT]",
    note: "Custom enterprise legacy data sync requires technical discovery to assess API availability and payload volumes before quoting.",
  },
  {
    key: "native_mobile_app_wrappers",
    label: "Native iOS / Android App Store Submission (Capacitor / React Native)",
    status: "[REQUIRES_OWNER_INPUT]",
    note: "Apple Developer ($99/yr) and Google Play ($25) accounts must be registered by the client; native wrapper compilation is quoted after reviewing native hardware requirements (camera, bluetooth, push tokens).",
  },
  {
    key: "custom_ai_fine_tuning",
    label: "Proprietary AI Model Fine-Tuning & Custom RAG Ingestion",
    status: "[REQUIRES_OWNER_INPUT]",
    note: "Requires document dataset audit and token volume calculation before fixed quote can be finalized.",
  },
];

export const MISSING_BUSINESS_CONFIG = UNCONFIGURED_BUSINESS_ITEMS;

export function getDomainBlueprint(categoryKey: string): DomainBlueprint {
  return DOMAIN_BLUEPRINTS[categoryKey] || DOMAIN_BLUEPRINTS.business;
}

export function detectCategoryFromText(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("workout")) return "gym";
  if (lower.includes("restaurant") || lower.includes("cafe") || lower.includes("dining") || lower.includes("food")) return "restaurant";
  if (lower.includes("ecom") || lower.includes("store") || lower.includes("shop") || lower.includes("cart")) return "ecommerce";
  if (lower.includes("employee") || lower.includes("staff") || lower.includes("hr") || lower.includes("portal")) return "employee_management";
  if (lower.includes("book") || lower.includes("appointment") || lower.includes("salon")) return "booking_platform";
  if (lower.includes("portfolio") || lower.includes("resume") || lower.includes("personal brand")) return "portfolio";
  if (lower.includes("saas") || lower.includes("mvp") || lower.includes("software")) return "saas";
  return "business";
}

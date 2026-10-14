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

export interface FeatureOption {
  id: string;
  name: string;
  simpleDescription: string;
  price: number;
  icon: string;
  categoryTag: string;
  popularFor?: string[];
  includedInDynamic?: boolean;
}

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
    defaultFeatures: ["appointment_booking", "whatsapp_chat", "contact_form", "seo_basic"],
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
    defaultFeatures: ["user_auth", "admin_panel", "payment_gateway", "email_notifications"],
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
    defaultFeatures: ["contact_form", "whatsapp_chat", "seo_basic", "appointment_booking"],
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
    subtitle: "With Admin Panel & Database Included",
    additionalCost: 8000,
    description:
      "Update text, photos, services, and blogs yourself from an easy Admin Dashboard. Includes database integration to save customer inquiries and data.",
    bestFor: "Best for: Stores, Clinics, Blogs, SaaS, or frequently updated businesses",
  },
];

export const POPULAR_FEATURES: FeatureOption[] = [
  {
    id: "contact_form",
    name: "Interactive Lead & Inquiry Form",
    simpleDescription: "Custom inquiry form with validation, spam protection (reCAPTCHA/Turnstile), and instant email alerts.",
    price: 1000,
    icon: "Mail",
    categoryTag: "Communication",
    popularFor: ["business", "healthcare", "realestate", "portfolio", "restaurant", "education", "custom"],
  },
  {
    id: "payment_gateway",
    name: "Online Payment Gateway",
    simpleDescription: "Accept direct payments via UPI, Google Pay, PhonePe, Debit/Credit Cards & Netbanking (Razorpay/Stripe).",
    price: 4500,
    icon: "CreditCard",
    categoryTag: "Payments",
    popularFor: ["ecommerce", "saas", "education"],
  },
  {
    id: "whatsapp_chat",
    name: "WhatsApp Quick Chat Button",
    simpleDescription: "Direct click-to-chat button linking directly to your WhatsApp with a prefilled inquiry message.",
    price: 500,
    icon: "MessageCircle",
    categoryTag: "Communication",
    popularFor: ["business", "healthcare", "restaurant", "realestate", "portfolio"],
  },
  {
    id: "whatsapp_alerts",
    name: "Automated WhatsApp Alerts",
    simpleDescription: "Automatic instant WhatsApp notification sent to your team and customer on new order or lead submission.",
    price: 3500,
    icon: "Send",
    categoryTag: "Communication",
    popularFor: ["ecommerce", "healthcare", "realestate"],
  },
  {
    id: "appointment_booking",
    name: "Online Booking / Appointment Calendar",
    simpleDescription: "Interactive calendar allowing visitors to schedule appointments, consultations, or bookings directly.",
    price: 4000,
    icon: "Calendar",
    categoryTag: "Functionality",
    popularFor: ["healthcare", "education", "restaurant"],
  },
  {
    id: "ecommerce_cart",
    name: "Product Catalog & Shopping Cart",
    simpleDescription: "Product grid showcase, image zoom, slide-out shopping cart drawer, and live subtotal calculator.",
    price: 6000,
    icon: "ShoppingBag",
    categoryTag: "E-Commerce",
    popularFor: ["ecommerce"],
  },
  {
    id: "user_auth",
    name: "User Login & Registration",
    simpleDescription: "Secure user account creation with Email/Password or 1-Click Sign in with Google.",
    price: 3500,
    icon: "Lock",
    categoryTag: "Security",
    popularFor: ["saas", "ecommerce", "education"],
  },
  {
    id: "admin_panel",
    name: "Custom Admin Dashboard",
    simpleDescription: "Private administrative panel to manage incoming inquiries, update content, and export customer data.",
    price: 5000,
    icon: "LayoutDashboard",
    categoryTag: "Management",
    includedInDynamic: true,
    popularFor: ["saas", "business", "realestate"],
  },
  {
    id: "blog_cms",
    name: "Blog / Articles Section",
    simpleDescription: "Editorial article publication system with tags and search to significantly boost Google SEO ranking.",
    price: 3500,
    icon: "BookOpen",
    categoryTag: "Content",
    popularFor: ["business", "healthcare", "saas"],
  },
  {
    id: "gallery_showcase",
    name: "Photo / Project Showcase Gallery",
    simpleDescription: "High-resolution photo lightbox gallery or interactive case study grid with smooth transitions.",
    price: 1500,
    icon: "Image",
    categoryTag: "Design",
    popularFor: ["portfolio", "realestate", "restaurant"],
  },
  {
    id: "email_notifications",
    name: "Automatic Email Notifications",
    simpleDescription: "Instant automated confirmation email to the client and notification alerts dispatched to your team.",
    price: 1500,
    icon: "Mail",
    categoryTag: "Automation",
    popularFor: ["business", "saas", "education"],
  },
  {
    id: "seo_basic",
    name: "Complete On-Page Google SEO Setup",
    simpleDescription: "Google Search Console verification, XML sitemap, robots.txt, and semantic meta tags setup.",
    price: 2500,
    icon: "Search",
    categoryTag: "Growth",
    popularFor: ["business", "healthcare", "realestate", "ecommerce"],
  },
  {
    id: "speed_optimization",
    name: "Ultra-Fast Speed Optimization (95+ Score)",
    simpleDescription: "WebP asset compression, critical CSS, and instant page rendering passing Google Core Web Vitals.",
    price: 2500,
    icon: "Zap",
    categoryTag: "Performance",
  },
  {
    id: "animations_smooth",
    name: "Studio-Grade Smooth Animations (GSAP)",
    simpleDescription: "Curated kinetic micro-interactions, scroll-triggered reveals, and modern visual polish.",
    price: 3000,
    icon: "Sparkles",
    categoryTag: "Design",
  },
  {
    id: "multilanguage",
    name: "Multi-Language Support (e.g. English + Hindi)",
    simpleDescription: "Header language selector with localized translations allowing visitors to toggle languages.",
    price: 3500,
    icon: "Globe",
    categoryTag: "Content",
  },
  {
    id: "ai_chatbot",
    name: "AI Customer Support Chatbot",
    simpleDescription: "Custom GPT-powered conversational assistant trained on your business information to answer client queries 24/7.",
    price: 7500,
    icon: "Bot",
    categoryTag: "AI Integration",
  },
];

export const BASE_PAGES_INCLUDED = 5;
export const COST_PER_EXTRA_PAGE = 1000;
export const DISCOUNT_FOR_ONE_PAGE = 2000;

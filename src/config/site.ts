import { WHATSAPP_CONFIG, buildWhatsAppUrl } from "./whatsapp";

export const PRODUCTION_URL = "https://www.webgent.online";

/** The live deployment must never advertise a local or preview address to search engines or in emails. */
export function resolveSiteUrl() {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "");
  const isLiveDeployment = (process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV) === "production";
  if (!configured || (isLiveDeployment && /localhost|127\.0\.0\.1|\.vercel\.app/.test(configured))) return PRODUCTION_URL;
  return configured;
}

export const siteConfig = {
  name: "Webgent",
  tagline: "Next-Gen Web Solutions & Engineering",
  description:
    "Webgent builds high-performance web applications, scalable cloud software, and digital platforms for ambitious modern brands.",
  url: resolveSiteUrl(),
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Services", href: "/services" },
    { title: "Work", href: "/work" },
    { title: "About", href: "/about" },
    { title: "Blog", href: "/blog" },
    { title: "Pricing", href: "/pricing" },
    { title: "Contact", href: "/contact" },
  ],
  links: {
    github: "https://github.com/mohitvermag",
    linkedin: "https://linkedin.com/in/webmohitverma",
    testimonials: "/testimonials",
    whatsapp: `https://wa.me/${WHATSAPP_CONFIG.number}`,
    whatsappChat: buildWhatsAppUrl(),
  },
  whatsapp: WHATSAPP_CONFIG,
};


import { WHATSAPP_CONFIG, buildWhatsAppUrl } from "./whatsapp";

export const siteConfig = {
  name: "Webgent",
  tagline: "Next-Gen Web Solutions & Engineering",
  description:
    "Webgent builds high-performance web applications, scalable cloud software, and digital platforms for ambitious modern brands.",
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://webgent.vercel.app",
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
    github: "https://github.com/mohit-webgent/webgent",
    twitter: "https://twitter.com/webgent",
    linkedin: "https://www.linkedin.com",
    testimonials: "/testimonials",
    whatsapp: `https://wa.me/${WHATSAPP_CONFIG.number}`,
    whatsappChat: buildWhatsAppUrl(),
  },
  whatsapp: WHATSAPP_CONFIG,
};


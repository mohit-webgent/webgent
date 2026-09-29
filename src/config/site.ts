export const siteConfig = {
  name: "Webgent",
  tagline: "Next-Gen Web Solutions & Engineering",
  description:
    "Webgent builds high-performance web applications, scalable cloud software, and digital platforms for ambitious modern brands.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Work", href: "/work" },
    { title: "Blog", href: "/blog" },
    { title: "Testimonials", href: "/testimonials" },
    { title: "Contact", href: "/contact" },
  ],
  links: {
    github: "https://github.com/mohit-webgent/webgent",
    twitter: "https://twitter.com/webgent",
    linkedin: "https://linkedin.com/company/webgent",
  },
};

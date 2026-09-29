export const siteConfig = {
  name: "Webgent",
  description: "Enterprise Production Platform Architecture",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Portfolio", href: "/work" },
    { title: "Blog", href: "/blog" },
    { title: "Admin Portfolio", href: "/admin/projects" },
    { title: "Admin Blog", href: "/admin/blog" },
    { title: "System Status", href: "/api/health" },
  ],
  links: {
    docs: "#",
    github: "#",
  },
};

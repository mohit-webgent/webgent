export const siteConfig = {
  name: "Webgent",
  description: "Enterprise Production Platform Architecture",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  mainNav: [
    { title: "Home", href: "/" },
    { title: "System Status", href: "/api/health" },
  ],
  links: {
    docs: "#",
    github: "#",
  },
};

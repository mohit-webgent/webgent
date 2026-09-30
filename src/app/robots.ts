import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin/*",
          "/api/admin/",
          "/api/admin/*",
          "/api/auth/",
          "/api/auth/*",
          "/contact/thank-you",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

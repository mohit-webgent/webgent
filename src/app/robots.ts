import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getSiteSeoSettings } from "@/lib/services/cms";

// Uses the same origin as the sitemap and canonical tags, so search engines see one consistent address.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSiteSeoSettings();
  const baseUrl = (seo.global.canonicalBaseUrl || siteConfig.url).replace(/\/+$/, "");

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

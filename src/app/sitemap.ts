import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/config/site";
import { getSiteSeoSettings } from "@/lib/services/cms";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSiteSeoSettings();
  const baseUrl = (seo.global.canonicalBaseUrl || siteConfig.url).replace(/\/+$/, "");

  const staticRouteDefinitions = [
    { route: "/", priority: 1.0, changeFrequency: "daily" as const },
    { route: "/services", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/work", priority: 0.9, changeFrequency: "daily" as const },
    { route: "/about", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/blog", priority: 0.9, changeFrequency: "daily" as const },
    { route: "/pricing", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/testimonials", priority: 0.7, changeFrequency: "weekly" as const },
    { route: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
  ];

  // Omit routes explicitly flagged with noIndex and apply canonical overrides
  const staticRoutes: MetadataRoute.Sitemap = staticRouteDefinitions
    .filter((r) => !seo.pages[r.route]?.noIndex)
    .map((r) => {
      const override = seo.pages[r.route];
      let routeUrl: string;
      if (override?.canonicalUrl?.trim()) {
        const c = override.canonicalUrl.trim();
        if (c === "/" || c === `${baseUrl}/` || c === `${baseUrl}`) {
          routeUrl = `${baseUrl}/`;
        } else {
          const cleanPath = c.replace(/\/+$/, "");
          routeUrl = cleanPath.startsWith("http")
            ? cleanPath
            : `${baseUrl}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
        }
      } else {
        routeUrl = `${baseUrl}${r.route === "/" ? "/" : r.route}`;
      }

      return {
        url: routeUrl,
        lastModified: new Date(),
        changeFrequency: r.changeFrequency,
        priority: r.priority,
      };
    });

  let dynamicProjectRoutes: MetadataRoute.Sitemap = [];
  let dynamicBlogRoutes: MetadataRoute.Sitemap = [];
  let dynamicServiceRoutes: MetadataRoute.Sitemap = [];

  try {
    const [publishedProjects, publishedPosts, publishedServices] = await Promise.all([
      prisma.project.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
      prisma.service.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    dynamicProjectRoutes = publishedProjects.map((project) => ({
      url: `${baseUrl}/work/${project.slug}`,
      lastModified: project.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    dynamicBlogRoutes = publishedPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    dynamicServiceRoutes = publishedServices.map((service) => ({
      url: `${baseUrl}/services/${service.slug}`,
      lastModified: service.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Database connection unavailable while generating sitemap:", error);
  }

  return [...staticRoutes, ...dynamicServiceRoutes, ...dynamicProjectRoutes, ...dynamicBlogRoutes];
}

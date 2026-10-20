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
    { route: "/work", priority: 0.9, changeFrequency: "daily" as const },
    { route: "/about", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/blog", priority: 0.9, changeFrequency: "daily" as const },
    { route: "/pricing", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/testimonials", priority: 0.7, changeFrequency: "weekly" as const },
    { route: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
  ];

  // Omit routes explicitly flagged with noIndex
  const staticRoutes: MetadataRoute.Sitemap = staticRouteDefinitions
    .filter((r) => !seo.pages[r.route]?.noIndex)
    .map((r) => ({
      url: `${baseUrl}${r.route === "/" ? "/" : r.route}`,
      lastModified: new Date(),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    }));

  let dynamicProjectRoutes: MetadataRoute.Sitemap = [];
  let dynamicBlogRoutes: MetadataRoute.Sitemap = [];

  try {
    const [publishedProjects, publishedPosts] = await Promise.all([
      prisma.project.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        select: { slug: true, updatedAt: true, publishedAt: true },
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
  } catch (error) {
    console.error("Database connection unavailable while generating sitemap:", error);
  }

  return [...staticRoutes, ...dynamicProjectRoutes, ...dynamicBlogRoutes];
}

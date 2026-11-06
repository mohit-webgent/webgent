import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BlogExplorer } from "@/components/blog/blog-explorer";
import { CtaBand } from "@/components/ui/cta-band";
import { PageHero } from "@/components/ui/page-hero";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

import { resolveRouteMetadata } from "@/lib/services/cms";

export const revalidate = 60;

const defaultBlogMetadata: Metadata = {
  title: "Blog & Insights",
  description:
    "Explore engineering insights, product design case studies, and modern web architecture articles.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog & Insights | Webgent",
    description:
      "Explore engineering insights, product design case studies, and modern web architecture articles.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/api/og?title=Blog+%26+Insights&badge=Engineering`,
        width: 1200,
        height: 630,
        alt: "Blog & Insights | Webgent",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Insights | Webgent",
    description:
      "Explore engineering insights, product design case studies, and modern web architecture articles.",
    images: [`${siteConfig.url}/api/og?title=Blog+%26+Insights&badge=Engineering`],
    creator: "@webgent",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return resolveRouteMetadata("/blog", defaultBlogMetadata);
}

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  authorName: string;
  dateStr: string;
  tags: string[];
  coverImage: string | null;
}

export default async function BlogPage() {
  let dbPosts: BlogPostItem[] = [];

  const cacheKey = "cache:blog:published_posts_v2";
  const cachedPosts = await cacheGet<BlogPostItem[]>(cacheKey);

  if (cachedPosts) {
    dbPosts = cachedPosts;
  } else {
    try {
      const posts = await prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        include: {
          author: { select: { name: true } },
        },
      });

      dbPosts = posts.map((p) => {
        const tagList = p.tags
          ? p.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [p.category || "Engineering"];

        const dateStr = p.publishedAt
          ? new Date(p.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Recent";

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt || p.content.slice(0, 160) + "...",
          authorName: p.author?.name || "Webgent",
          dateStr,
          tags: tagList.slice(0, 3),
          coverImage: p.coverImage || p.ogImage || null,
        };
      });

      if (dbPosts.length > 0) {
        await cacheSet(cacheKey, dbPosts, 60);
      }
    } catch (error) {
      console.error("Failed to load blog posts from DB:", error);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes on building for the web."
        description="Practical writing on web development, performance and running a website that works."
      />

      {dbPosts.length === 0 ? (
        <section className="wrap pb-[var(--section-space)]">
          <div className="card mx-auto max-w-2xl p-8 text-center">
            <h2 className="display-md">Articles are on the way</h2>
            <p className="mt-2 text-sm text-fg-muted">In the meantime, take a look at recent projects.</p>
            <Link href="/work" className="btn btn-secondary btn-sm mt-5">
              <span>View work</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      ) : (
        <BlogExplorer
          posts={dbPosts.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            category: post.tags[0] || null,
            meta: post.dateStr,
            imageUrl: post.coverImage,
          }))}
        />
      )}

      <CtaBand
        title="Need help with your website?"
        description="Whether it's a new build or fixing an existing site, tell me what you're working on."
        primaryLabel="Get in touch"
        secondaryLabel="See pricing"
        secondaryHref="/pricing"
        analyticsName="Blog"
      />
    </>
  );
}

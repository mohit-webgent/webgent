import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const revalidate = 60;

export const metadata: Metadata = {
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

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  authorName: string;
  dateStr: string;
  tags: string[];
  coverImage: string;
}

export default async function BlogPage() {
  let dbPosts: BlogPostItem[] = [];

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
        authorName: p.author?.name || "Webgent Team",
        dateStr,
        tags: tagList.slice(0, 3),
        coverImage:
          p.coverImage ||
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
      };
    });
  } catch (error) {
    console.error("Failed to load blog posts from DB:", error);
  }

  const featuredPost = dbPosts[0];
  const sidePosts = dbPosts.slice(1, 4);
  const remainingPosts = dbPosts.slice(4);

  return (
    <div className="min-h-screen bg-[#080808] text-[#E0E0DE] pt-10 pb-24 sm:pt-14 sm:pb-32 px-5 sm:px-8 lg:px-14 2xl:px-24 font-sans">
      <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto space-y-10 sm:space-y-12">
        {/* Top Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F3] tracking-tight">
            Recent blog posts
          </h1>
          <p className="mt-2 text-sm text-[#8E8E93]">
            Insights on web development, modern frontend performance, and scalable web solutions.
          </p>
        </div>

        {dbPosts.length === 0 ? (
          <div className="py-20 text-center border border-white/[0.08] rounded-2xl bg-[#0c0c0c]/60 max-w-2xl mx-auto px-6">
            <h2 className="text-xl font-semibold text-[#F5F5F3] mb-2">No publications yet</h2>
            <p className="text-sm text-[#8E8E93] leading-relaxed">
              Technical articles, engineering deep-dives, and product case studies will be published here soon.
            </p>
            <div className="mt-6">
              <Link
                href="/work"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white transition-colors"
              >
                View Case Studies <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Large Featured Card */}
            <div className={sidePosts.length > 0 ? "lg:col-span-6" : "lg:col-span-8 lg:col-start-3"}>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group flex flex-col h-full space-y-4 focus:outline-none"
              >
                {/* Featured Image */}
                <div className="w-full aspect-[16/11] bg-[#121212] rounded-xl overflow-hidden border border-white/[0.08] relative">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                </div>

                {/* Featured Content */}
                <div className="space-y-3 pt-1 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="text-xs font-medium text-[#9E9E9E] tracking-normal">
                      {featuredPost.authorName} • {featuredPost.dateStr}
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl sm:text-2xl font-semibold text-[#F5F5F3] group-hover:text-white transition-colors leading-snug">
                        {featuredPost.title}
                      </h2>
                      <ArrowUpRight className="w-5 h-5 text-[#888888] group-hover:text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-1" />
                    </div>

                    <p className="text-sm text-[#8E8E93] line-clamp-2 sm:line-clamp-3 leading-relaxed font-normal">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {featuredPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-[#141414] border border-white/[0.12] text-[#B0B0B0] hover:text-white transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>

            {/* Right Column (Stacked Horizontal Cards) if any */}
            {sidePosts.length > 0 && (
              <div className="lg:col-span-6 flex flex-col justify-between gap-8 lg:gap-6">
                {sidePosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col sm:flex-row gap-5 items-start focus:outline-none"
                  >
                    {/* Horizontal Thumbnail */}
                    <div className="w-full sm:w-56 md:w-60 shrink-0 aspect-[16/10] sm:aspect-[4/3] bg-[#121212] rounded-xl overflow-hidden border border-white/[0.08] relative">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    </div>

                    {/* Horizontal Content */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#9E9E9E] tracking-normal">
                        {post.authorName} • {post.dateStr}
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-[#F5F5F3] group-hover:text-white transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#8E8E93] line-clamp-2 leading-relaxed font-normal">
                        {post.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1.5">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#141414] border border-white/[0.12] text-[#B0B0B0] hover:text-white transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Any Additional Posts (Rendered in matching clean cards if more than 4) */}
        {remainingPosts.length > 0 && (
          <div className="pt-12 border-t border-white/[0.08] space-y-8">
            <h2 className="text-xl font-semibold text-[#F5F5F3]">
              All publications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {remainingPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group space-y-4 focus:outline-none"
                >
                  <div className="w-full aspect-[16/10] bg-[#121212] rounded-xl overflow-hidden border border-white/[0.08] relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <div className="text-xs font-medium text-[#9E9E9E]">
                      {post.authorName} • {post.dateStr}
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base sm:text-lg font-semibold text-[#F5F5F3] group-hover:text-white transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-[#888888] group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-0.5" />
                    </div>

                    <p className="text-xs sm:text-sm text-[#8E8E93] line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#141414] border border-white/[0.12] text-[#B0B0B0]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

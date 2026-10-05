import { prisma } from "@/lib/db";
import { BlogPost, User, Prisma } from "@prisma/client";
import Link from "next/link";
import { BookOpen, Clock, Eye, Tag, ArrowRight, Sparkles, Calendar } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";

import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog & Technical Insights | Webgent",
  description:
    "Explore engineering insights, web architecture case studies, and cloud software development tutorials from the Webgent engineering team.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog & Technical Insights | Webgent",
    description:
      "Explore engineering insights, web architecture case studies, and cloud software development tutorials.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    images: [
      {
        url: "/api/og?title=Technical+Insights+%26+Engineering+Blog&badge=Webgent+Articles",
        width: 1200,
        height: 630,
        alt: "Webgent Blog",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Technical Insights | Webgent",
    description:
      "Explore engineering insights, web architecture case studies, and cloud software development tutorials.",
    images: ["/api/og?title=Technical+Insights+%26+Engineering+Blog&badge=Webgent+Articles"],
    creator: "@webgent",
  },
};

type PostWithAuthor = BlogPost & {
  author: Pick<User, "id" | "name" | "avatarUrl">;
};

export default async function PublicBlogPage({
  searchParams,
}: {
  searchParams?: {
    page?: string;
    tag?: string;
    category?: string;
    search?: string;
  };
}) {
  const currentPage = Math.max(1, parseInt(searchParams?.page || "1", 10));
  const selectedTag = searchParams?.tag?.trim() || "";
  const selectedCategory = searchParams?.category?.trim() || "";
  const searchQuery = searchParams?.search?.trim() || "";

  const limit = 9;
  const skip = (currentPage - 1) * limit;

  let posts: PostWithAuthor[] = [];
  let featuredPost: PostWithAuthor | null = null;
  let totalPosts = 0;
  let allTags: { name: string; count: number }[] = [];

  try {
    const whereCondition: Prisma.BlogPostWhereInput = {
      status: "PUBLISHED",
      deletedAt: null,
      publishedAt: { lte: new Date() },
    };

    if (searchQuery) {
      whereCondition.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { excerpt: { contains: searchQuery, mode: "insensitive" } },
        { content: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    if (selectedCategory && selectedCategory.toLowerCase() !== "all") {
      whereCondition.category = {
        equals: selectedCategory,
        mode: "insensitive",
      };
    }

    if (selectedTag) {
      whereCondition.tags = {
        contains: selectedTag.toLowerCase(),
        mode: "insensitive",
      };
    }

    const featuredRes = await prisma.blogPost.findFirst({
      where: { ...whereCondition, featured: true },
      orderBy: [{ publishedAt: "desc" }],
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    featuredPost = featuredRes as PostWithAuthor | null;

    const [postsRes, countRes, allPublishedPosts] = await Promise.all([
      prisma.blogPost.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      prisma.blogPost.count({ where: whereCondition }),
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        select: { tags: true },
      }),
    ]);

    posts = postsRes as PostWithAuthor[];
    totalPosts = countRes;

    const tagMap: Record<string, number> = {};
    allPublishedPosts.forEach((p) => {
      if (p.tags) {
        p.tags.split(",").forEach((t) => {
          const clean = t.trim().toLowerCase();
          if (clean) tagMap[clean] = (tagMap[clean] || 0) + 1;
        });
      }
    });

    allTags = Object.entries(tagMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch {}

  const totalPages = Math.ceil(totalPosts / limit);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Engineering Insights & Articles</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Webgent Technical Blog
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Deep dives into modern web architecture, cloud platform design, Prisma ORM, and
            full-stack engineering.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-2">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Filter Tags:
              </span>

              <Link
                href="/blog"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  !selectedTag && !searchQuery
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                All Articles
              </Link>

              {allTags.map((tagObj) => (
                <Link
                  key={tagObj.name}
                  href={`/blog?tag=${encodeURIComponent(tagObj.name)}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedTag === tagObj.name
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  <span>#{tagObj.name}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-[10px] opacity-70">
                    {tagObj.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {featuredPost && !selectedTag && !searchQuery && (
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6 relative overflow-hidden group">
            <h2 className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Spotlight Featured Article</span>
            </h2>

            <div className="space-y-4 max-w-3xl">
              <span className="px-3.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold rounded-full uppercase tracking-wider inline-block">
                {featuredPost.category || "Featured"}
              </span>

              <h3 className="text-3xl sm:text-4xl font-extrabold text-white group-hover:text-indigo-400 transition-colors">
                <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
              </h3>

              <p className="text-base text-slate-300 line-clamp-3 leading-relaxed">
                {featuredPost.excerpt || featuredPost.content.substring(0, 200)}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 font-mono border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>
                    {featuredPost.publishedAt
                      ? new Date(featuredPost.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently published"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>{featuredPost.readTime || 1} min read</span>
                </div>

                <div className="flex items-center gap-1.5 text-indigo-400">
                  <Eye className="w-4 h-4" />
                  <span>{featuredPost.views} views</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                <span>Read Full Article</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {selectedTag
              ? `Articles Tagged "#${selectedTag}"`
              : "Latest Articles & Engineering Posts"}
          </h2>

          {posts.length === 0 ? (
            <div className="p-16 bg-slate-900/60 border border-slate-800 rounded-3xl text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-base font-semibold text-white">No articles found</p>
              <p className="text-xs text-slate-400">
                Try selecting a different tag or clear search parameters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col justify-between transition-all duration-300 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 bg-slate-950 text-indigo-400 border border-slate-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {post.category || "Article"}
                      </span>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{post.readTime || 1} min read</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {post.excerpt || post.content.substring(0, 150)}
                    </p>

                    {post.tags && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {post.tags.split(",").map((tagStr, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-mono rounded"
                          >
                            #{tagStr.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-4 border-t border-slate-800/40">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-8">
              <Link
                href={`/blog?page=${Math.max(1, currentPage - 1)}${
                  selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : ""
                }`}
                className={`px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all ${
                  currentPage === 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Previous Page
              </Link>

              <span className="text-xs font-mono text-slate-400 px-3">
                Page {currentPage} of {totalPages}
              </span>

              <Link
                href={`/blog?page=${Math.min(totalPages, currentPage + 1)}${
                  selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : ""
                }`}
                className={`px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all ${
                  currentPage === totalPages ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Next Page
              </Link>
            </div>
          )}

          <div className="pt-8">
            <NewsletterForm
              variant="card"
              title="Subscribe to Webgent Engineering Digest"
              description="Stay updated with our newest in-depth guides, architecture reviews, and performance optimization case studies."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

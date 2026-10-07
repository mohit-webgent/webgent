import { prisma } from "@/lib/db";
import { BlogPost, User, Prisma } from "@prisma/client";
import Link from "next/link";
import { BookOpen, Clock, Eye, Tag, ArrowRight, Sparkles, Calendar } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import { Card3DTilt } from "@/components/animations/card-tilt";
import { ClipReveal } from "@/components/animations/clip-reveal";

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
  searchParams?: { page?: string; tag?: string; category?: string; search?: string };
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
      whereCondition.category = { equals: selectedCategory, mode: "insensitive" };
    }

    if (selectedTag) {
      whereCondition.tags = { contains: selectedTag.toLowerCase(), mode: "insensitive" };
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
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto space-y-16 relative z-10 text-left">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.02] border border-white/10 text-[#A0A0A0] text-xs font-mono uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ENGINEERING / KNOWLEDGE BASE</span>
          </div>
          <ClipReveal>
            <h1 className="text-4xl sm:text-6xl font-bold text-[#F5F5F3] tracking-tight uppercase">
              Webgent Technical Log
            </h1>
          </ClipReveal>
          <p className="text-sm sm:text-base text-[#909090] max-w-2xl mx-auto leading-relaxed">
            Deep dives into modern web architecture, cloud platform design, Prisma ORM, and
            full-stack engineering written by practitioners.
          </p>
        </div>

        {/* Tag Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-[#8A8A8A] uppercase tracking-wider flex items-center gap-1 mr-2">
                <Tag className="w-3.5 h-3.5 text-[#8A8A8A]" /> Filter Tags:
              </span>

              <Link
                href="/blog"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !selectedTag && !searchQuery
                    ? "bg-[#E8E8E6] text-[#080808]"
                    : "bg-[#141414] text-[#8A8A8A] border border-white/[0.06] hover:text-[#F5F5F3]"
                }`}
              >
                All Articles
              </Link>

              {allTags.map((tagObj) => (
                <Link
                  key={tagObj.name}
                  href={`/blog?tag=${encodeURIComponent(tagObj.name)}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    selectedTag === tagObj.name
                      ? "bg-[#E8E8E6] text-[#080808]"
                      : "bg-[#141414] text-[#8A8A8A] border border-white/[0.06] hover:text-[#F5F5F3]"
                  }`}
                >
                  <span className="font-mono">#{tagObj.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#080808] text-[10px] opacity-70 font-mono">
                    {tagObj.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Spotlight Featured Article */}
        {featuredPost && !selectedTag && !searchQuery && (
          <div
            className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-8 sm:p-12 shadow-2xl space-y-6 relative overflow-hidden group transition-all duration-300"
          >
            <h2 className="flex items-center gap-2 text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Spotlight Featured Publication</span>
            </h2>

            <div className="space-y-4 max-w-3xl">
              <span className="px-2.5 py-0.5 bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[10px] font-mono font-medium rounded uppercase tracking-wider inline-block">
                {featuredPost.category || "Featured"}
              </span>

              <h3 className="text-2xl sm:text-4xl font-bold text-[#F5F5F3] tracking-tight group-hover:text-white transition-colors">
                <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
              </h3>

              <p className="text-xs sm:text-base text-[#909090] line-clamp-3 leading-relaxed">
                {featuredPost.excerpt || featuredPost.content.substring(0, 200)}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-[#8A8A8A] font-mono border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#666666]" />
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
                  <Clock className="w-3.5 h-3.5 text-[#666666]" />
                  <span>{featuredPost.readTime || 1} min read</span>
                </div>

                <div className="flex items-center gap-1.5 text-[#8A8A8A]">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{featuredPost.views} views</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E8E8E6] hover:bg-white text-[#080808] font-medium text-xs rounded-lg transition-colors group-hover:translate-x-0.5"
              >
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F3] tracking-tight uppercase">
            {selectedTag
              ? `Articles Tagged "#${selectedTag}"`
              : "Latest Technical Publications"}
          </h2>

          {posts.length === 0 ? (
            <div className="p-16 bg-[#0D0D0D] border border-white/[0.08] rounded-2xl text-center space-y-3">
              <BookOpen className="w-8 h-8 text-[#666666] mx-auto" />
              <p className="text-sm font-semibold text-[#F5F5F3]">No articles found</p>
              <p className="text-xs text-[#909090]">
                Try selecting a different tag or clear search parameters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.id}>
                  <Card3DTilt>
                    <div className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.18] rounded-xl p-6 sm:p-7 space-y-4 flex flex-col justify-between transition-all duration-300 shadow-xl h-full min-h-[260px] group">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[10px] font-mono font-medium rounded uppercase tracking-wider">
                            {post.category || "Article"}
                          </span>

                          <div className="flex items-center gap-1 text-[11px] text-[#8A8A8A] font-mono">
                            <Clock className="w-3 h-3 text-[#666666]" />
                            <span>{post.readTime || 1} min</span>
                          </div>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-[#F5F5F3] group-hover:text-white transition-colors">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>

                        <p className="text-xs text-[#909090] line-clamp-3 leading-relaxed">
                          {post.excerpt || post.content.substring(0, 150)}
                        </p>

                        {post.tags && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {post.tags.split(",").map((tagStr, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-[#141414] border border-white/[0.06] text-[#8A8A8A] text-[10px] font-mono rounded"
                              >
                                #{tagStr.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 flex items-center justify-between gap-4 border-t border-white/[0.06]">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8E8E6] hover:text-white transition-colors"
                        >
                          <span>Read Article</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <div className="flex items-center gap-1 text-xs text-[#8A8A8A] font-mono">
                          <Eye className="w-3.5 h-3.5 text-[#666666]" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </div>
                  </Card3DTilt>
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
                className={`px-4 py-2 bg-[#141414] border border-white/[0.08] rounded-lg text-xs font-medium text-[#D0D0CE] hover:text-white transition-colors ${
                  currentPage === 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Previous Page
              </Link>

              <span className="text-xs font-mono text-[#8A8A8A] px-3">
                Page {currentPage} of {totalPages}
              </span>

              <Link
                href={`/blog?page=${Math.min(totalPages, currentPage + 1)}${
                  selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : ""
                }`}
                className={`px-4 py-2 bg-[#141414] border border-white/[0.08] rounded-lg text-xs font-medium text-[#D0D0CE] hover:text-white transition-colors ${
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

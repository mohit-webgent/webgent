import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog & Insights | Webgent",
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
    type: "website",
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

// Fallback posts matching the exact reference layout in dark theme
const fallbackPosts: BlogPostItem[] = [
  {
    id: "post-1",
    title: "Conversations with London Makr & Co.",
    slug: "conversations-with-london-makr-and-co",
    excerpt:
      "We sat down with London's fast-growing brand and product design studio, Makr & Co. to find out how they've used modern web architecture to 2x their revenue.",
    authorName: "Olivia Rhye",
    dateStr: "20 Jan 2026",
    tags: ["Design", "Research", "Interviews"],
    coverImage:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "post-2",
    title: "A Relentless Pursuit of Perfection in Product Design",
    slug: "relentless-pursuit-perfection-product-design",
    excerpt:
      "I began to notice that there was a sharp contrast between well-made software architectures and hasty digital prototypes.",
    authorName: "Phoenix Baker",
    dateStr: "19 Jan 2026",
    tags: ["Design", "Research"],
    coverImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "post-3",
    title: "How to Run a Successful Business With Your Partner",
    slug: "how-to-run-successful-business-with-partner",
    excerpt:
      "Starting a business with your partner or co-founder is an exciting journey that requires rigorous system architecture and shared vision.",
    authorName: "Lana Steiner",
    dateStr: "18 Jan 2026",
    tags: ["Business", "Research"],
    coverImage:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "post-4",
    title: "Why Systems Architecture Matters – Performance & Scalability",
    slug: "why-systems-architecture-matters-scalability",
    excerpt:
      "Modern full-stack platforms require clean database boundaries and robust server rendering to support millions of concurrent users.",
    authorName: "Lana Steiner",
    dateStr: "18 Jan 2026",
    tags: ["Engineering", "Architecture"],
    coverImage:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=85",
  },
];

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
        : [p.category || "Design"];

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

  // Merge database posts with fallback posts so we always have at least 4 items matching the reference layout
  const allPosts = dbPosts.length >= 4 ? dbPosts : [...dbPosts, ...fallbackPosts.slice(dbPosts.length)];

  const featuredPost = allPosts[0];
  const sidePosts = allPosts.slice(1, 4);
  const remainingPosts = allPosts.slice(4);

  return (
    <div className="min-h-screen bg-[#080808] text-[#E0E0DE] pt-10 pb-24 sm:pt-14 sm:pb-32 px-5 sm:px-8 lg:px-14 font-sans">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
        {/* Top Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F3] tracking-tight">
            Recent blog posts
          </h1>
        </div>

        {/* Featured 1 (Left) + 3 Stacked Rows (Right) Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Large Featured Card */}
          <div className="lg:col-span-6">
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

          {/* Right Column (3 Stacked Horizontal Cards) */}
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
        </div>

        {/* Any Additional Posts (Rendered in matching clean cards if more than 4) */}
        {remainingPosts.length > 0 && (
          <div className="pt-12 border-t border-white/[0.08] space-y-8">
            <h2 className="text-xl font-semibold text-[#F5F5F3]">
              All publications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

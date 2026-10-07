import { prisma } from "@/lib/db";
import { BlogPost, User, Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Eye,
  Calendar,
  User as UserIcon,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import type { Metadata } from "next";
import { BlogReadTracker } from "@/components/blog/blog-read-tracker";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";

import { siteConfig } from "@/config/site";

export const revalidate = 60;

type PostWithAuthor = BlogPost & {
  author: Pick<User, "id" | "name" | "avatarUrl">;
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: params.slug, status: "PUBLISHED", deletedAt: null },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!post) {
      return {
        title: "Article Not Found | Webgent",
        robots: { index: false, follow: false },
      };
    }

    const title = post.seoTitle || `${post.title} | Webgent Blog`;
    const description = post.seoDescription || post.excerpt || post.content.substring(0, 160);
    const ogImage =
      post.ogImage ||
      post.coverImage ||
      `${siteConfig.url}/api/og?title=${encodeURIComponent(post.title)}&badge=${encodeURIComponent(post.category || "Technical Article")}&desc=${encodeURIComponent((post.excerpt || post.content).slice(0, 140))}&author=${encodeURIComponent(post.author?.name || "Webgent Team")}`;

    const tagsList = post.tags ? post.tags.split(",").map((t) => t.trim()) : [];

    return {
      title,
      description,
      alternates: {
        canonical: `/blog/${post.slug}`,
      },
      openGraph: {
        title: post.seoTitle || post.title,
        description,
        url: `${siteConfig.url}/blog/${post.slug}`,
        siteName: siteConfig.name,
        type: "article",
        publishedTime: post.publishedAt?.toISOString(),
        authors: [post.author?.name || "Webgent Engineering"],
        tags: tagsList,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: post.seoTitle || post.title,
        description,
        images: [ogImage],
        creator: "@webgent",
      },
    };
  } catch {
    return { title: "Technical Article | Webgent" };
  }
}

export default async function PublicBlogDetailPage({ params }: { params: { slug: string } }) {
  let post: PostWithAuthor | null = null;
  let relatedPosts: PostWithAuthor[] = [];

  try {
    const fetchedPost = await prisma.blogPost.findFirst({
      where: { slug: params.slug, status: "PUBLISHED", deletedAt: null },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (fetchedPost) {
      const updated = await prisma.blogPost.update({
        where: { id: fetchedPost.id },
        data: { views: { increment: 1 } },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      post = updated as PostWithAuthor;

      const currentTags = post.tags
        ? post.tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        : [];

      const OR_conditions: Prisma.BlogPostWhereInput[] = [];
      if (post.category) {
        OR_conditions.push({ category: { equals: post.category, mode: "insensitive" } });
      }
      currentTags.forEach((t) => {
        OR_conditions.push({ tags: { contains: t, mode: "insensitive" } });
      });

      const relatedRes = await prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
          NOT: { id: post.id },
          ...(OR_conditions.length > 0 ? { OR: OR_conditions } : {}),
        },
        take: 3,
        orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      relatedPosts = relatedRes as PostWithAuthor[];
    }
  } catch {}

  if (!post) {
    notFound();
  }

  const tagsList = post.tags
    ? post.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <BlogReadTracker slug={post.slug} title={post.title} readTime={post.readTime} />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8A8A8A] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>INDEX / RETURN TO BLOG</span>
        </Link>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-0.5 bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[10px] font-mono font-medium rounded uppercase tracking-wider">
              {post.category || "Engineering"}
            </span>

            <div className="flex items-center gap-4 text-xs font-mono text-[#8A8A8A]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#666666]" />
                <span>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Published recently"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#666666]" />
                <span>{post.readTime || 1} min read</span>
              </div>

              <div className="flex items-center gap-1.5 text-[#8A8A8A]">
                <Eye className="w-3.5 h-3.5" />
                <span>{post.views} views</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#F5F5F3] tracking-tight leading-tight uppercase">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-9 h-9 rounded-lg bg-[#141414] border border-white/[0.08] flex items-center justify-center text-[#E5E5E3] font-bold">
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-[#8A8A8A]" />
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#F5F5F3]">{post.author.name}</div>
              <div className="text-[11px] text-[#8A8A8A] font-mono">
                Software Architecture Group
              </div>
            </div>
          </div>
        </div>

        {post.coverImage && (
          <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-xl">
            <img
              src={post.coverImage}
              alt={post.title}

              fetchPriority="high"
              decoding="async"
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-8 sm:p-10 space-y-6 shadow-xl">
          <div className="prose prose-invert max-w-none text-[#B5B5B3] leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
            {post.content}
          </div>

          {tagsList.length > 0 && (
            <div className="pt-6 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-[#8A8A8A] uppercase tracking-wider mr-2">
                Article Tags:
              </span>
              {tagsList.map((tag, idx) => (
                <Link
                  key={idx}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-2.5 py-1 bg-[#141414] hover:bg-[#1C1C1C] border border-white/[0.06] text-[#8A8A8A] hover:text-[#F5F5F3] text-xs font-mono rounded transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {relatedPosts.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-white/[0.06]">
            <h2 className="text-xl font-bold text-[#F5F5F3] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#8A8A8A]" />
              <span>Related Technical Publications</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-5 space-y-3 flex flex-col justify-between transition-colors shadow-lg"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[10px] font-mono font-medium rounded uppercase tracking-wider">
                      {rel.category || "Article"}
                    </span>
                    <h3 className="text-sm font-semibold text-[#F5F5F3]">
                      <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                    </h3>
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-2 border-t border-white/[0.06] text-xs">
                    <Link
                      href={`/blog/${rel.slug}`}
                      className="inline-flex items-center gap-1 font-medium text-[#E8E8E6] hover:text-white text-xs"
                    >
                      <span>Read Publication</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <div className="flex items-center gap-1 text-[11px] text-[#666666] font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{rel.readTime || 1}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6">
          <NewsletterForm
            variant="card"
            title="Enjoyed this technical brief? Subscribe bi-weekly"
            description="Subscribe for deep technical articles, system architecture breakdowns, and web performance insights."
          />
        </div>
      </div>
    </div>
  );
}

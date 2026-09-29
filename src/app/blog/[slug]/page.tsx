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

export const dynamic = "force-dynamic";

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
    });

    if (!post) {
      return { title: "Article Not Found | Webgent" };
    }

    return {
      title: post.seoTitle || `${post.title} | Webgent Blog`,
      description: post.seoDescription || post.excerpt || post.content.substring(0, 160),
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt || undefined,
        images: post.ogImage || post.coverImage ? [post.ogImage || post.coverImage!] : [],
      },
    };
  } catch {
    return { title: "Technical Article | Webgent" };
  }
}

export default async function PublicBlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
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
      // Increment views count
      const updated = await prisma.blogPost.update({
        where: { id: fetchedPost.id },
        data: { views: { increment: 1 } },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      post = updated as PostWithAuthor;

      // Find related posts by matching tags or category
      const currentTags = post.tags
        ? post.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
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
  } catch {
    // Fallback on database disconnect
  }

  if (!post) {
    notFound();
  }

  const tagsList = post.tags
    ? post.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <BlogReadTracker slug={post.slug} title={post.title} readTime={post.readTime} />
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>

        {/* Article Header */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold rounded-full uppercase tracking-wider">
              {post.category || "Engineering"}
            </span>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
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
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{post.readTime || 1} min read</span>
              </div>

              <div className="flex items-center gap-1.5 text-indigo-400">
                <Eye className="w-3.5 h-3.5" />
                <span>{post.views} views</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Author Card */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 font-bold">
              {post.author.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{post.author.name}</div>
              <div className="text-[11px] text-slate-400">Software Architecture Team</div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* MDX / Markdown Article Body */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-base sm:text-lg whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Tags Pills */}
          {tagsList.length > 0 && (
            <div className="pt-8 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
                Article Tags:
              </span>
              {tagsList.map((tag, idx) => (
                <Link
                  key={idx}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-400 text-xs font-mono rounded-xl transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-slate-800">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Related Technical Articles</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 space-y-3 flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 bg-slate-950 text-indigo-400 border border-slate-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {rel.category || "Article"}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                      <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                    </h3>
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-800/40 text-xs">
                    <Link
                      href={`/blog/${rel.slug}`}
                      className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{rel.readTime || 1}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

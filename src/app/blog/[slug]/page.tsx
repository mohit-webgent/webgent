import { prisma } from "@/lib/db";
import { BlogPost, User, Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Eye, User as UserIcon } from "lucide-react";
import { RevealGroup } from "@/components/animations/reveal-group";
import { TextReveal } from "@/components/animations/text-reveal";
import { PostCard } from "@/components/blog/post-card";
import type { Metadata } from "next";
import { BlogReadTracker } from "@/components/blog/blog-read-tracker";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { siteConfig } from "@/config/site";
import { ParallaxImage } from "@/components/animations/parallax-image";

export const revalidate = 60;

type PostWithAuthor = BlogPost & {
  author: Pick<User, "id" | "name" | "avatarUrl">;
};

export async function generateMetadata({
  params: routeParams,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await routeParams;
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: params.slug, status: "PUBLISHED", deletedAt: null },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!post) {
      return {
        title: "Article Not Found",
        robots: { index: false, follow: false },
      };
    }

    const baseTitle = post.seoTitle || post.title;
    const fullTitle = `${baseTitle} | Webgent`;
    const description =
      post.seoDescription || post.excerpt || post.content.replace(/[#*`>_\[\]]/g, "").trim().substring(0, 160);
    const ogImage =
      post.ogImage ||
      post.coverImage ||
      `${siteConfig.url}/api/og?title=${encodeURIComponent(post.title)}&badge=${encodeURIComponent(post.category || "Technical Article")}&desc=${encodeURIComponent((post.excerpt || post.content).slice(0, 140))}&author=${encodeURIComponent(post.author?.name || "Webgent")}`;

    const tagsList = post.tags ? post.tags.split(",").map((t) => t.trim()) : [];

    return {
      title: baseTitle,
      description,
      alternates: {
        canonical: `/blog/${post.slug}`,
      },
      openGraph: {
        title: fullTitle,
        description,
        url: `${siteConfig.url}/blog/${post.slug}`,
        siteName: siteConfig.name,
        type: "article",
        publishedTime: post.publishedAt?.toISOString(),
        authors: [post.author?.name || "Webgent"],
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
        title: fullTitle,
        description,
        images: [ogImage],
        creator: "@webgent",
      },
    };
  } catch {
    return { title: "Technical Article" };
  }
}

export default async function PublicBlogDetailPage({ params: routeParams }: { params: Promise<{ slug: string }> }) {
  const params = await routeParams;
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
      post = fetchedPost as PostWithAuthor;

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
    <>
      <BlogReadTracker slug={post.slug} title={post.title} readTime={post.readTime} />

      <article>
        <header className="relative isolate overflow-hidden pb-10 pt-10 sm:pt-14">
          <div className="mx-auto max-w-4xl px-[var(--gutter)]">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg">
              <ArrowLeft className="h-4 w-4" />
              All articles
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fg-muted">
              {post.category && <span className="text-accent">{post.category}</span>}
              {post.publishedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime || 1} min read
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {post.views} views
              </span>
            </div>

            <TextReveal as="h1" immediate className="display-lg mt-5">
              {post.title}
            </TextReveal>

            <div className="fade-up mt-7 flex items-center gap-3">
              {post.author.avatarUrl ? (
                <img src={post.author.avatarUrl} alt="" loading="lazy" decoding="async" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <UserIcon className="h-4 w-4" />
                </span>
              )}
              <p className="font-medium">{post.author.name}</p>
            </div>
          </div>
        </header>

        {post.coverImage && (
          <div className="mx-auto max-w-6xl px-[var(--gutter)]">
            <ParallaxImage className="overflow-hidden rounded-[1.25rem] border border-line">
              {/* LCP Optimization: fetchpriority="high" */}
              <img src={post.coverImage} alt={post.title} fetchPriority="high" decoding="async" className="max-h-[560px] w-full object-cover" />
            </ParallaxImage>
          </div>
        )}

        <div className="mx-auto max-w-3xl px-[var(--gutter)] pt-12">
          <MarkdownContent content={post.content} className="prose-lg font-sans" />

          {tagsList.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-line pt-6">
              {tagsList.map((tag, idx) => (
                <Link key={idx} href={`/blog?tag=${encodeURIComponent(tag)}`} className="chip transition-colors hover:border-line-strong hover:text-fg">
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="wrap section">
          <h2 className="display-md mb-10">Keep reading</h2>
          <RevealGroup className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
            {relatedPosts.map((related) => (
              <PostCard
                key={related.id}
                post={{
                  title: related.title,
                  slug: related.slug,
                  excerpt: related.excerpt,
                  category: related.category,
                  meta: `${related.readTime || 1} min read`,
                  imageUrl: related.coverImage,
                }}
              />
            ))}
          </RevealGroup>
        </section>
      )}

      <div className="wrap pb-[var(--section-space)] pt-16">
        <NewsletterForm
          variant="card"
          title="Enjoyed this? Get the next one by email."
          description="Occasional articles on web development and performance. Unsubscribe at any time."
        />
      </div>
    </>
  );
}

import { requireAdmin } from "@/lib/auth-utils";
import { BlogList, type BlogPost } from "@/components/admin/blog-list";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  await requireAdmin();

  let initialPosts: BlogPost[] = [];
  try {
    const rawPosts = await prisma.blogPost.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    initialPosts = rawPosts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
      status: post.status,
      readTime: post.readTime,
      views: post.views,
      createdAt: post.createdAt.toISOString(),
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      author: post.author
        ? {
            name: post.author.name,
            email: post.author.email,
          }
        : null,
    }));
  } catch {
    initialPosts = [];
  }

  return (
    <div className="animate-in fade-in duration-300">
      <BlogList initialPosts={initialPosts} />
    </div>
  );
}

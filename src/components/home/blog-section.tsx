import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealGroup } from "@/components/animations/reveal-group";
import { PostCard } from "@/components/blog/post-card";
import { SectionHeading } from "@/components/ui/section-heading";

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  readTime?: number | null;
  imageUrl?: string | null;
}

export function BlogSection({ posts = [] }: { posts?: BlogPostItem[] }) {
  // Hidden until there are published articles to show.
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="wrap section pt-0">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:mb-10 lg:flex-row lg:items-end">
        <SectionHeading eyebrow="From the blog" title="Notes on building for the web." />
        <Link href="/blog" className="btn btn-secondary shrink-0 self-start lg:self-auto">
          <span>All articles</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <RevealGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={{ ...post, meta: post.readTime ? `${post.readTime} min read` : null }} />
        ))}
      </RevealGroup>
    </section>
  );
}

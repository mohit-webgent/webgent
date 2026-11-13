import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface PostCardData {
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  meta?: string | null;
  imageUrl?: string | null;
}

export function PostCard({ post, large = false, className = "" }: { post: PostCardData; large?: boolean; className?: string }) {
  return (
    <article
      data-reveal
      className={`group relative flex overflow-hidden rounded-xl border border-line bg-surface textured transition-[border-color,transform] duration-500 ease-expo-out hover:-translate-y-1 hover:border-line-strong ${
        large ? "flex-col lg:flex-row" : "flex-col"
      } ${className}`}
    >
      <div className={`relative overflow-hidden bg-surface-2 ${large ? "aspect-[16/9] lg:aspect-auto lg:w-[56%]" : "aspect-[16/9]"}`}>
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover saturate-[0.85] transition-[transform,filter] duration-700 ease-expo-out group-hover:scale-[1.04] group-hover:saturate-100"
          />
        ) : (
          <div className="flex h-full w-full items-end p-5">
            <span className="font-mono text-xs text-fg-muted">{post.category || "Article"}</span>
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col ${large ? "p-6 lg:p-8" : "p-4 sm:p-5"}`}>
        <div className="flex flex-wrap items-center gap-x-2.5 text-[0.8125rem] text-fg-muted">
          {post.category && <span className="text-accent">{post.category}</span>}
          {post.meta && <span>{post.meta}</span>}
        </div>
        <h3 className={`mt-1.5 font-semibold leading-snug ${large ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"}`}>
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className={`mt-2 text-sm leading-relaxed text-fg-muted ${large ? "line-clamp-3" : "line-clamp-2"}`}>{post.excerpt}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[0.8125rem] font-medium text-fg-soft transition-colors group-hover:text-accent">
          Read article
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Terminal } from "lucide-react";
import { Card3DTilt } from "@/components/animations/card-tilt";

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
];

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  readTime?: number | null;
  publishedAt?: Date | string | null;
  imageUrl?: string | null;
  coverImage?: string | null;
  ogImage?: string | null;
  tags?: string[] | string | null;
}

interface DisplayBlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: number;
  publishedAt: string;
  imageUrl: string;
  tags: string[];
}

interface EngineeringBlogSectionProps {
  posts?: BlogPostItem[];
}

export function EngineeringBlogSection({ posts = [] }: EngineeringBlogSectionProps) {
  // Gracefully hide blog section if no genuine published articles exist
  if (!posts || posts.length === 0) {
    return null;
  }

  const displayPosts: DisplayBlogPostItem[] = posts.map((p, idx) => {
    const rawImage = p.imageUrl || p.coverImage || p.ogImage;
    const fallbackImage = FALLBACK_COVERS[idx % FALLBACK_COVERS.length];

    return {
      id: p.id || `post-${idx}`,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || "",
      category: p.category || "Engineering",
      readTime: p.readTime || 4,
      publishedAt: p.publishedAt
        ? new Date(p.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Recent Article",
      imageUrl: rawImage && rawImage.trim().length > 0 ? rawImage.trim() : fallbackImage,
      tags: Array.isArray(p.tags)
        ? p.tags
        : typeof p.tags === "string"
        ? p.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : ["Architecture", "Engineering"],
    };
  });

  return (
    <section className="relative w-full py-5 sm:py-7 lg:py-9 border-t border-white/[0.06] text-left select-none overflow-hidden bg-[#07080A]">
      {/* Background Subtle Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(255,255,255,0.015),transparent_70%)]"
      />

      <div className="max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 relative z-10 space-y-5 sm:space-y-8">
        {/* =================================================================== */}
        {/* SECTION HEADER                                                      */}
        {/* =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div className="space-y-1.5 text-left max-w-2xl">
            {/* Green accent line matching design language */}
            <div className="w-10 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono block">
                TECHNICAL INDEX / 05
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F5F5F3] tracking-tight uppercase">
              From the Engineering Blog
            </h2>
            <p className="text-xs sm:text-sm text-[#8E8E8C] leading-relaxed">
              Technical deep dives into Next.js architecture, system design, and database resilience.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0E0F14] border border-white/[0.08] hover:border-white/[0.22] hover:bg-[#14151B] text-xs font-semibold text-[#D0D0CE] hover:text-white transition-all shadow-sm shrink-0"
          >
            <span>Explore All Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* =================================================================== */}
        {/* EDITORIAL ARTICLES GRID                                             */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayPosts.slice(0, 3).map((post, idx) => {
            const tags = post.tags || ["Architecture", "Engineering", "Scale"];

            return (
              <div key={post.id || idx}>
                <Card3DTilt maxTilt={2.5} spotlight={true}>
                  <div className="group relative rounded-xl sm:rounded-2xl bg-[#090A0D] border border-white/[0.08] hover:border-white/[0.22] transition-all duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden flex flex-col justify-between h-full min-h-[380px] sm:min-h-[410px]">
                    {/* Visual Architectural Cover Header */}
                    <div className="relative h-[155px] sm:h-[175px] w-full overflow-hidden bg-[#07080A] border-b border-white/[0.06] shrink-0">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = FALLBACK_COVERS[idx % FALLBACK_COVERS.length];
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#111217] flex items-center justify-center">
                          <Terminal className="w-8 h-8 text-[#555555]" />
                        </div>
                      )}

                      {/* Dark Vignette Overlay */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090A0D] via-[#090A0D]/60 to-black/30"
                      />

                      {/* Header Overlays */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                        {/* Category Tag */}
                        <span className="px-2.5 py-0.5 rounded bg-black/85 backdrop-blur-md border border-white/[0.1] text-[8.5px] font-mono uppercase tracking-wider text-[#D0D0CE] font-medium">
                          {post.category || "Engineering"}
                        </span>

                        {/* Read Time with Clock */}
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-white/[0.1] text-[8.5px] font-mono text-[#A0A0A0]">
                          <Clock className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{post.readTime || 5} min</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-2">
                        {/* Date and Type */}
                        <div className="flex items-center gap-2 text-[9.5px] font-mono text-[#777777]">
                          <span>{String(post.publishedAt || "Recently Published")}</span>
                          <span className="text-white/20">&bull;</span>
                          <span className="text-[#999999]">Technical Paper</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base font-bold text-[#F5F5F3] tracking-tight group-hover:text-white transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        {post.excerpt && (
                          <p className="text-[11.5px] text-[#8E8E8C] leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Technical Topic Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded text-[8px] sm:text-[8.5px] font-mono bg-[#111216] text-[#9A9A98] border border-white/[0.06] tracking-tight"
                          >
                            #{tag.replace(/\s+/g, "")}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="px-4 sm:p-5 py-3 border-t border-white/[0.06] bg-[#060709]/80 flex items-center justify-between shrink-0">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D0D0CE] hover:text-white transition-colors group/link"
                      >
                        <span>Read Architecture Paper</span>
                        <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/link:translate-x-1" />
                      </Link>

                      <span className="text-[10px] font-mono text-[#666666]">
                        Webgent Core
                      </span>
                    </div>
                  </div>
                </Card3DTilt>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

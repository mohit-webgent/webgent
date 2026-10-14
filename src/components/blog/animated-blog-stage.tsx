"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  coverImage?: string | null;
  readTime?: number | null;
  publishedAt?: Date | string | null;
}

interface AnimatedBlogStageProps {
  posts: BlogPostItem[];
}

export function AnimatedBlogStage({ posts }: AnimatedBlogStageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const stageImageRef = useRef<HTMLImageElement | null>(null);
  const stageCardRef = useRef<HTMLDivElement | null>(null);
  const stageTextRef = useRef<HTMLDivElement | null>(null);

  // Extract distinct categories
  const categories = [
    "ALL",
    ...Array.from(new Set(posts.map((p) => p.category?.toUpperCase() || "TECH"))).filter(
      Boolean
    ),
  ];

  // Filter posts based on selected category
  const filteredPosts =
    selectedCategory === "ALL"
      ? posts
      : posts.filter(
          (p) => (p.category?.toUpperCase() || "TECH") === selectedCategory
        );

  const activePost = filteredPosts[activeIdx] || filteredPosts[0] || posts[0];

  // Animate stage when activePost changes
  useEffect(() => {
    if (!activePost || isReducedMotion()) return;

    if (stageImageRef.current) {
      gsap.fromTo(
        stageImageRef.current,
        { opacity: 0.2, scale: 1.08, filter: "blur(6px)" },
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.5,
          ease: "power3.out",
        }
      );
    }

    if (stageTextRef.current) {
      gsap.fromTo(
        stageTextRef.current.children,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }
  }, [activePost]);

  // Subtle interactive 3D tilt tracking for stage card
  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageCardRef.current || isReducedMotion()) return;
    const rect = stageCardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(stageCardRef.current, {
      rotateY: x * 8,
      rotateX: -y * 8,
      transformPerspective: 1000,
      ease: "power1.out",
      duration: 0.3,
    });
  };

  const handleStageMouseLeave = () => {
    if (!stageCardRef.current || isReducedMotion()) return;
    gsap.to(stageCardRef.current, {
      rotateY: 0,
      rotateX: 0,
      ease: "power2.out",
      duration: 0.5,
    });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#E0E0DE] pt-8 pb-24 sm:pt-12 sm:pb-32 px-5 sm:px-8 lg:px-14 relative overflow-hidden font-sans">
      {/* Background kinetic ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.015] rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/3 right-10 w-[500px] h-[500px] bg-white/[0.012] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Animated Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest text-[#888888] uppercase">
                ENGINEERING DISPATCHES • ARCHIVE
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#F5F5F3]">
              The Journal<span className="text-white/30 font-serif">.</span>
            </h1>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveIdx(0);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 relative ${
                    isActive
                      ? "text-[#080808] font-semibold bg-[#E8E8E6] shadow-md shadow-white/10"
                      : "text-[#888888] hover:text-[#EDEDED] bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Split View: Interactive Stage (Desktop) & Kinetic Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Interactive Kinetic Article List (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-3">
            {filteredPosts.map((post, idx) => {
              const isHovered = activeIdx === idx;
              const formattedDate = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "2026";

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`group block p-5 sm:p-7 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                    isHovered
                      ? "bg-white/[0.04] border-white/[0.18] shadow-2xl translate-x-1"
                      : "bg-[#0B0B0B] border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  {/* Subtle hover accent light */}
                  {isHovered && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#666666] tracking-wider">
                          [{String(idx + 1).padStart(2, "0")}]
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono tracking-wider text-[#A0A0A0] uppercase">
                          {post.category || "Insight"}
                        </span>
                        <span className="text-xs font-mono text-[#555555] hidden sm:inline">
                          • {post.readTime || 4} MIN READ • {formattedDate}
                        </span>
                      </div>

                      <h2
                        className={`text-lg sm:text-xl font-medium tracking-tight transition-colors line-clamp-2 ${
                          isHovered ? "text-white" : "text-[#DCDCDA]"
                        }`}
                      >
                        {post.title}
                      </h2>

                      {post.excerpt && (
                        <p className="text-xs sm:text-sm text-[#808080] line-clamp-2 leading-relaxed pt-1 font-light">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Animated arrow button */}
                    <div
                      className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isHovered
                          ? "bg-white text-black border-white translate-x-0.5 -translate-y-0.5"
                          : "border-white/[0.08] text-[#666666] group-hover:text-white"
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Mobile Thumbnail (visible only on small screens) */}
                  {post.coverImage && (
                    <div className="mt-4 w-full aspect-[16/9] overflow-hidden rounded-lg border border-white/[0.08] lg:hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                </Link>
              );
            })}

            {filteredPosts.length === 0 && (
              <div className="py-20 text-center space-y-3 bg-[#0B0B0B] border border-white/[0.06] rounded-xl p-8">
                <Layers className="w-8 h-8 text-[#555555] mx-auto" />
                <p className="text-sm text-[#A0A0A0]">No articles in this category.</p>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Interactive Stage (5 cols on lg, Desktop Only) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-28">
            <div
              ref={stageCardRef}
              onMouseMove={handleStageMouseMove}
              onMouseLeave={handleStageMouseLeave}
              className="bg-[#0B0B0B] border border-white/[0.12] rounded-2xl overflow-hidden p-6 shadow-2xl relative transition-shadow duration-500 hover:shadow-white/[0.04]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Active post cinematic visual */}
              <div className="w-full aspect-[16/11] bg-[#141414] rounded-xl overflow-hidden relative border border-white/[0.08]">
                {activePost?.coverImage ? (
                  <img
                    ref={stageImageRef}
                    src={activePost.coverImage}
                    alt={activePost.title}
                    className="w-full h-full object-cover select-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#161616] to-[#0A0A0A]">
                    <span className="text-6xl font-light text-white/10 font-mono">
                      {activePost?.title.charAt(0) || "W"}
                    </span>
                  </div>
                )}

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Glass badge overlay */}
                <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-wider text-white uppercase">
                    {activePost?.category || "DISPATCH"}
                  </span>
                  <span className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-[#A0A0A0]">
                    {activePost?.readTime || 4} MIN READ
                  </span>
                </div>
              </div>

              {/* Active Post Details & Link */}
              <div ref={stageTextRef} className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#666666]">
                  <span>FEATURED DISPATCH</span>
                  <span>
                    {activePost?.publishedAt
                      ? new Date(activePost.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "2026 EDITION"}
                  </span>
                </div>

                <h3 className="text-xl font-medium tracking-tight text-[#F5F5F3] leading-snug line-clamp-2">
                  {activePost?.title}
                </h3>

                {activePost?.excerpt && (
                  <p className="text-xs text-[#8A8A8A] leading-relaxed line-clamp-3 font-light">
                    {activePost.excerpt}
                  </p>
                )}

                <div className="pt-3">
                  <Link
                    href={`/blog/${activePost?.slug}`}
                    className="inline-flex items-center justify-between w-full px-5 py-3 rounded-xl bg-[#E8E8E6] hover:bg-white text-black text-xs font-medium tracking-wide transition-all duration-300 group"
                  >
                    <span>Read Full Dispatch</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

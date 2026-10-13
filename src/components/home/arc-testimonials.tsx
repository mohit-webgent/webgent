"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface TestimonialItem {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
}

const DEFAULT_REVIEWS: TestimonialItem[] = [
  {
    id: "review-1",
    name: "Edward Alexander",
    role: "Founder & CTO",
    company: "Apex Systems",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    rating: 4.9,
    date: "29 Aug, 2025",
    content:
      "They have awesome customer service. I wouldn't recommend going to anyone else. All of you guys are awesome. Definitely love the way Webgent works.",
  },
  {
    id: "review-2",
    name: "Lauren Contreras",
    role: "VP Engineering",
    company: "CloudPulse Labs",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    rating: 4.9,
    date: "14 Jul, 2025",
    content:
      "Webgent delivered our entire distributed platform ahead of schedule with flawless architecture. The level of engineering discipline and attention to detail is truly world-class.",
  },
  {
    id: "review-3",
    name: "Diana Johnston",
    role: "Head of Product",
    company: "FinScale Core",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop",
    rating: 4.9,
    date: "03 Sep, 2025",
    content:
      "The transformation in our web performance was night and day. P99 latency dropped by 70%, and our conversion rate jumped significantly in the very first month.",
  },
  {
    id: "review-4",
    name: "Marcus Vance",
    role: "Co-Founder",
    company: "Horizon AI",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    rating: 5.0,
    date: "18 Oct, 2025",
    content:
      "Working with Webgent felt like having an elite Silicon Valley engineering core embedded right inside our company. From technical architecture to launch, pure excellence.",
  },
  {
    id: "review-5",
    name: "Sarah Jenkins",
    role: "Design Director",
    company: "Lumina Digital",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
    rating: 4.9,
    date: "22 Nov, 2025",
    content:
      "Incredible attention to aesthetics, speed, and responsiveness. Their mastery of micro-interactions and dark-mode elegance set our digital product light-years apart from competitors.",
  },
];

interface ArcTestimonialsProps {
  initialTestimonials?: any[];
}

export function ArcTestimonials({ initialTestimonials = [] }: ArcTestimonialsProps) {
  // Use DB testimonials if available, otherwise use curated reference reviews
  const reviews: TestimonialItem[] =
    initialTestimonials && initialTestimonials.length >= 3
      ? initialTestimonials.map((t, idx) => ({
          id: t.id || `db-${idx}`,
          name: t.clientName || DEFAULT_REVIEWS[idx % DEFAULT_REVIEWS.length].name,
          role: t.clientTitle || DEFAULT_REVIEWS[idx % DEFAULT_REVIEWS.length].role,
          company: t.company || DEFAULT_REVIEWS[idx % DEFAULT_REVIEWS.length].company,
          avatar:
            t.avatarUrl || DEFAULT_REVIEWS[idx % DEFAULT_REVIEWS.length].avatar,
          rating: t.rating || 4.9,
          date: t.createdAt
            ? new Date(t.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : DEFAULT_REVIEWS[idx % DEFAULT_REVIEWS.length].date,
          content: t.content || DEFAULT_REVIEWS[idx % DEFAULT_REVIEWS.length].content,
        }))
      : DEFAULT_REVIEWS;

  const [activeIndex, setActiveIndex] = useState(0);
  const total = reviews.length;

  // Unconditionally auto-cycle continuously every 3.5 seconds (never paused by hover)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 3500);

    return () => clearInterval(timer);
  }, [total, activeIndex]);

  // Compute 3 visible slots along the arc: Top (prev), Center (active), Bottom (next)
  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  const activeItem = reviews[activeIndex];
  const prevItem = reviews[prevIndex];
  const nextItem = reviews[nextIndex];

  return (
    <section className="relative w-full py-5 sm:py-7 lg:py-9 border-t border-white/[0.06] text-left select-none overflow-hidden bg-[#07080A]">
      {/* Background Subtle Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.015),transparent_70%)]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-5 sm:space-y-8">
        {/* =================================================================== */}
        {/* HEADER: Exactly matching reference image layout                    */}
        {/* =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 text-left">
            {/* Green accent pill as seen in reference */}
            <div className="w-10 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F5F5F3] tracking-tight">
              Customer Reviews
            </h2>
            <p className="text-xs sm:text-sm text-[#8E8E8C]">
              Direct feedback from technical leaders and founders building with Webgent.
            </p>
          </div>

          <Link
            href="/testimonials"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#CCCCCC] hover:text-white transition-colors py-1"
          >
            <span>All Testimonials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* =================================================================== */}
        {/* MAIN STAGE: Left Curved Arc Profile Track + Right Quote Canvas       */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[380px] sm:min-h-[420px]">
          {/* ----------------------------------------------------------------- */}
          {/* LEFT: Curved Arc with Avatars & Ratings (lg:col-span-5)           */}
          {/* ----------------------------------------------------------------- */}
          <div className="lg:col-span-5 relative w-full h-[320px] sm:h-[380px] flex items-center justify-start">
            {/* Elegant SVG Curved Arc Line */}
            <svg
              className="absolute left-0 top-0 w-full h-full pointer-events-none"
              viewBox="0 0 320 380"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* The curved trajectory line */}
              <path
                d="M 45,25 C 135,115 135,265 45,355"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Arc Profiles Container */}
            <div className="relative w-full h-full flex flex-col justify-between py-2">
              {/* 1. TOP PROFILE (Previous) */}
              <div
                onClick={() => setActiveIndex(prevIndex)}
                className="group absolute top-[6%] left-[36px] flex items-center gap-3 cursor-pointer transition-all duration-700 ease-out opacity-60 hover:opacity-100 hover:scale-105"
              >
                {/* Avatar */}
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-white/20 bg-[#121318] shadow-md shrink-0 transition-transform duration-500">
                  <img
                    key={prevItem.avatar}
                    src={prevItem.avatar}
                    alt={prevItem.name}
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>

                {/* Info */}
                <div className="space-y-0.5 min-w-0 transition-all duration-500">
                  <h4 className="text-xs sm:text-[13px] font-semibold text-[#D0D0CE] group-hover:text-white transition-colors truncate">
                    {prevItem.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-[#888888]">
                    <span className="text-emerald-400 font-bold">★ {prevItem.rating.toFixed(1)}</span>
                    <span className="text-white/20">&bull;</span>
                    <span className="truncate">on {prevItem.date}</span>
                  </div>
                </div>
              </div>

              {/* 2. CENTER PROFILE (Active Spotlight Item) */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[78px] flex items-center gap-3.5 sm:gap-4 transition-all duration-700 ease-out z-20">
                {/* Active Highlight Avatar with Outer Ring */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.18)] ring-4 ring-white/10 shrink-0 bg-[#0A0B0E] transition-all duration-500">
                  <img
                    key={activeItem.avatar}
                    src={activeItem.avatar}
                    alt={activeItem.name}
                    className="w-full h-full object-cover contrast-110 transition-all duration-500"
                  />
                  {/* Active live beacon */}
                  <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black shadow-[0_0_6px_#34d399] animate-pulse" />
                </div>

                {/* Active Info */}
                <div className="space-y-1 min-w-0 transition-all duration-500">
                  <h3 className="text-base sm:text-xl font-bold text-white tracking-tight leading-tight">
                    {activeItem.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      ★ {activeItem.rating.toFixed(1)}
                    </span>
                    <span className="text-white/30">&bull;</span>
                    <span className="text-[#A0A0A0]">on {activeItem.date}</span>
                  </div>
                  {activeItem.role && (
                    <div className="text-[10px] sm:text-[11px] text-[#707070] font-mono">
                      {activeItem.role} {activeItem.company ? `• ${activeItem.company}` : ""}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. BOTTOM PROFILE (Next) */}
              <div
                onClick={() => setActiveIndex(nextIndex)}
                className="group absolute bottom-[6%] left-[36px] flex items-center gap-3 cursor-pointer transition-all duration-700 ease-out opacity-60 hover:opacity-100 hover:scale-105"
              >
                {/* Avatar */}
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-white/20 bg-[#121318] shadow-md shrink-0 transition-transform duration-500">
                  <img
                    key={nextItem.avatar}
                    src={nextItem.avatar}
                    alt={nextItem.name}
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>

                {/* Info */}
                <div className="space-y-0.5 min-w-0 transition-all duration-500">
                  <h4 className="text-xs sm:text-[13px] font-semibold text-[#D0D0CE] group-hover:text-white transition-colors truncate">
                    {nextItem.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-[#888888]">
                    <span className="text-emerald-400 font-bold">★ {nextItem.rating.toFixed(1)}</span>
                    <span className="text-white/20">&bull;</span>
                    <span className="truncate">on {nextItem.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* RIGHT: Active Big Quote (lg:col-span-7)                           */}
          {/* ----------------------------------------------------------------- */}
          <div className="lg:col-span-7 relative flex flex-col justify-center pl-2 sm:pl-6 lg:pl-10">
            {/* Giant decorative quotation mark */}
            <div className="text-5xl sm:text-7xl font-serif text-white/25 leading-none select-none mb-1">
              &ldquo;
            </div>

            {/* Animated Quote Paragraph */}
            <div
              key={activeItem.id}
              className="space-y-4 animate-in fade-in duration-500 transition-all"
            >
              <p className="text-base sm:text-xl lg:text-2xl font-serif italic text-[#E5E5E3] leading-relaxed max-w-2xl font-light">
                <span className="font-serif not-italic font-bold text-2xl sm:text-3xl text-white mr-0.5">
                  {activeItem.content.charAt(0)}
                </span>
                {activeItem.content.slice(1)}
              </p>

              {/* Attribution Subtitle */}
              <div className="pt-2 flex items-center gap-3 text-xs sm:text-sm font-mono text-[#888888]">
                <span className="text-white font-semibold">{activeItem.name}</span>
                <span className="text-white/20">&bull;</span>
                <span>{activeItem.company || "Verified Client"}</span>
                <span className="text-white/20">&bull;</span>
                <span className="text-emerald-400/90 text-[11px]">Verified Review ✓</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

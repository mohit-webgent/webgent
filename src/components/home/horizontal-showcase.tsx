"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card3DTilt } from "@/components/animations/card-tilt";

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category?: string | null;
  demoUrl?: string | null;
  technologies?: string | null;
  imageUrl?: string | null;
}

// Curated systems with honest framing: live client work and technical concept prototypes
const CURATED_SYSTEMS: ProjectItem[] = [
  {
    id: "system-edayaa",
    title: "Edayaa Jewellery E-Commerce Store",
    slug: "edayaa-jewellery",
    category: "E-Commerce & Retail",
    description:
      "Production silver jewellery store built with Next.js, featuring Razorpay checkout, product filters, and fast mobile loading.",
    imageUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop",
    demoUrl: "https://edayaajewellery.com",
  },
  {
    id: "system-1",
    title: "Enterprise SaaS Analytics (Concept)",
    slug: "nextgen-enterprise-saas-platform",
    category: "Cloud Dashboard",
    description:
      "Concept dashboard illustrating multi-tenant analytics, responsive data tables, and modern cloud database architecture.",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    demoUrl: null,
  },
  {
    id: "system-2",
    title: "Real-Time Trading Interface (Concept)",
    slug: "fintech-realtime-trading-portal",
    category: "Financial Dashboard",
    description:
      "Concept market-tracking interface designed with WebSockets and charting components for fast client-side rendering.",
    imageUrl:
      "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=800&auto=format&fit=crop",
    demoUrl: null,
  },
  {
    id: "system-3",
    title: "Telehealth Patient Portal (Concept)",
    slug: "healthcare-digital-patient-portal",
    category: "Healthcare UI",
    description:
      "Concept medical portal showcasing appointment scheduling, doctor availability, and private consultation workflows.",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
    demoUrl: null,
  },
];

interface HorizontalShowcaseProps {
  projects?: ProjectItem[];
}

export function HorizontalShowcase({ projects = [] }: HorizontalShowcaseProps) {
  // Merge or fallback to curated elite systems
  const displayProjects: ProjectItem[] =
    projects && projects.length > 0
      ? projects.map((p, idx) => {
          const fallback = CURATED_SYSTEMS[idx % CURATED_SYSTEMS.length];
          const rawDemo = p.demoUrl || fallback.demoUrl;
          const isRealDemo =
            typeof rawDemo === "string" &&
            rawDemo.trim() !== "" &&
            !rawDemo.includes("demo.webgent.com");

          return {
            id: p.id || fallback.id,
            title: p.title || fallback.title,
            slug: p.slug || fallback.slug,
            description: p.description || fallback.description,
            category: p.category || fallback.category,
            demoUrl: isRealDemo ? rawDemo.trim() : null,
            imageUrl: p.imageUrl || fallback.imageUrl,
          };
        })
      : CURATED_SYSTEMS;

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const totalItems = displayProjects.length;

  const updateScrollState = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;

    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < maxScroll - 10);

    if (maxScroll > 0) {
      setScrollProgress(Math.min(1, Math.max(0, scrollLeft / maxScroll)));
    }

    const firstChild = scrollContainerRef.current.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.offsetWidth + 16 : 300;
    const activeIdx = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(Math.min(totalItems - 1, Math.max(0, activeIdx)));
  }, [totalItems]);

  useEffect(() => {
    updateScrollState();
    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollState]);

  const scrollByDirection = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const firstChild = scrollContainerRef.current.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.offsetWidth + 16 : 300;

    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  const scrollToItem = (index: number) => {
    if (!scrollContainerRef.current) return;
    const firstChild = scrollContainerRef.current.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.offsetWidth + 16 : 300;

    scrollContainerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full py-5 sm:py-7 lg:py-9 overflow-hidden text-left bg-[#07080A] border-y border-white/[0.06] select-none">
      {/* Subtle Background Radial Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.015),transparent_70%)]"
      />

      <div className="max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 space-y-4 sm:space-y-6 relative z-10">
        {/* =================================================================== */}
        {/* HEADER BAR: Editorial Dark Monochrome                              */}
        {/* =================================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-white/[0.06]">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono block">
                FEATURED ARCHITECTURE / 03
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F5F5F3] tracking-tight uppercase">
              Selected Work & Concept Studies
            </h2>
            <p className="text-[11px] sm:text-xs text-[#8E8E8C] leading-relaxed">
              Production client implementations and technical concept projects engineered by Webgent.
            </p>
          </div>

          {/* Right Controls: Sleek Arrow Buttons & Counter */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
            {/* Step Counter */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-[#8A8A8A] px-2 py-0.5 rounded-md bg-[#0D0E12] border border-white/[0.08]">
              <span className="text-[#F5F5F3] font-semibold">0{currentIndex + 1}</span>
              <span className="text-white/20">/</span>
              <span>0{totalItems}</span>
            </div>

            {/* Prev / Next Minimal Arrow Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollByDirection("left")}
                disabled={!canScrollLeft}
                aria-label="Previous system"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0D0E12] border border-white/[0.08] hover:border-white/[0.22] hover:bg-[#14151B] text-white/80 hover:text-white flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed active:scale-95 shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByDirection("right")}
                disabled={!canScrollRight}
                aria-label="Next system"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0D0E12] border border-white/[0.08] hover:border-white/[0.22] hover:bg-[#14151B] text-white/80 hover:text-white flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed active:scale-95 shadow-sm"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <Link
              href="/work"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-[#CCCCCC] hover:text-white transition-colors ml-2 py-1"
            >
              <span>All Systems</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CAROUSEL TRACK: Tightly Fitted, Sleek & Ultra-Premium Cards         */}
        {/* =================================================================== */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollState}
          className="flex gap-3.5 sm:gap-4 lg:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1.5 -mx-4 sm:-mx-6 lg:-mx-8 2xl:-mx-16 px-4 sm:px-6 lg:px-8 2xl:px-16 touch-pan-x scroll-smooth"
        >
          {displayProjects.map((project, idx) => (
            <div
              key={project.id || idx}
              className="w-[260px] sm:w-[300px] lg:w-[320px] 2xl:w-[360px] shrink-0 snap-start"
            >
              <Card3DTilt maxTilt={2} spotlight={true}>
                <div className="group relative rounded-xl bg-[#090A0D] border border-white/[0.08] hover:border-white/[0.22] transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden flex flex-col justify-between h-[255px] sm:h-[275px]">
                  {/* Top Architectural Visual (Compact & Sleek) */}
                  <div className="relative h-[115px] sm:h-[125px] w-full overflow-hidden bg-[#07080A] border-b border-white/[0.06] shrink-0">
                    {project.imageUrl && (
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{
                          backgroundImage: `url('${project.imageUrl}')`,
                        }}
                      />
                    )}

                    {/* Dark Monochrome Vignette */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-[#090A0D]/60 to-black/30"
                    />

                    {/* Visual Header Overlays */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-white/[0.1] text-[8px] font-mono uppercase tracking-wider text-[#D0D0CE] font-medium">
                          {project.category || "Architecture"}
                        </span>
                        {project.slug === "edayaa-jewellery" ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/85 backdrop-blur-md border border-emerald-500/40 text-[8px] font-mono uppercase tracking-wider text-emerald-400 font-medium">
                            Live Work
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/85 backdrop-blur-md border border-amber-500/40 text-[8px] font-mono uppercase tracking-wider text-amber-300 font-medium">
                            Concept
                          </span>
                        )}
                      </div>

                      <span className="text-[8px] font-mono text-[#888888] px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-md border border-white/[0.1]">
                        0{idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body: Tightly Fitted, Zero Extra Space */}
                  <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-center space-y-1 min-w-0">
                    <h3 className="text-[13px] sm:text-sm font-bold text-[#F5F5F3] tracking-tight group-hover:text-white transition-colors leading-tight truncate">
                      {project.title}
                    </h3>
                    <p className="text-[10.5px] sm:text-[11px] text-[#8E8E8C] leading-snug line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Card Footer: Minimalist Navigation Link */}
                  <div className="px-3 sm:px-3.5 py-2 border-t border-white/[0.06] bg-[#060709]/80 flex items-center justify-between shrink-0">
                    <Link
                      href={`/work/${project.slug}`}
                      className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#D0D0CE] hover:text-white transition-colors group/link"
                    >
                      <span>Case Study</span>
                      <ArrowRight className="w-2.5 h-2.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                    </Link>

                    {project.demoUrl && project.demoUrl.trim() !== "" && !project.demoUrl.includes("demo.webgent.com") ? (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-[#777777] hover:text-white transition-colors"
                        title="View Live System"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </Card3DTilt>
            </div>
          ))}
        </div>

        {/* =================================================================== */}
        {/* CAROUSEL BOTTOM: Minimalist Progress Track & Pagination Dots        */}
        {/* =================================================================== */}
        <div className="pt-0.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-left">
          {/* Pagination Dots & Track */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              {displayProjects.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => scrollToItem(dotIdx)}
                  aria-label={`Jump to system 0${dotIdx + 1}`}
                  className="py-3 px-1.5 flex items-center justify-center focus:outline-none"
                >
                  <span
                    className={`h-1 rounded-full transition-all duration-300 block ${
                      currentIndex === dotIdx
                        ? "w-4 bg-white shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                        : "w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex-1 sm:w-28 h-0.5 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full bg-white/50 rounded-full transition-all duration-150"
                style={{ width: `${Math.max(15, scrollProgress * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-[9px] sm:text-[9.5px] font-mono text-[#666666]">
            Modern web engineering & reliable client delivery
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Star, ExternalLink } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";
import { Card3DTilt } from "@/components/animations/card-tilt";

interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string | null;
  demoUrl?: string | null;
}

interface HorizontalShowcaseProps {
  projects: ProjectItem[];
}

export function HorizontalShowcase({ projects }: HorizontalShowcaseProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !trackRef.current) return;
      if (isReducedMotion()) return;
      if (projects.length === 0) return;

      // Only enable horizontal pinning on desktop (width >= 1024px)
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const track = trackRef.current;
        if (!track) return;

        const totalScrollWidth = track.scrollWidth - track.clientWidth;
        if (totalScrollWidth <= 0) return;

        gsap.to(track, {
          x: -totalScrollWidth,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 15%",
            end: () => `+=${totalScrollWidth + 300}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
      });

      return () => mm.revert();
    },
    { dependencies: [projects], scope: containerRef }
  );

  if (projects.length === 0) return null;

  return (
    <section
      ref={containerRef}
      className="relative w-full py-12 lg:py-20 overflow-hidden text-left"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono block">
            FEATURED ARCHITECTURE / 03
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#F5F5F3] tracking-tight uppercase">
            Selected Systems In Production
          </h2>
          <p className="text-xs sm:text-sm text-[#909090]">
            High-scale platforms, custom SaaS architectures, and conversion-engineered systems.
          </p>
        </div>

        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E5E5E3] hover:text-white transition-colors"
        >
          <span>View All Case Studies</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Strip Container (Pinned on Desktop, Natural Grid on Mobile) */}
      <div
        ref={trackRef}
        className="flex flex-col lg:flex-row gap-6 lg:gap-8 will-change-transform lg:w-max"
      >
        {projects.map((project, idx) => (
          <div
            key={project.id}
            className="w-full lg:w-[480px] shrink-0"
          >
            <Card3DTilt>
              <div className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.20] rounded-2xl p-7 sm:p-8 space-y-6 flex flex-col justify-between transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.8)] h-full min-h-[340px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[10px] font-mono uppercase tracking-wider font-medium">
                      {project.category || "Case Study"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#A0A0A0] font-mono">
                      <Star className="w-3 h-3 fill-current" /> 0{idx + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#F5F5F3] tracking-tight group-hover:text-white transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#909090] mt-2.5 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 border-t border-white/[0.06] flex items-center justify-between">
                  <Link
                    href={`/work/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8E8E6] hover:text-white transition-colors"
                  >
                    <span>Read Architecture Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-[#888888] hover:text-white bg-[#141414] border border-white/[0.06] transition-colors"
                      title="View Live Demo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </Card3DTilt>
          </div>
        ))}
      </div>
    </section>
  );
}

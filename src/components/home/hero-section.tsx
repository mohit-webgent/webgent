"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { CtaLink } from "@/components/ui/cta-link";
import { HeroResponsiveVisual } from "./hero-responsive-visual";
import {
  gsap,
  MOTION_TIMINGS,
  MOTION_EASING,
  isReducedMotion,
} from "@/components/animations/gsap-core";

export function HeroSection() {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const visualEntranceRef = useRef<HTMLDivElement | null>(null);
  const visualScrollRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!heroSectionRef.current) return;

      // Respect prefers-reduced-motion
      if (isReducedMotion()) {
        if (eyebrowRef.current) gsap.set(eyebrowRef.current, { opacity: 1, y: 0 });
        gsap.set(".hero-headline-line", { opacity: 1, y: 0 });
        if (paragraphRef.current) gsap.set(paragraphRef.current, { opacity: 1, y: 0 });
        if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 1, y: 0 });
        if (visualEntranceRef.current) {
          gsap.set(visualEntranceRef.current, { opacity: 1, scale: 1, y: 0, rotation: 0 });
        }
        return;
      }

      // 1. Hero Entrance Sequence
      const tl = gsap.timeline({
        defaults: {
          ease: MOTION_EASING.cinematic,
        },
      });

      // Eyebrow line-mask reveal
      if (eyebrowRef.current) {
        tl.fromTo(
          eyebrowRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 }
        );
      }

      // Headline lines reveal sequentially
      tl.fromTo(
        ".hero-headline-line",
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: MOTION_EASING.default,
        },
        "-=0.35"
      );

      // Paragraph fades upward
      if (paragraphRef.current) {
        tl.fromTo(
          paragraphRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.65 },
          "-=0.45"
        );
      }

      // CTA buttons reveal
      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        );
      }

      // Hero Product Visual (APPROVED IMAGE) physical settling entrance
      if (visualEntranceRef.current) {
        tl.fromTo(
          visualEntranceRef.current,
          {
            opacity: 0,
            scale: 0.95,
            y: 28,
            rotation: -0.8,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            rotation: 0,
            duration: MOTION_TIMINGS.visualSettling,
            ease: MOTION_EASING.smooth,
          },
          "-=0.4"
        );
      }

      // 2. Hero Scroll Story (ScrollTrigger integration)
      // As user scrolls: headline subtly moves upward, product visual scales slightly, translates, deepens
      if (heroSectionRef.current) {
        if (headlineRef.current) {
          gsap.to(headlineRef.current, {
            y: -35,
            opacity: 0.85,
            ease: "none",
            scrollTrigger: {
              trigger: heroSectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
          });
        }

        if (visualScrollRef.current) {
          gsap.to(visualScrollRef.current, {
            y: -50,
            scale: 0.96,
            rotation: -1.2,
            opacity: 0.85,
            ease: "none",
            scrollTrigger: {
              trigger: heroSectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });
        }
      }
    },
    { scope: heroSectionRef }
  );

  return (
    <section
      ref={heroSectionRef}
      className="relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 sm:py-20 lg:py-0 overflow-x-clip lg:overflow-visible"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 xl:gap-16 items-center w-full">
        {/* Left Column: Text & CTA */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-8 text-left z-10">
          {/* Eyebrow */}
          <div
            ref={eyebrowRef}
            className="text-[11px] sm:text-xs font-mono tracking-[0.22em] text-[#8A8A8A] uppercase"
          >
            WEBGENT <span className="text-[#444444] mx-2">/</span> DIGITAL ENGINEERING STUDIO
          </div>

          {/* Headline with line-based reveal */}
          <h1
            ref={headlineRef}
            className="text-5xl lg:text-[4rem] font-bold tracking-[-0.035em] leading-[0.95] uppercase text-[#F5F5F3]"
          >
            <span className="block overflow-hidden">
              <span className="hero-headline-line block">YOU IMAGINE</span>
            </span>
            <span className="block overflow-hidden">
              <span className="hero-headline-line block text-[#A8A8A8]">WE ENGINEER</span>
            </span>
            <span className="block overflow-hidden">
              <span className="hero-headline-line block">REALITY.</span>
            </span>
          </h1>

          {/* Supporting paragraph */}
          <p
            ref={paragraphRef}
            className="text-base sm:text-lg lg:text-[19px] text-[#8A8A8A] max-w-[520px] leading-[1.6] font-normal"
          >
            We design and build digital products for ambitious businesses.
          </p>

          {/* CTA Buttons */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3"
          >
            <CtaLink
              href="/contact"
              label="Hero Start Project"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-[#E8E8E6] hover:bg-[#FFFFFF] text-[#080808] font-medium text-xs sm:text-sm tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] active:translate-y-0 active:scale-[0.99]"
            >
              <span>START YOUR PROJECT</span>
              <ArrowRight className="w-4 h-4" />
            </CtaLink>

            <CtaLink
              href="/work"
              label="Hero Browse Work"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-transparent hover:bg-white/[0.04] text-[#E5E5E3] border border-white/[0.12] hover:border-white/[0.20] font-medium text-xs sm:text-sm tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>EXPLORE PORTFOLIO</span>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </CtaLink>
          </div>
        </div>

        {/* Right Column: Hero Visual with Entrance and Scroll-Reactive Layers */}
        <div className="lg:col-span-6 xl:col-span-6 relative w-full flex items-center justify-center lg:justify-end min-w-0">
          <div ref={visualEntranceRef} className="w-full flex items-center justify-center lg:justify-end">
            <div ref={visualScrollRef} className="w-full flex items-center justify-center lg:justify-end">
              <HeroResponsiveVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

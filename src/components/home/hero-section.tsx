"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { CtaLink } from "@/components/ui/cta-link";
import { HeroStartProjectButton } from "./hero-start-project-button";
import { HeroResponsiveVisual } from "./hero-responsive-visual";
import {
  gsap,
  MOTION_TIMINGS,
  MOTION_EASING,
  isReducedMotion,
} from "@/components/animations/gsap-core";
import { HomeHeroContent, DEFAULT_HERO_CONTENT } from "@/lib/services/cms-shared";

export interface HeroSectionProps {
  data?: HomeHeroContent;
}

export function HeroSection({ data }: HeroSectionProps = {}) {
  const content = data || DEFAULT_HERO_CONTENT;
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLDivElement | null>(null);
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
      className="relative w-full min-h-[58vh] lg:min-h-[64vh] flex items-center justify-center pb-2 sm:pb-4 lg:pb-4 overflow-x-clip lg:overflow-visible"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-10 xl:gap-16 items-center w-full">
        {/* Left Column: Text & CTA */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-8 text-left z-10">
          {/* Eyebrow */}
          <div
            ref={eyebrowRef}
            className="text-[10px] sm:text-xs font-mono tracking-[0.2em] sm:tracking-[0.22em] text-[#8A8A8A] uppercase"
          >
            {content.eyebrow}
          </div>

          {/* Headline with line-based reveal */}
          <div
            role="heading"
            aria-level={2}
            ref={headlineRef}
            aria-label={`${content.headlineLine1} ${content.headlineLine2} ${content.headlineLine3}`}
            className="text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] 2xl:text-[5.2rem] 3xl:text-[6rem] font-bold tracking-[-0.035em] leading-[0.95] uppercase text-[#F5F5F3]"
          >
            <span aria-hidden="true">
              <span className="block overflow-hidden">
                <span className="hero-headline-line block">{content.headlineLine1}</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-headline-line block text-[#A8A8A8]">{content.headlineLine2}</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-headline-line block">{content.headlineLine3}</span>
              </span>
            </span>
          </div>

          {/* Supporting paragraph */}
          <p
            ref={paragraphRef}
            className="text-sm sm:text-base lg:text-[15px] xl:text-base 2xl:text-lg text-[#8A8A8A] max-w-[520px] 2xl:max-w-[640px] leading-[1.6] font-normal"
          >
            {content.subheadline}
          </p>

          {/* CTA Buttons - Single row on mobile with balanced responsive sizing */}
          <div
            ref={ctaRef}
            className="flex flex-row items-center gap-2 sm:gap-4 pt-2 sm:pt-3 w-full sm:w-auto"
          >
            <HeroStartProjectButton
              className="flex-1 sm:flex-initial"
              label={content.primaryCtaText}
              href={content.primaryCtaLink}
            />

            <CtaLink
              href={content.secondaryCtaLink}
              label="Hero Browse Work"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-7 py-3 sm:py-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[#E5E5E3] hover:text-white border border-white/[0.12] hover:border-white/[0.24] font-medium text-[11px] sm:text-[13px] tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md whitespace-nowrap text-center"
            >
              <span>{content.secondaryCtaText}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
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

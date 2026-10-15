"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";

export function Footer() {
  const footerRef = useRef<HTMLElement | null>(null);
  const watermarkRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!footerRef.current || !watermarkRef.current) return;
      if (isReducedMotion()) return;

      gsap.fromTo(
        watermarkRef.current,
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 0.18,
          duration: 1.0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: footerRef }
  );

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      ref={footerRef}
      className="relative border-t border-white/[0.08] bg-[#070707] text-[#909090] overflow-hidden select-none"
    >
      <div className="max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] w-full mx-auto px-5 sm:px-8 lg:px-12 2xl:px-16 3xl:px-24 pt-12 sm:pt-16 pb-6 relative z-10 text-left">
        {/* Top Action Ribbon */}
        <div className="border-b border-white/[0.08] pb-6 mb-12 flex items-center justify-end">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#A0A0A0] hover:text-white transition-colors"
          >
            <span>Initiate Project Consultation</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Main 4-Column Minimal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Info (Col span 5) */}
          <div className="lg:col-span-5 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group w-fit"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#141414] border border-white/[0.12] text-[#F5F5F3] font-bold text-xs tracking-wider transition-colors group-hover:bg-[#1C1C1C]">
                W
              </span>
              <span className="font-bold text-base text-[#F5F5F3] tracking-tight group-hover:text-white transition-colors">
                {siteConfig.name}
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#909090] max-w-sm leading-relaxed">
              Designing and engineering high-performance web applications, scalable cloud backends,
              and digital platforms for growing businesses and modern brands.
            </p>
          </div>

          {/* Column 2: Systems (Col span 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#F5F5F3] font-semibold">
              Systems
            </p>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/work"
                  className="text-[#9E9E9E] hover:text-white transition-colors block"
                >
                  Selected Case Studies
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-[#9E9E9E] hover:text-white transition-colors block"
                >
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-[#9E9E9E] hover:text-white transition-colors block"
                >
                  Pricing & Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[#9E9E9E] hover:text-white transition-colors block"
                >
                  About Founder
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#9E9E9E] hover:text-white transition-colors block"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Core Stack (Col span 2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#F5F5F3] font-semibold">
              Core Stack
            </p>
            <ul className="space-y-2.5 text-xs text-[#9E9E9E]">
              <li className="hover:text-white transition-colors">Next.js 14</li>
              <li className="hover:text-white transition-colors">PostgreSQL & Prisma</li>
              <li className="hover:text-white transition-colors">TypeScript</li>
              <li className="hover:text-white transition-colors">Tailwind CSS</li>
              <li className="hover:text-white transition-colors">GSAP Motion</li>
            </ul>
          </div>

          {/* Column 4: Connect (Col span 2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#F5F5F3] font-semibold">
              Connect
            </p>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#9E9E9E] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#9E9E9E] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Twitter / X</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#9E9E9E] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#9E9E9E] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Direct Inquiries</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Navigation */}
        <div className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#707070]">
          <p className="text-[#8A8A8A] text-[11px] font-mono text-center sm:text-left">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#8A8A8A] hover:text-white transition-colors cursor-pointer"
            aria-label="Back to top of page"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dedicated Dramatic Typographic Brand Watermark (Zero Overlap with Items) */}
      <div className="relative w-full overflow-hidden flex justify-center pointer-events-none -mb-3 sm:-mb-6 lg:-mb-8">
        <div
          ref={watermarkRef}
          className="font-bold text-[18vw] leading-[0.76] tracking-tighter text-white opacity-0 whitespace-nowrap will-change-transform select-none"
          aria-hidden="true"
        >
          WEBGENT
        </div>
      </div>
    </footer>
  );
}

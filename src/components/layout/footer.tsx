"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { Shield } from "lucide-react";
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

  return (
    <footer
      ref={footerRef}
      className="relative border-t border-white/[0.08] bg-[#080808] text-[#909090] overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 relative z-10 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-base text-[#F5F5F3] group w-fit"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#141414] border border-white/[0.12] text-[#F5F5F3] font-bold text-xs tracking-wider transition-colors group-hover:bg-[#1C1C1C]">
                W
              </span>
              <span className="font-bold text-[#F5F5F3] tracking-tight">{siteConfig.name}</span>
            </Link>
            <p className="text-xs sm:text-sm text-[#909090] max-w-sm leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] border border-white/[0.08] text-[#8A8A8A] hover:text-[#F0F0EE] transition-colors text-[11px]"
              >
                <Shield className="w-3.5 h-3.5 text-[#8A8A8A]" />
                <span>Admin Console</span>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#F5F5F3] uppercase tracking-wider font-mono">
              Navigation
            </p>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="text-[#8A8A8A] hover:text-[#F0F0EE] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/work"
                  className="text-[#8A8A8A] hover:text-[#F0F0EE] transition-colors"
                >
                  Case Studies & Work
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-[#8A8A8A] hover:text-[#F0F0EE] transition-colors"
                >
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/testimonials"
                  className="text-[#8A8A8A] hover:text-[#F0F0EE] transition-colors"
                >
                  Client Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#8A8A8A] hover:text-[#F0F0EE] transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture Pillars */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#F5F5F3] uppercase tracking-wider font-mono">
              Core Stack
            </p>
            <ul className="space-y-2.5 text-xs text-[#8A8A8A]">
              <li>Next.js 14 App Router</li>
              <li>PostgreSQL & Prisma ORM</li>
              <li>TypeScript & Zod</li>
              <li>Cloudflare R2 & Edge</li>
              <li>Three.js & GSAP Motion</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <NewsletterForm variant="footer" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666] text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-[#8A8A8A] text-[11px] font-mono">
            <span>TypeScript</span>
            <span>•</span>
            <span>Next.js 14</span>
            <span>•</span>
            <span>Prisma</span>
            <span>•</span>
            <span>PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* Dramatic Typographic Watermark Reveal in Background */}
      <div
        ref={watermarkRef}
        className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 font-bold text-[18vw] leading-none tracking-tighter text-white opacity-0 whitespace-nowrap will-change-transform"
        aria-hidden="true"
      >
        WEBGENT
      </div>
    </footer>
  );
}

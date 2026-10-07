"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { CtaLink } from "@/components/ui/cta-link";
import { Menu, X, ArrowRight } from "lucide-react";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navContainerRef = useRef<HTMLElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth active indicator movement using GSAP
  useEffect(() => {
    if (!navContainerRef.current || !indicatorRef.current || isReducedMotion()) return;

    const activeEl = navContainerRef.current.querySelector<HTMLElement>("[data-active='true']");
    if (activeEl) {
      const { offsetLeft, offsetWidth } = activeEl;
      gsap.to(indicatorRef.current, {
        x: offsetLeft,
        width: offsetWidth,
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
      });
    } else {
      gsap.to(indicatorRef.current, { opacity: 0, duration: 0.2 });
    }
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-all duration-300 ${
        isScrolled
          ? "border-white/[0.12] bg-[#080808]/95 shadow-[0_8px_30px_rgba(0,0,0,0.7)]"
          : "border-white/[0.07] bg-[#080808]/85"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-12 transition-all duration-300 ${
          isScrolled ? "h-14" : "h-16"
        }`}
      >
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-base text-[#F5F5F3] group shrink-0"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#141414] border border-white/[0.12] text-[#F5F5F3] font-bold text-xs tracking-wider transition-colors group-hover:bg-[#1C1C1C]">
              W
            </span>
            <span className="tracking-tight font-bold text-[#F5F5F3] group-hover:text-white transition-colors">
              {siteConfig.name}
            </span>
          </Link>

          <nav
            ref={navContainerRef}
            aria-label="Main Navigation"
            className="relative hidden md:flex items-center gap-1 text-sm font-medium p-1 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            {/* Smooth animated active pill indicator */}
            <div
              ref={indicatorRef}
              className="absolute h-[calc(100%-8px)] rounded-lg bg-white/[0.08] border border-white/[0.08] pointer-events-none opacity-0 transition-opacity"
              style={{ top: "4px", left: "0px" }}
              aria-hidden="true"
            />

            {siteConfig.mainNav.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={isActive ? "true" : "false"}
                  className={`relative z-10 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "text-[#F0F0EE] font-semibold"
                      : "text-[#8A8A8A] hover:text-[#F0F0EE] hover:bg-white/[0.02]"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <CtaLink
            href="/contact"
            label="Header Start Project"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E8E8E6] hover:bg-[#FFFFFF] text-[#080808] font-medium text-xs transition-colors"
          >
            <span>Start Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </CtaLink>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg bg-[#111111] border border-white/[0.08] text-[#909090] hover:text-[#F5F5F3]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#0A0A0A] px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
            {siteConfig.mainNav.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#F0F0EE] bg-white/[0.06] font-semibold"
                      : "text-[#8A8A8A] hover:text-[#F0F0EE]"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-white/[0.08]">
            <CtaLink
              href="/contact"
              label="Mobile Menu Start Project"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#E8E8E6] hover:bg-[#FFFFFF] text-[#080808] font-medium text-xs transition-colors"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </CtaLink>
          </div>
        </div>
      )}
    </header>
  );
}

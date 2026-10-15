"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { CtaLink } from "@/components/ui/cta-link";
import { Menu, X, ArrowRight } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#080808]/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          : "bg-transparent backdrop-blur-[2px]"
      }`}
    >
      <div
        className={`max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] w-full mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-12 2xl:px-16 3xl:px-24 transition-all duration-300 ${
          isScrolled ? "h-14" : "h-16 sm:h-20"
        }`}
      >
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-base text-[#F5F5F3] group shrink-0"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#161616] text-[#F5F5F3] font-bold text-xs tracking-wider transition-colors group-hover:bg-[#202020]">
              W
            </span>
            <span className="tracking-tight font-bold text-[#F5F5F3] group-hover:text-white transition-colors">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Nav - Pure minimal text links (zero background) */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-7 lg:gap-8 text-xs font-medium"
          >
            {siteConfig.mainNav.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors py-1 ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-[#8A8A8A] hover:text-white"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right CTA & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <CtaLink
            href="/contact"
            label="Header Start Project"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E8E8E6] hover:bg-[#FFFFFF] text-[#080808] font-medium text-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Start Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </CtaLink>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg bg-[#141414] text-[#909090] hover:text-[#F5F5F3] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Minimal text links (zero background on items) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0A0A]/95 backdrop-blur-xl px-6 py-5 space-y-4 shadow-2xl border-b border-white/[0.08]">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-2">
            {siteConfig.mainNav.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-[#8A8A8A] hover:text-white"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2">
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

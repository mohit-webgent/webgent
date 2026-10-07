"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { CtaLink } from "@/components/ui/cta-link";
import { Menu, X, ArrowRight } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#080808]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-5 sm:px-8 lg:px-12">
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
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1 text-sm font-medium"
          >
            {siteConfig.mainNav.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "text-[#F0F0EE] bg-white/[0.06] font-semibold"
                      : "text-[#8A8A8A] hover:text-[#F0F0EE] hover:bg-white/[0.03]"
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
        <div className="md:hidden border-b border-white/[0.08] bg-[#0A0A0A] px-4 py-4 space-y-3">
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
                      ? "text-[#F0F0EE] bg-white/[0.06]"
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

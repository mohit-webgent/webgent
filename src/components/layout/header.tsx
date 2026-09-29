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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-white group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform font-extrabold text-sm">
              W
            </span>
            <span className="tracking-tight font-extrabold text-white group-hover:text-indigo-300 transition-colors">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
            {siteConfig.mainNav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? "text-white bg-slate-800/80 font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop CTA & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <CtaLink
            href="/contact"
            label="Header Start Project"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 hover:scale-105"
          >
            <span>Start Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </CtaLink>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {siteConfig.mainNav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "text-white bg-indigo-600/20 border border-indigo-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-800">
            <CtaLink
              href="/contact"
              label="Mobile Menu Start Project"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
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

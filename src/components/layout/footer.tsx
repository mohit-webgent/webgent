import Link from "next/link";
import { siteConfig } from "@/config/site";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#080808] text-[#909090]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
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

          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#F5F5F3] uppercase tracking-wider font-mono">
              Navigation
            </p>
            <ul className="space-y-2 text-xs">
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

          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#F5F5F3] uppercase tracking-wider font-mono">
              Capabilities
            </p>
            <ul className="space-y-2 text-xs text-[#8A8A8A]">
              <li>Web Application Architecture</li>
              <li>Cloud & Microservices</li>
              <li>Next.js & React Systems</li>
              <li>Database & API Engineering</li>
              <li>UI/UX Design Systems</li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <NewsletterForm variant="footer" />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666] text-center sm:text-left">
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
    </footer>
  );
}

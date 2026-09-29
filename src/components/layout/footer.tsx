import Link from "next/link";
import { siteConfig } from "@/config/site";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1 & 2: Brand Information */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-white group w-fit">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white font-extrabold text-sm shadow-md shadow-indigo-600/30">
                W
              </span>
              <span className="font-extrabold text-white tracking-tight">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin Console</span>
              </Link>
            </div>
          </div>

          {/* Column 3: Navigation Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              Navigation
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/work" className="hover:text-white transition-colors">
                  Case Studies & Work
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-white transition-colors">
                  Client Reviews
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Services */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              Capabilities
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Web Application Architecture</li>
              <li>Cloud & Microservices</li>
              <li>Next.js & React Systems</li>
              <li>Database & API Engineering</li>
              <li>UI/UX Design Systems</li>
            </ul>
          </div>

          {/* Column 5: Embedded Newsletter Subscription */}
          <div className="lg:col-span-1">
            <NewsletterForm variant="footer" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>TypeScript</span>
            <span>•</span>
            <span>Next.js 14 App Router</span>
            <span>•</span>
            <span>Prisma ORM</span>
            <span>•</span>
            <span>PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

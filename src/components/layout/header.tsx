import Link from "next/link";
import { siteConfig } from "@/config/site";
import { CtaLink } from "@/components/ui/cta-link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              W
            </span>
            <span>{siteConfig.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-slate-300 hover:text-indigo-400 transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <CtaLink
            href="/contact"
            label="Header Start Project"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm shadow-indigo-600/20"
          >
            Start Project
          </CtaLink>
        </div>
      </div>
    </header>
  );
}

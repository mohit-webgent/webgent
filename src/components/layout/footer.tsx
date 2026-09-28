import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-slate-400">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 gap-4 text-xs">
        <p>© {new Date().getFullYear()} {siteConfig.name}. Production-grade project foundation.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <span>TypeScript</span>
          <span>•</span>
          <span>Next.js 14 App Router</span>
          <span>•</span>
          <span>Prisma</span>
          <span>•</span>
          <span>Zod</span>
        </div>
      </div>
    </footer>
  );
}

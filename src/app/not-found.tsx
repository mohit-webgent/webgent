import Link from "next/link";
import { FileQuestion, Briefcase, BookOpen, Mail, Home } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Webgent",
  description: "The page or resource you are looking for does not exist or has been relocated.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans bg-[#080808]">
      <div className="max-w-xl w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-8 sm:p-12 text-center shadow-2xl relative z-10 space-y-8">
        <div className="p-4 rounded-xl bg-[#141414] border border-white/[0.10] text-[#E5E5E3] w-16 h-16 mx-auto flex items-center justify-center">
          <FileQuestion className="w-8 h-8 text-[#E8E8E6]" />
        </div>

        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.10] text-[#A0A0A0] text-xs font-mono uppercase tracking-wider">
            404 Error
          </span>
          <h1 className="text-3xl sm:text-4xl font-light text-[#F5F5F3] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-[#969696] max-w-md mx-auto leading-relaxed">
            The page or resource you requested could not be located. It may have been moved,
            renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left">
          <Link
            href="/work"
            className="p-3.5 rounded-lg bg-[#111111] border border-white/[0.06] hover:border-white/[0.16] hover:bg-[#151515] transition-colors group"
          >
            <div className="flex items-center gap-2 text-[#E5E5E3] group-hover:text-white font-mono text-xs mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Case Studies</span>
            </div>
            <p className="text-[11px] text-[#666666]">Production telemetry</p>
          </Link>

          <Link
            href="/blog"
            className="p-3.5 rounded-lg bg-[#111111] border border-white/[0.06] hover:border-white/[0.16] hover:bg-[#151515] transition-colors group"
          >
            <div className="flex items-center gap-2 text-[#E5E5E3] group-hover:text-white font-mono text-xs mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Technical Notes</span>
            </div>
            <p className="text-[11px] text-[#666666]">Engineering insights</p>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#E8E8E6] hover:bg-white text-[#080808] font-medium text-xs transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] text-[#E5E5E3] border border-white/[0.12] font-medium text-xs transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Studio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

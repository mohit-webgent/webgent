import Link from "next/link";
import { FileQuestion, ArrowLeft, Briefcase, BookOpen, Mail, Home } from "lucide-react";
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
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl relative z-10 space-y-8">
        <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-20 h-20 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <FileQuestion className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            404 Error
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The page or resource you requested could not be located. It may have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        {/* Quick Explore Shortcuts */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <Link
            href="/work"
            className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/50 transition-all group"
          >
            <div className="flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300 font-semibold text-xs mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Case Studies</span>
            </div>
            <p className="text-[11px] text-slate-400">View customer projects</p>
          </Link>

          <Link
            href="/blog"
            className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/50 transition-all group"
          >
            <div className="flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300 font-semibold text-xs mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Tech Blog</span>
            </div>
            <p className="text-[11px] text-slate-400">Engineering insights</p>
          </Link>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 hover:scale-105"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

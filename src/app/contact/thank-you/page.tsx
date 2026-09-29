import Link from "next/link";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inquiry Received — Webgent",
  description: "Thank you for reaching out to Webgent. Our engineering team is reviewing your project details.",
};

export default function ContactThankYouPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans flex items-center justify-center">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl relative z-10 space-y-8">
        <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-3xl w-20 h-20 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <span>Inquiry Dispatched Successfully</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            We&apos;ve Received Your Message!
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Thank you for reaching out to Webgent. An automated confirmation has been sent to your email, and a principal architect will review your project requirements within 24 hours.
          </p>
        </div>

        {/* What to expect card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-left text-xs space-y-3">
          <p className="font-bold text-white uppercase tracking-wider text-[10px]">
            What Happens Next?
          </p>
          <div className="space-y-2 text-slate-300">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                1
              </span>
              <span>Initial architectural review of your goals and technical scope.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                2
              </span>
              <span>We schedule a direct 30-minute discovery call with our technical lead.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                3
              </span>
              <span>You receive a transparent project proposal, timeline, and architectural roadmap.</span>
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/work"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
          >
            <span>Explore Portfolio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

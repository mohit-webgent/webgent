import Link from "next/link";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inquiry Received | Webgent",
  description:
    "Thank you for reaching out to Webgent. Our engineering team is reviewing your project details.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/contact/thank-you",
  },
};

export default function ContactThankYouPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F3] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans flex items-center justify-center">
      <div className="max-w-xl w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-8 sm:p-12 text-center shadow-2xl relative z-10 space-y-8">
        <div className="p-4 bg-[#141414] text-[#E5E5E3] border border-white/[0.10] rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#E8E8E6]" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.10] text-[#A0A0A0] text-xs font-mono uppercase tracking-wider">
            <span>Inquiry Dispatched Successfully</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-[#F5F5F3] tracking-tight">
            We&apos;ve Received Your Message.
          </h1>
          <p className="text-sm text-[#969696] leading-relaxed">
            Thank you for reaching out to Webgent. An automated confirmation has been sent to your
            email, and a principal architect will review your project requirements within 24 hours.
          </p>
        </div>

        <div className="bg-[#111111] border border-white/[0.06] rounded-lg p-5 text-left text-xs space-y-3">
          <p className="font-mono text-[#A0A0A0] uppercase tracking-wider text-[10px]">
            What Happens Next
          </p>
          <div className="space-y-2 text-[#969696]">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-white/[0.05] border border-white/[0.08] text-[#E5E5E3] font-mono flex items-center justify-center shrink-0 text-[10px]">
                1
              </span>
              <span>Initial architectural review of your goals and technical scope.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-white/[0.05] border border-white/[0.08] text-[#E5E5E3] font-mono flex items-center justify-center shrink-0 text-[10px]">
                2
              </span>
              <span>Direct discovery alignment with our technical leadership.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-white/[0.05] border border-white/[0.08] text-[#E5E5E3] font-mono flex items-center justify-center shrink-0 text-[10px]">
                3
              </span>
              <span>
                Receipt of transparent project proposal, timeline, and architectural roadmap.
              </span>
            </div>
          </div>
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
            href="/work"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] text-[#E5E5E3] border border-white/[0.12] font-medium text-xs transition-colors"
          >
            <span>Explore Engineering Work</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

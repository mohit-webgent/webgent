import Link from "next/link";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Inquiry Received",
  description:
    "Thank you for reaching out to Webgent. Your project details are being reviewed.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/contact/thank-you",
  },
  openGraph: {
    title: "Inquiry Received | Webgent",
    description:
      "Thank you for reaching out to Webgent. Your project details are being reviewed.",
    url: `${siteConfig.url}/contact/thank-you`,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inquiry Received | Webgent",
    description:
      "Thank you for reaching out to Webgent. Your project details are being reviewed.",
  },
};

export default function ContactThankYouPage() {
  return (
    <div className="min-h-screen bg-canvas text-fg py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans flex items-center justify-center">
      <div className="max-w-xl w-full bg-surface border border-line rounded-xl p-8 sm:p-12 text-center shadow-2xl relative z-10 space-y-8">
        <div className="p-4 bg-surface-2 text-fg border border-line rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-fg" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-line text-fg-muted text-xs font-mono uppercase tracking-wider">
            <span>Message sent</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-fg tracking-tight">
            Thanks, your message is in.
          </h1>
          <p className="text-sm text-fg-muted leading-relaxed">
            Thank you for reaching out to Webgent. An automated confirmation has been sent to your
            email, and Mohit will review your project requirements within 24 hours.
          </p>
        </div>

        <div className="bg-surface border border-line rounded-lg p-5 text-left text-xs space-y-3">
          <p className="font-mono text-fg-muted uppercase tracking-wider text-xs">
            What Happens Next
          </p>
          <div className="space-y-2 text-fg-muted">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-white/[0.05] border border-line text-fg font-mono flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <span>Mohit reviews your goals and what you need built.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-white/[0.05] border border-line text-fg font-mono flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <span>A short conversation to confirm the details.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded bg-white/[0.05] border border-line text-fg font-mono flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <span>
                You receive a clear proposal with scope, timeline and price.
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-accent-fg font-medium text-xs transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </Link>

          <Link
            href="/work"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-surface-2 hover:bg-surface-2 text-fg border border-line font-medium text-xs transition-colors"
          >
            <span>See the work</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

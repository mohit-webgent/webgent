import { prisma } from "@/lib/db";
import { Star, MessageSquareQuote, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Client Testimonials & Reviews | Webgent",
  description:
    "Read verified reviews and feedback from enterprise leaders, founders, and CTOs who partnered with Webgent for high-performance software engineering.",
  alternates: {
    canonical: "/testimonials",
  },
  openGraph: {
    title: "Client Testimonials & Reviews | Webgent",
    description:
      "Verified reviews and feedback from founders and engineering leaders who build with Webgent.",
    url: `${siteConfig.url}/testimonials`,
    siteName: siteConfig.name,
    images: [
      {
        url: "/api/og?title=Client+Testimonials+%26+Reviews&badge=Verified+Partners",
        width: 1200,
        height: 630,
        alt: "Webgent Testimonials",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Client Testimonials & Reviews | Webgent",
    description:
      "Read verified reviews and feedback from enterprise leaders, founders, and CTOs who partnered with Webgent.",
    images: ["/api/og?title=Client+Testimonials+%26+Reviews&badge=Verified+Partners"],
    creator: "@webgent",
  },
};

export default async function PublicTestimonialsPage() {
  let testimonials: Array<{
    id: string;
    clientName: string;
    clientTitle: string | null;
    company: string | null;
    content: string;
    avatarUrl: string | null;
    rating: number;
    featured: boolean;
  }> = [];

  try {
    testimonials = await prisma.testimonial.findMany({
      where: {
        status: "APPROVED",
        deletedAt: null,
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        clientName: true,
        clientTitle: true,
        company: true,
        content: true,
        avatarUrl: true,
        rating: true,
        featured: true,
      },
    });
  } catch {}

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Social Proof & Partner Feedback</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Trusted by Builders & Visionaries
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Hear directly from the founders, executives, and engineering leads who have scaled their
            businesses with Webgent.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center space-y-3 p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
            <MessageSquareQuote className="w-10 h-10 text-slate-600 mx-auto" />
            <h2 className="text-base font-bold text-white">Client Reviews Coming Soon</h2>
            <p className="text-xs text-slate-400">
              We are compiling our latest verified case studies and testimonials. Check back
              shortly!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-pink-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 shadow-xl group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    {t.featured && (
                      <span className="px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-bold">
                        Featured Review
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0 shadow-md">
                    {t.avatarUrl ? (
                      <img
                        src={t.avatarUrl}
                        alt={t.clientName}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      t.clientName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-white truncate">{t.clientName}</h3>
                    <p className="text-xs text-slate-400 truncate">
                      {t.clientTitle || "Partner"}
                      {t.company ? ` • ${t.company}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-500/20 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Achieve Extraordinary Results?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Partner with an engineering team dedicated to high performance, reliability, and
              precision craft.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-pink-600/30 transition-all hover:scale-105"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs rounded-xl transition-all"
            >
              <span>Explore Case Studies</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

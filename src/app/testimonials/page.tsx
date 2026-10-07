import { prisma } from "@/lib/db";
import { Star, MessageSquareQuote, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.02] border border-white/10 text-[#A0A0A0] text-xs font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span>TESTIMONIALS / VERIFIED FEEDBACK</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#F5F5F3] tracking-tight uppercase">
            Trusted by Builders & Visionaries
          </h1>
          <p className="text-sm sm:text-base text-[#909090]">
            Hear directly from the founders, executives, and engineering leads who have scaled their
            businesses with Webgent.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center space-y-3 p-8 rounded-xl bg-[#0D0D0D] border border-white/[0.08]">
            <MessageSquareQuote className="w-8 h-8 text-[#666666] mx-auto" />
            <h2 className="text-sm font-semibold text-[#F5F5F3]">Client Reviews Coming Soon</h2>
            <p className="text-xs text-[#909090]">
              We are compiling our latest verified case studies and testimonials. Check back
              shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-colors shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#B5B5B3]">
                      {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    {t.featured && (
                      <span className="px-2.5 py-0.5 rounded bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[10px] font-mono">
                        Featured Review
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#D0D0CE] leading-relaxed italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#161616] border border-white/[0.10] flex items-center justify-center text-[#E5E5E3] font-mono text-xs font-bold overflow-hidden shrink-0">
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
                    <h3 className="font-semibold text-xs text-[#F5F5F3] truncate">
                      {t.clientName}
                    </h3>
                    <p className="text-[10px] text-[#8A8A8A] truncate">
                      {t.clientTitle || "Partner"}
                      {t.company ? ` • ${t.company}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-8 sm:p-12 text-center space-y-6">
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F3] tracking-tight">
              Ready to Achieve Extraordinary Results?
            </h2>
            <p className="text-xs sm:text-sm text-[#909090]">
              Partner with an engineering team dedicated to high performance, reliability, and
              precision craft.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8E8E6] hover:bg-white text-[#080808] font-medium text-xs rounded-lg transition-colors"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-white/[0.04] text-[#E5E5E5] border border-white/14 font-medium text-xs rounded-lg transition-colors"
            >
              <span>Explore Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

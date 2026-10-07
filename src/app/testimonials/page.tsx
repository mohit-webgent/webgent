import { prisma } from "@/lib/db";
import { Star, MessageSquareQuote, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Card3DTilt } from "@/components/animations/card-tilt";
import { ClipReveal } from "@/components/animations/clip-reveal";
import { CtaLink } from "@/components/ui/cta-link";

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

  const featuredReview = testimonials.find((t) => t.featured) || testimonials[0];
  const remainingReviews = featuredReview
    ? testimonials.filter((t) => t.id !== featuredReview.id)
    : testimonials;

  return (
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto space-y-16 relative z-10 text-left">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.02] border border-white/10 text-[#A0A0A0] text-xs font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span>TESTIMONIALS / VERIFIED FEEDBACK</span>
          </div>
          <ClipReveal>
            <h1 className="text-4xl sm:text-6xl font-bold text-[#F5F5F3] tracking-tight uppercase">
              Trusted by Builders & Visionaries
            </h1>
          </ClipReveal>
          <p className="text-sm sm:text-base text-[#909090] leading-relaxed max-w-2xl mx-auto">
            Hear directly from the founders, executives, and engineering leads who have scaled their
            businesses and product architectures with Webgent.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center space-y-3 p-8 rounded-2xl bg-[#0D0D0D] border border-white/[0.08]">
            <MessageSquareQuote className="w-8 h-8 text-[#666666] mx-auto" />
            <h2 className="text-sm font-semibold text-[#F5F5F3]">Client Reviews Coming Soon</h2>
            <p className="text-xs text-[#909090]">
              We are compiling our latest verified case studies and testimonials. Check back
              shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Spotlight Editorial Review */}
            {featuredReview && (
              <div className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden transition-all duration-300">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-[#E5E5E3]">
                    {Array.from({ length: featuredReview.rating || 5 }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[10px] font-mono uppercase tracking-wider">
                    Executive Review
                  </span>
                </div>

                <blockquote className="text-lg sm:text-2xl text-[#F5F5F3] font-normal leading-relaxed italic max-w-4xl">
                  &ldquo;{featuredReview.content}&rdquo;
                </blockquote>

                <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#161616] border border-white/[0.10] flex items-center justify-center text-[#E5E5E3] font-mono text-sm font-bold overflow-hidden shrink-0">
                    {featuredReview.avatarUrl ? (
                      <img
                        src={featuredReview.avatarUrl}
                        alt={featuredReview.clientName}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      featuredReview.clientName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#F5F5F3] truncate">
                      {featuredReview.clientName}
                    </h3>
                    <p className="text-xs text-[#8A8A8A] truncate font-mono">
                      {featuredReview.clientTitle || "Partner"}
                      {featuredReview.company ? ` • ${featuredReview.company}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Grid of Other Verified Testimonials with 3D Tilt */}
            {remainingReviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingReviews.map((t) => (
                  <Card3DTilt key={t.id}>
                    <div className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.18] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-300 shadow-xl h-full min-h-[240px]">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[#E5E5E3]">
                            {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                              <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                          {t.featured && (
                            <span className="px-2 py-0.5 rounded bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[9.5px] font-mono">
                              Spotlight
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
                  </Card3DTilt>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA Footer */}
        <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-2xl p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F3] tracking-tight uppercase">
              Ready to Achieve Extraordinary Results?
            </h2>
            <p className="text-xs sm:text-sm text-[#909090] leading-relaxed">
              Partner with an engineering team dedicated to high performance, reliability, and
              precision craft.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <CtaLink
              href="/contact"
              label="Testimonials Start Project"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#E8E8E6] hover:bg-white text-[#080808] font-medium text-xs rounded-lg transition-colors"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </CtaLink>
            <CtaLink
              href="/work"
              label="Testimonials Explore Portfolio"
              className="inline-flex items-center gap-2 px-7 py-3 bg-transparent hover:bg-white/[0.04] text-[#E5E5E5] border border-white/14 font-medium text-xs rounded-lg transition-colors"
            >
              <span>Explore Portfolio</span>
            </CtaLink>
          </div>
        </div>
      </div>
    </div>
  );
}

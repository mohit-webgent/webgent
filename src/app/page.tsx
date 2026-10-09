import { HeroSection } from "@/components/home/hero-section";
import { InteractiveCapabilities } from "@/components/home/interactive-capabilities";
import { HowWeBuildSection } from "@/components/home/how-we-build-section";
import { HorizontalShowcase } from "@/components/home/horizontal-showcase";
import { ScrollReveal } from "@/components/animations";
import { Card3DTilt } from "@/components/animations/card-tilt";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  ArrowRight,
  Star,
} from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { CtaLink } from "@/components/ui/cta-link";
import type { Metadata } from "next";
import { logger } from "@/lib/logger";
import { siteConfig } from "@/config/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Webgent — Elite Web Solutions & Engineering Architecture",
  description:
    "Webgent designs and engineers high-performance web applications, scalable cloud backends, and digital platforms for ambitious modern brands.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Webgent — Elite Web Solutions & Engineering Architecture",
    description: "High-performance web applications, scalable cloud backends, and digital systems.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: "/api/og?title=Webgent&badge=Elite+Web+Engineering",
        width: 1200,
        height: 630,
        alt: "Webgent — Next-Gen Web Solutions",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webgent — Elite Web Solutions & Engineering Architecture",
    description: "High-performance web applications, scalable cloud backends, and digital systems.",
    images: ["/api/og?title=Webgent&badge=Elite+Web+Engineering"],
    creator: "@webgent",
    site: "@webgent",
  },
};

type HomePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  readTime: number | null;
  publishedAt: Date | null;
};

export default async function HomePage() {
  let featuredProjects: Awaited<ReturnType<typeof prisma.project.findMany>> = [];
  let testimonials: Awaited<ReturnType<typeof prisma.testimonial.findMany>> = [];
  let latestPosts: HomePost[] = [];

  try {
    const results = await Promise.all([
      prisma.project.findMany({
        where: { published: true, featured: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: 4,
      }),
      prisma.testimonial.findMany({
        where: { status: "APPROVED", deletedAt: null },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: 3,
      }),
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          readTime: true,
          publishedAt: true,
        },
      }),
    ]);
    featuredProjects = results[0];
    testimonials = results[1];
    latestPosts = results[2];
  } catch (error) {
    logger.warn(
      "Could not fetch dynamic database content for HomePage, using empty state fallback",
      { error },
    );
  }

  return (
    <div className="space-y-14 sm:space-y-24 pb-16 sm:pb-20 max-w-7xl mx-auto px-3.5 sm:px-8 lg:px-12 font-sans w-full">
      {/* 1. HERO SECTION (Approved Product Visual preserved with choreographed entrance & scroll story) */}
      <HeroSection />

      {/* 2. CAPABILITIES SECTION (Interactive Sticky Discipline) */}
      <InteractiveCapabilities />

      {/* 3. SIGNATURE 'HOW WE BUILD' 3D DIGITAL PRODUCT EVOLUTION */}
      <HowWeBuildSection />

      {/* 4. HORIZONTAL SCROLL STORYTELLING: FEATURED CASE STUDIES */}
      <HorizontalShowcase projects={featuredProjects} />

      {/* 5. TESTIMONIALS SECTION (Monochrome Editorial Atmosphere) */}
      <ScrollReveal as="section" className="space-y-10 border-t border-white/[0.06] pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono block">
              VERIFIED ARCHITECTURE / 04
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#F5F5F3] tracking-tight uppercase">
              What Founders & Clients Say
            </h2>
            <p className="text-xs sm:text-sm text-[#909090]">
              Direct feedback from technical leaders and founders building with Webgent.
            </p>
          </div>
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5E5E3] hover:text-white transition-colors"
          >
            <span>All Testimonials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {testimonials.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-white/[0.08] rounded-xl p-8">
            <p className="text-xs text-[#666666]">
              Client testimonials will appear here once approved by our editorial team.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <Card3DTilt key={t.id}>
                <div className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.18] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-5 transition-all duration-300 shadow-xl h-full min-h-[220px]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-[#E5E5E3]">
                      {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-[#D0D0CE] leading-relaxed italic line-clamp-4">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#161616] border border-white/[0.10] flex items-center justify-center text-[#E5E5E3] text-[11px] font-mono font-bold shrink-0">
                      {t.clientName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-[#F5F5F3] truncate">{t.clientName}</p>
                      <p className="text-[10px] text-[#8A8A8A] truncate">
                        {t.clientTitle || "Client"}
                        {t.company ? ` • ${t.company}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </Card3DTilt>
            ))}
          </div>
        )}
      </ScrollReveal>

      {/* 6. ENGINEERING BLOG (Monochrome Editorial Index) */}
      {latestPosts.length > 0 && (
        <ScrollReveal as="section" className="space-y-10 border-t border-white/[0.06] pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 text-left">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono block">
                TECHNICAL INDEX / 05
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#F5F5F3] tracking-tight uppercase">
                From the Engineering Blog
              </h2>
              <p className="text-xs sm:text-sm text-[#909090]">
                Technical deep dives into Next.js architecture, system design, and database resilience.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5E5E3] hover:text-white transition-colors"
            >
              <span>Explore All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {latestPosts.map((post) => (
              <div key={post.id}>
                <Card3DTilt>
                  <div className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.18] rounded-xl p-6 sm:p-7 space-y-4 flex flex-col justify-between transition-all duration-300 shadow-xl h-full min-h-[240px]">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-[#8A8A8A]">
                        <span className="px-2.5 py-0.5 rounded bg-[#141414] text-[#B5B5B3] border border-white/[0.08] font-mono">
                          {post.category || "Engineering"}
                        </span>
                        <span className="font-mono">{post.readTime || 4} min read</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[#F5F5F3] line-clamp-2">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-xs text-[#909090] line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/[0.06]">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8E8E6] hover:text-white transition-colors"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Card3DTilt>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* 7. NEWSLETTER */}
      <ScrollReveal as="section">
        <NewsletterForm
          variant="card"
          title="Subscribe to Engineering Insights"
          description="Receive curated articles on web performance, software architecture patterns, and Next.js best practices directly from our team."
        />
      </ScrollReveal>

      {/* 8. FOOTER CTA */}
      <ScrollReveal
        as="section"
        className="relative overflow-hidden rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-8 sm:p-14 md:p-16 text-center space-y-6 shadow-2xl"
      >
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#F5F5F3] tracking-tight uppercase">
            Have Something Worth Building?
          </h2>
          <p className="text-xs sm:text-sm text-[#909090] max-w-xl mx-auto leading-relaxed">
            Let&apos;s turn your vision into high-scale software. Speak directly with a principal
            architect today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 pt-2">
          <CtaLink
            href="/contact"
            label="Home Footer Start Project"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-[#E8E8E6] hover:bg-[#FFFFFF] text-[#080808] font-medium text-xs rounded-lg transition-colors"
          >
            Start Your Project
          </CtaLink>
          <CtaLink
            href="/work"
            label="Home Footer Browse Work"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-transparent hover:bg-white/[0.04] text-[#E5E5E5] border border-white/14 font-medium text-xs rounded-lg transition-colors"
          >
            Browse Case Studies
          </CtaLink>
        </div>
      </ScrollReveal>
    </div>
  );
}

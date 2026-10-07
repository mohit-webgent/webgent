import { HeroResponsiveVisual } from "@/components/home/hero-responsive-visual";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  ShieldCheck,
  Star,
  ExternalLink,
  Zap,
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
        take: 3,
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

  const capabilities = [
    {
      icon: <Layers className="w-5 h-5 text-[#D0D0CE]" />,
      title: "Full-Stack Web Applications",
      description:
        "Engineered with Next.js 14 App Router, TypeScript, and React Server Components for maximum speed and SEO dominance.",
    },
    {
      icon: <Cpu className="w-5 h-5 text-[#D0D0CE]" />,
      title: "Cloud & Backend Systems",
      description:
        "Robust database architectures, PostgreSQL with Prisma ORM, and serverless Cloudflare R2 object storage integrations.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#D0D0CE]" />,
      title: "Enterprise Security & Auth",
      description:
        "NextAuth v5 session management, BCrypt hashing, role-based route guards, and zero-compromise push protection.",
    },
    {
      icon: <Zap className="w-5 h-5 text-[#D0D0CE]" />,
      title: "Real-Time Notifications & AI",
      description:
        "Multi-provider dispatch engines spanning WhatsApp Business, Twilio, Slack webhooks, and Resend transactional emails.",
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-16 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 font-sans w-full">
      {/* HERO SECTION (Dark Canvas with Transparent Responsive Laptop + Mobile Mockup) */}
      <section className="relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 sm:py-20 lg:py-0 overflow-x-clip lg:overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 xl:gap-16 items-center w-full">
          <div className="lg:col-span-6 xl:col-span-6 space-y-8 text-left z-10">
            <div className="text-[11px] sm:text-xs font-mono tracking-[0.22em] text-[#8A8A8A] uppercase">
              WEBGENT <span className="text-[#444444] mx-2">/</span> DIGITAL ENGINEERING STUDIO
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[4.75rem] xl:text-[5.25rem] font-bold tracking-[-0.035em] leading-[0.95] uppercase text-[#F5F5F3]">
              WE BUILD
              <br />
              <span className="text-[#A8A8A8]">DIGITAL</span>
              <br />
              SYSTEMS.
            </h1>

            <p className="text-base sm:text-lg lg:text-[19px] text-[#8A8A8A] max-w-[520px] leading-[1.6] font-normal">
              We design and build digital products for ambitious businesses.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
              <CtaLink
                href="/contact"
                label="Hero Start Project"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-[#E8E8E6] hover:bg-[#FFFFFF] text-[#080808] font-medium text-xs sm:text-sm tracking-wide transition-colors"
              >
                <span>START YOUR PROJECT</span>
                <ArrowRight className="w-4 h-4" />
              </CtaLink>

              <CtaLink
                href="/work"
                label="Hero Browse Work"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-transparent hover:bg-white/[0.04] text-[#E5E5E3] border border-white/[0.12] hover:border-white/[0.20] font-medium text-xs sm:text-sm tracking-wide transition-colors"
              >
                <span>EXPLORE PORTFOLIO</span>
                <ArrowRight className="w-4 h-4 opacity-50" />
              </CtaLink>
            </div>
          </div>

          <div className="lg:col-span-6 xl:col-span-6 relative w-full flex items-center justify-center lg:justify-end min-w-0">
            <HeroResponsiveVisual />
          </div>
        </div>
      </section>

      {/* CAPABILITIES SECTION (Dark Mode) */}
      <section className="space-y-10">
        <div className="space-y-2 max-w-2xl text-left">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono block">
            CAPABILITIES / 01
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F3] tracking-tight">
            End-to-End Architectural Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-[#909090]">
            From initial system architecture to resilient cloud production deployments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((item) => (
            <div
              key={item.title}
              className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-6 space-y-4 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="p-2.5 rounded-lg bg-[#141414] border border-white/[0.08] w-fit">
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold text-[#F5F5F3]">{item.title}</h3>
                <p className="text-xs text-[#909090] leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED CASE STUDIES (UNIQUE LIGHT BACKGROUND & DARK TEXT) */}
      <section className="relative overflow-hidden bg-[#F4F4F0] p-7 sm:p-12 lg:p-14 border border-black/[0.06] shadow-2xl text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#666666] font-mono block">
              SELECTED SYSTEMS / 02
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A0A0A] tracking-tight">
              Featured Case Studies
            </h2>
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] hover:text-[#555555] transition-colors"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredProjects.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-black/[0.12] rounded-2xl p-8 space-y-2">
            <Code2 className="w-6 h-6 text-[#777777] mx-auto" />
            <p className="text-xs font-semibold text-[#0A0A0A]">Featured Projects Coming Soon</p>
            <p className="text-[11px] text-[#777777]">
              Browse our portfolio archive for recent customer deployments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-[#FFFFFF] border border-black/[0.08] hover:border-black/[0.20] rounded-2xl p-6 sm:p-7 space-y-5 transition-all duration-300 flex flex-col justify-between shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_30px_-6px_rgba(0,0,0,0.12)] group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#F0F0EC] text-[#0A0A0A] border border-black/[0.08] text-[10px] font-mono uppercase tracking-wider font-medium">
                      {project.category || "Case Study"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-mono font-medium">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0A0A0A] tracking-tight group-hover:text-black transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#555555] mt-2 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                  <Link
                    href={`/work/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] hover:text-[#555555] transition-colors"
                  >
                    <span>Read Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-[#555555] hover:text-[#0A0A0A] hover:bg-black/[0.05] transition-colors"
                      title="View Live Demo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TESTIMONIALS SECTION (Dark Mode) */}
      <section className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono block">
              VERIFIED ARCHITECTURE / 03
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F3] tracking-tight">
              What Founders & Clients Say
            </h2>
          </div>
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E8E8E6] hover:text-white transition-colors"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-6 flex flex-col justify-between space-y-5 transition-colors shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[#B5B5B3]">
                    {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[#D0D0CE] leading-relaxed italic line-clamp-4">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3">
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
            ))}
          </div>
        )}
      </section>

      {/* ENGINEERING BLOG (Dark Mode) */}
      {latestPosts.length > 0 && (
        <section className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 text-left">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono block">
                TECHNICAL INDEX / 04
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F3] tracking-tight">
                From the Engineering Blog
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E8E8E6] hover:text-white transition-colors"
            >
              <span>Explore All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-6 space-y-4 flex flex-col justify-between transition-colors shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-[#8A8A8A]">
                    <span className="px-2.5 py-0.5 rounded bg-[#141414] text-[#B5B5B3] border border-white/[0.08] font-mono">
                      {post.category || "Engineering"}
                    </span>
                    <span className="font-mono">{post.readTime || 4} min read</span>
                  </div>

                  <h3 className="text-base font-semibold text-[#F5F5F3] line-clamp-2">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-xs text-[#909090] line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.06]">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E8E8E6] hover:text-white transition-colors"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NEWSLETTER (Dark Mode Card) */}
      <section>
        <NewsletterForm
          variant="card"
          title="Subscribe to Engineering Insights"
          description="Receive curated articles on web performance, software architecture patterns, and Next.js best practices directly from our team."
        />
      </section>

      {/* FOOTER CTA (Dark Mode) */}
      <section className="relative overflow-hidden rounded-xl bg-[#0D0D0D] border border-white/[0.08] p-6 sm:p-12 md:p-14 text-center space-y-6">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#F5F5F3] tracking-tight">
            Ready to Build Your Next Digital Product?
          </h2>
          <p className="text-xs sm:text-sm text-[#909090] max-w-xl mx-auto">
            Let&apos;s turn your vision into high-scale software. Speak directly with a principal
            architect today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <CtaLink
            href="/contact"
            label="Home Footer Start Project"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#E8E8E6] hover:bg-[#FFFFFF] text-[#080808] font-medium text-xs rounded-lg transition-colors"
          >
            Start Your Project
          </CtaLink>
          <CtaLink
            href="/work"
            label="Home Footer Browse Work"
            className="inline-flex items-center justify-center px-6 py-3 bg-transparent hover:bg-white/[0.04] text-[#E5E5E5] border border-white/14 font-medium text-xs rounded-lg transition-colors"
          >
            Browse Case Studies
          </CtaLink>
        </div>
      </section>
    </div>
  );
}

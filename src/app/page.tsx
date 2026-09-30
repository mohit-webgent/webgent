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
  Sparkles,
  Zap,
} from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { CtaLink } from "@/components/ui/cta-link";
import type { Metadata } from "next";

import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Webgent — Elite Web Solutions & Engineering Architecture",
  description:
    "Webgent designs and engineers high-performance web applications, cloud backends, and digital platforms for ambitious modern brands.",
  openGraph: {
    title: "Webgent — Elite Web Solutions & Engineering Architecture",
    description:
      "High-performance web applications, scalable cloud backends, and digital systems.",
    type: "website",
  },
};

export default async function HomePage() {
  // Parallel fetch real database content for the public showcase
  let featuredProjects: any[] = [];
  let testimonials: any[] = [];
  let latestPosts: any[] = [];

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
    logger.warn("Could not fetch dynamic database content for HomePage, using empty state fallback", { error });
  }

  const capabilities = [
    {
      icon: <Layers className="w-6 h-6 text-indigo-400" />,
      title: "Full-Stack Web Applications",
      description:
        "Engineered with Next.js 14 App Router, TypeScript, and React Server Components for maximum speed and SEO dominance.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-cyan-400" />,
      title: "Cloud & Backend Systems",
      description:
        "Robust database architectures, PostgreSQL with Prisma ORM, and serverless Cloudflare R2 object storage integrations.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: "Enterprise Security & Auth",
      description:
        "NextAuth v5 session management, BCrypt hashing, role-based route guards, and zero-compromise push protection.",
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Real-Time Notifications & AI",
      description:
        "Multi-provider dispatch engines spanning WhatsApp Business, Twilio, Slack webhooks, and Resend transactional emails.",
    },
  ];

  return (
    <div className="space-y-24 py-8 max-w-7xl mx-auto font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20 text-center space-y-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide shadow-sm animate-in fade-in duration-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Software & Web Engineering</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Engineering High-Performance Web Applications
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            We architect and build bespoke digital software platforms, cloud infrastructure, and conversion-engineered web experiences for ambitious modern brands.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <CtaLink
              href="/contact"
              label="Hero Start Project"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-4 h-4" />
            </CtaLink>

            <CtaLink
              href="/work"
              label="Hero Browse Work"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition-all"
            >
              <span>Explore Portfolio</span>
            </CtaLink>
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES */}
      <section className="space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Engineered For Scale
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            End-to-End Architectural Capabilities
          </p>
          <p className="text-sm text-slate-400">
            From initial system architecture to resilient cloud production deployments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((item) => (
            <div
              key={item.title}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 sm:p-7 space-y-4 transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 w-fit group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED WORK / PROJECTS */}
      <section className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Selected Work
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured Case Studies
            </p>
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredProjects.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-800 rounded-3xl p-8 space-y-2">
            <Code2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Featured Projects Coming Soon</p>
            <p className="text-xs text-slate-400">
              Browse our portfolio archive for recent customer deployments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-7 space-y-5 transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                      {project.category || "Case Study"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                      <Star className="w-3 h-3 fill-current" /> Featured
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/work/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-emerald-400 transition-colors"
                  >
                    <span>Read Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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

      {/* 4. CLIENT TESTIMONIALS */}
      <section className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-pink-400">
              Verified Feedback
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              What Founders & Clients Say
            </p>
          </div>
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors"
          >
            <span>All Testimonials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {testimonials.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-800 rounded-3xl p-8">
            <p className="text-xs text-slate-400">
              Client testimonials will appear here once approved by our editorial team.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-pink-500/30 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5 transition-all shadow-xl group"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-4">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                    {t.clientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-white truncate">
                      {t.clientName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
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

      {/* 5. LATEST BLOG POSTS */}
      {latestPosts.length > 0 && (
        <section className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Technical Insights
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                From the Engineering Blog
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Explore All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                      {post.category || "Engineering"}
                    </span>
                    <span>{post.readTime || 4} min read</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
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

      {/* 6. NEWSLETTER SUBSCRIPTION */}
      <section>
        <NewsletterForm
          variant="card"
          title="Subscribe to Engineering Insights"
          description="Receive curated articles on web performance, software architecture patterns, and Next.js best practices directly from our team."
        />
      </section>

      {/* 7. HIGH-CONVERSION BOTTOM CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 p-8 sm:p-14 text-center space-y-6">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Build Your Next Digital Product?
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Let&apos;s turn your vision into high-scale software. Speak directly with a principal architect today.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <CtaLink
            href="/contact"
            label="Home Footer Start Project"
            className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
          >
            Start Your Project
          </CtaLink>
          <CtaLink
            href="/work"
            label="Home Footer Browse Work"
            className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs rounded-xl transition-all"
          >
            Browse Case Studies
          </CtaLink>
        </div>
      </section>
    </div>
  );
}

import { HeroSection } from "@/components/home/hero-section";
import { InteractiveCapabilities } from "@/components/home/interactive-capabilities";
import { HowWeBuildSection } from "@/components/home/how-we-build-section";
import { HorizontalShowcase } from "@/components/home/horizontal-showcase";
import { ArcTestimonials } from "@/components/home/arc-testimonials";
import { EngineeringBlogSection } from "@/components/home/engineering-blog-section";
import { ScrollReveal } from "@/components/animations";
import { prisma } from "@/lib/db";
import { CtaLink } from "@/components/ui/cta-link";
import type { Metadata } from "next";
import { logger } from "@/lib/logger";
import { siteConfig } from "@/config/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: "Webgent — Modern Web Development & Engineering Solutions",
  },
  description:
    "Webgent designs and engineers high-performance web applications, scalable cloud backends, and digital platforms for growing businesses and modern brands.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Webgent — Modern Web Development & Engineering Solutions",
    description: "High-performance web applications, scalable cloud backends, and digital systems.",
    url: `${siteConfig.url}/`,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/api/og?title=Webgent&badge=Web+Engineering`,
        width: 1200,
        height: 630,
        alt: "Webgent — Next-Gen Web Solutions",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webgent — Modern Web Development & Engineering Solutions",
    description: "High-performance web applications, scalable cloud backends, and digital systems.",
    images: [`${siteConfig.url}/api/og?title=Webgent&badge=Web+Engineering`],
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
    <div className="space-y-8 sm:space-y-12 lg:space-y-16 pb-8 sm:pb-16 max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto px-3.5 sm:px-8 lg:px-12 2xl:px-16 3xl:px-24 font-sans w-full">
      <h1 className="sr-only">Webgent — Modern Web Development & Engineering Solutions</h1>
      {/* 1. HERO SECTION (Approved Product Visual preserved with choreographed entrance & scroll story) */}
      <HeroSection />

      {/* 2. CAPABILITIES SECTION (Interactive Sticky Discipline) */}
      <InteractiveCapabilities />

      {/* 3. SIGNATURE 'HOW WE BUILD' 3D DIGITAL PRODUCT EVOLUTION */}
      <HowWeBuildSection />

      {/* 4. HORIZONTAL SCROLL STORYTELLING: FEATURED CASE STUDIES */}
      <HorizontalShowcase projects={featuredProjects} />

      {/* 5. TESTIMONIALS SECTION (Curved Arc Carousel Matching User Reference) */}
      <ArcTestimonials initialTestimonials={testimonials} />

      {/* 6. ENGINEERING BLOG (Ultra-Premium Architectural Deep Dives) */}
      <EngineeringBlogSection posts={latestPosts} />

      {/* 7. FOOTER CTA */}
      <ScrollReveal
        as="section"
        className="relative overflow-hidden rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-6 sm:p-10 md:p-12 text-center space-y-5 shadow-2xl"
      >
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#F5F5F3] tracking-tight uppercase">
            Have Something Worth Building?
          </h2>
          <p className="text-xs sm:text-sm text-[#909090] max-w-xl mx-auto leading-relaxed">
            Let&apos;s turn your vision into modern, reliable web solutions. Speak directly with our technical
            team today.
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

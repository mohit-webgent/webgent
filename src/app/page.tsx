import { HeroSection } from "@/components/home/hero-section";
import { InteractiveCapabilities } from "@/components/home/interactive-capabilities";
import { HowWeBuildSection } from "@/components/home/how-we-build-section";
import { HorizontalShowcase } from "@/components/home/horizontal-showcase";
import { ArcTestimonials } from "@/components/home/arc-testimonials";
import { EngineeringBlogSection } from "@/components/home/engineering-blog-section";
import { ScrollReveal } from "@/components/animations";
import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";
import { CtaLink } from "@/components/ui/cta-link";
import type { Metadata } from "next";
import { logger } from "@/lib/logger";
import { siteConfig } from "@/config/site";
import {
  getHomepageHeroContent,
  getHomepageSectionsConfig,
  resolveRouteMetadata,
  type HomeSectionId,
} from "@/lib/services/cms";

export const revalidate = 60;

const defaultHomeMetadata: Metadata = {
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

export async function generateMetadata(): Promise<Metadata> {
  return resolveRouteMetadata("/", defaultHomeMetadata);
}

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
  const [heroContent, sectionsConfig] = await Promise.all([
    getHomepageHeroContent(),
    getHomepageSectionsConfig(),
  ]);

  let featuredProjects: Awaited<ReturnType<typeof prisma.project.findMany>> = [];
  let testimonials: Awaited<ReturnType<typeof prisma.testimonial.findMany>> = [];
  let latestPosts: HomePost[] = [];

  const cacheKey = "cache:home:composite_data_v1";
  const cachedData = await cacheGet<{
    featuredProjects: typeof featuredProjects;
    testimonials: typeof testimonials;
    latestPosts: HomePost[];
  }>(cacheKey);

  if (cachedData) {
    featuredProjects = cachedData.featuredProjects;
    testimonials = cachedData.testimonials;
    latestPosts = cachedData.latestPosts;
  } else {
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

      await cacheSet(cacheKey, { featuredProjects, testimonials, latestPosts }, 60);
    } catch (error) {
      logger.warn(
        "Could not fetch dynamic database content for HomePage, using empty state fallback",
        { error },
      );
    }
  }

  const sectionMap: Record<HomeSectionId, React.ReactNode> = {
    hero: <HeroSection key="hero" data={heroContent} />,
    capabilities: <InteractiveCapabilities key="capabilities" />,
    howWeBuild: <HowWeBuildSection key="howWeBuild" />,
    showcase: <HorizontalShowcase key="showcase" projects={featuredProjects} />,
    testimonials: <ArcTestimonials key="testimonials" initialTestimonials={testimonials} />,
    blog: <EngineeringBlogSection key="blog" posts={latestPosts} />,
    cta: (
      <ScrollReveal
        key="cta"
        as="section"
        className="relative overflow-hidden rounded-2xl bg-white border border-black/10 py-7 sm:py-9 px-6 sm:px-10 text-center space-y-4 sm:space-y-5 shadow-2xl"
      >
        {/* Subtle decorative radial vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03),transparent_70%)]"
        />

        <div className="relative z-10 space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black tracking-tight uppercase">
            Have Something Worth Building?
          </h2>
          <p className="text-xs sm:text-sm text-[#3A3A3C] max-w-xl mx-auto leading-relaxed">
            Let&apos;s turn your vision into modern, reliable web solutions. Speak directly with our technical
            team today.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-1">
          <CtaLink
            href="/contact"
            label="Home Footer Start Project"
            className="inline-flex items-center justify-center px-7 py-3 bg-black hover:bg-[#1E1E24] text-white font-medium text-xs rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            Start Your Project
          </CtaLink>
          <CtaLink
            href="/work"
            label="Home Footer Browse Work"
            className="inline-flex items-center justify-center px-7 py-3 bg-transparent hover:bg-black/[0.05] text-black border border-black/25 hover:border-black/60 font-medium text-xs rounded-xl transition-all duration-200"
          >
            Browse Case Studies
          </CtaLink>
        </div>
      </ScrollReveal>
    ),
  };

  const orderedSections = [...sectionsConfig.sections]
    .sort((a, b) => a.order - b.order)
    .filter((s) => s.enabled)
    .map((s) => sectionMap[s.id])
    .filter(Boolean);

  return (
    <div className="space-y-8 sm:space-y-12 lg:space-y-16 pb-8 sm:pb-16 max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto px-3.5 sm:px-8 lg:px-12 2xl:px-16 3xl:px-24 font-sans w-full">
      <h1 className="sr-only">Webgent — Modern Web Development & Engineering Solutions</h1>
      {orderedSections.length > 0 ? (
        orderedSections
      ) : (
        <>
          <HeroSection data={heroContent} />
          <InteractiveCapabilities />
          <HowWeBuildSection />
          <HorizontalShowcase projects={featuredProjects} />
          <ArcTestimonials initialTestimonials={testimonials} />
          <EngineeringBlogSection posts={latestPosts} />
          {sectionMap.cta}
        </>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { StatsBand } from "@/components/home/stats-band";
import { CapabilitiesSection } from "@/components/home/capabilities-section";
import { ProcessSection } from "@/components/home/process-section";
import { WorkSection } from "@/components/home/work-section";
import { EstimatorSection } from "@/components/home/estimator-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { BlogSection } from "@/components/home/blog-section";
import { CtaBand } from "@/components/ui/cta-band";
import { siteConfig } from "@/config/site";
import {
  getHomepageHeroContent,
  getHomepageSectionsConfig,
  getSiteSwitches,
  resolveRouteMetadata,
  type HomeSectionId,
} from "@/lib/services/cms";
import { getHomeData } from "@/lib/services/home-data";
import { getPricingData } from "@/lib/services/pricing";

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

export default async function HomePage() {
  const [heroContent, sectionsConfig, home, pricing, switches] = await Promise.all([
    getHomepageHeroContent(),
    getHomepageSectionsConfig(),
    getHomeData(),
    getPricingData(),
    getSiteSwitches(),
  ]);

  // Same figures as the /pricing page.
  const starter = pricing.matrixPackages.starter;

  const sectionMap: Record<HomeSectionId, React.ReactNode> = {
    hero: (
      <div key="hero">
        <HeroSection data={heroContent} projects={home.projects} starterPackage={starter} />
        <StatsBand projectCount={home.projectCount} startingPrice={starter.startingPrice} />
      </div>
    ),
    capabilities: <CapabilitiesSection key="capabilities" projects={home.projects} />,
    howWeBuild: <ProcessSection key="howWeBuild" projects={home.projects} />,
    showcase: home.projects.length > 0 ? <WorkSection key="showcase" projects={home.projects} /> : null,
    testimonials: <TestimonialsSection key="testimonials" initialTestimonials={home.testimonials} />,
    blog: <BlogSection key="blog" posts={home.posts} />,
    cta: (
      <CtaBand
        key="cta"
        title="Have something worth building?"
        description="Let's turn your idea into a modern, reliable website. Speak directly with the developer who will build it."
        secondaryLabel="See pricing"
        secondaryHref="/pricing"
        analyticsName="Home"
      />
    ),
  };

  const orderedSections = [...sectionsConfig.sections]
    .sort((a, b) => a.order - b.order)
    .filter((section) => section.enabled)
    .map((section) => sectionMap[section.id])
    .filter(Boolean);

  const sections = orderedSections.length > 0 ? orderedSections : Object.values(sectionMap);
  const estimator = <EstimatorSection key="estimator" pricing={pricing} chatEnabled={switches.aiChatEnabled} />;

  // The estimator sits directly before the closing call to action, wherever that has been ordered.
  const ctaIndex = sections.findIndex((section) => (section as React.ReactElement | null)?.key === "cta");
  const withEstimator =
    ctaIndex === -1 ? [...sections, estimator] : [...sections.slice(0, ctaIndex), estimator, ...sections.slice(ctaIndex)];

  return <>{withEstimator}</>;
}

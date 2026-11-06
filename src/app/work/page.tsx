import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";
import { WorkExplorer } from "@/components/work/work-explorer";
import { CtaBand } from "@/components/ui/cta-band";
import { PageHero } from "@/components/ui/page-hero";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

import { resolveRouteMetadata } from "@/lib/services/cms";

export const revalidate = 60;

const defaultWorkMetadata: Metadata = {
  title: "Work",
  description:
    "Explore Webgent's portfolio of web engineering, SaaS products, cloud architectures, and digital experiences.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Work | Webgent",
    description:
      "A curated showcase of custom software platforms, cloud applications, and high-conversion web experiences.",
    url: `${siteConfig.url}/work`,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/api/og?title=Work&badge=Portfolio`,
        width: 1200,
        height: 630,
        alt: "Work | Webgent",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Work | Webgent",
    description:
      "Explore Webgent's portfolio of web engineering, SaaS products, cloud architectures, and digital experiences.",
    images: [`${siteConfig.url}/api/og?title=Work&badge=Portfolio`],
    creator: "@webgent",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return resolveRouteMetadata("/work", defaultWorkMetadata);
}

export default async function WorkPage({
  searchParams: searchParamsPromise,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined; category?: string; q?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  let projects: Array<{
    id: string;
    title: string;
    slug: string;
    category: string | null;
    imageUrl: string | null;
    description: string;
    demoUrl: string | null;
  }> = [];

  const cacheKey = "cache:work:published_projects_v2";
  const cachedProjects = await cacheGet<typeof projects>(cacheKey);

  if (cachedProjects) {
    projects = cachedProjects;
  } else {
    try {
      projects = await prisma.project.findMany({
        where: { published: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });

      if (projects.length > 0) {
        await cacheSet(cacheKey, projects, 60);
      }
    } catch (error) {
      console.error("Failed to load projects from DB:", error);
    }
  }

  const categoryFilter = typeof searchParams?.category === "string" ? searchParams.category : undefined;
  const queryFilter = typeof searchParams?.q === "string" ? searchParams.q : "";

  return (
    <>
      <PageHero
        eyebrow="Work"
        title="Projects, built and shipped."
        description="A selection of websites and web applications designed and built by Webgent. Hover a project to scroll through it."
      />

      <WorkExplorer projects={projects} initialCategory={categoryFilter} initialQuery={queryFilter} />

      <CtaBand
        title="Have a similar project in mind?"
        description="Tell me about it and I'll come back with a clear scope, timeline and price."
        secondaryLabel="See pricing"
        secondaryHref="/pricing"
        analyticsName="Work"
      />
    </>
  );
}

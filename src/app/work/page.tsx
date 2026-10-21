import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";
import Link from "next/link";
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

// Fallback projects if database is empty
const fallbackProjects = [
  {
    id: "edayaa-jewellery",
    title: "Edayaa Jewellery E-Commerce Store",
    slug: "edayaa-jewellery",
    category: "E-Commerce & Retail",
    imageUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "fallback-1",
    title: "NextGen Enterprise SaaS Platform",
    slug: "nextgen-enterprise-saas-platform",
    category: "AI & Cloud Infrastructure",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "fallback-2",
    title: "Fintech Global Payments Infrastructure",
    slug: "fintech-global-payments",
    category: "Web & Mobile Application",
    imageUrl:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "fallback-3",
    title: "Aura Design System & Studio",
    slug: "aura-design-system",
    category: "Brand & Design Architecture",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85",
  },
];

export default async function WorkPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined; category?: string; q?: string };
}) {
  let projects: Array<{
    id: string;
    title: string;
    slug: string;
    category: string | null;
    imageUrl: string | null;
  }> = [];

  const cacheKey = "cache:work:published_projects_v1";
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
  const queryFilter = typeof searchParams?.q === "string" ? searchParams.q.toLowerCase() : undefined;

  let displayProjects = projects.length > 0 ? projects : fallbackProjects;
  if (categoryFilter) {
    const cat = categoryFilter.toLowerCase();
    displayProjects = displayProjects.filter((p) => p.category?.toLowerCase().includes(cat));
  }
  if (queryFilter) {
    displayProjects = displayProjects.filter((p) => p.title.toLowerCase().includes(queryFilter));
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#EDEDED] pt-8 pb-20 sm:pt-12 sm:pb-28 px-6 sm:px-10 lg:px-16 2xl:px-24">
      <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto">
        {/* Header Intro */}
        <div className="mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-semibold tracking-tight text-[#F5F5F3]">
            Selected Work & Case Studies
          </h1>
          <p className="mt-2 text-sm 2xl:text-base text-[#888888] max-w-2xl 2xl:max-w-3xl">
            Real production client implementations and digital engineering platforms developed by Webgent.
          </p>
        </div>

        {/* Responsive Grid with large images, project name, badges & type below */}
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-x-8 gap-y-12 sm:gap-x-12 sm:gap-y-16 lg:gap-x-14 lg:gap-y-20 2xl:gap-x-14 2xl:gap-y-20">
          {displayProjects.map((project) => {
            return (
              <Link
                key={project.id}
                href={`/work/${project.slug}`}
                className="group block focus:outline-none"
              >
                {/* Large Image (Sharp, Non-Rounded) */}
                <div className="w-full aspect-[16/10] bg-[#121212] overflow-hidden border border-white/[0.08] relative">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#161616] to-[#0D0D0D]">
                      <span className="text-4xl sm:text-6xl font-light text-white/20 select-none">
                        {project.title.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Corner Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-medium">
                      Live Production Work
                    </span>
                  </div>
                </div>

                {/* Project Name and Type */}
                <div className="mt-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#F5F5F3] group-hover:text-white transition-colors">
                      {project.title}
                    </h2>
                    <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/20 text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                      Live
                    </span>
                  </div>
                  <span className="text-sm text-[#888888] font-normal shrink-0">
                    {project.category || "Case Study"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

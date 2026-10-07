import { prisma } from "@/lib/db";
import { Project, Prisma } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, Star, ExternalLink, Github, Search, Layers, X } from "lucide-react";
import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Portfolio & Case Studies | Webgent",
  description:
    "Explore Webgent's portfolio of web engineering, SaaS products, cloud architectures, and custom software systems.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Portfolio & Case Studies | Webgent",
    description:
      "A curated showcase of custom software platforms, cloud applications, and high-conversion web experiences.",
    url: `${siteConfig.url}/work`,
    siteName: siteConfig.name,
    images: [
      {
        url: "/api/og?title=Case+Studies+%26+Portfolio&badge=Selected+Works",
        width: 1200,
        height: 630,
        alt: "Webgent Portfolio",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio & Case Studies | Webgent",
    description:
      "Explore Webgent's portfolio of web engineering, SaaS products, cloud architectures, and custom software systems.",
    images: ["/api/og?title=Case+Studies+%26+Portfolio&badge=Selected+Works"],
    creator: "@webgent",
  },
};

export default async function PublicProjectsPage({
  searchParams,
}: {
  searchParams?: { category?: string; search?: string };
}) {
  const selectedCategory = searchParams?.category?.trim() || "";
  const searchQuery = searchParams?.search?.trim() || "";

  let featuredProjects: Project[] = [];
  let allProjects: Project[] = [];
  let categories: string[] = [];

  try {
    const where: Prisma.ProjectWhereInput = { published: true };

    if (selectedCategory && selectedCategory.toLowerCase() !== "all") {
      where.category = { equals: selectedCategory, mode: "insensitive" };
    }

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
        { technologies: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    const [featuredRes, allRes, distinctCategories] = await Promise.all([
      prisma.project.findMany({
        where: { published: true, featured: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: 3,
      }),
      prisma.project.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.project.findMany({
        where: { published: true },
        select: { category: true },
        distinct: ["category"],
      }),
    ]);

    featuredProjects = featuredRes;
    allProjects = allRes;
    categories = distinctCategories.map((c) => c.category).filter((c): c is string => Boolean(c));
  } catch {}

  return (
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-12 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.02] border border-white/10 text-[#A0A0A0] text-xs font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span>PORTFOLIO / CASE ARCHIVE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#F5F5F3] tracking-tight uppercase">
            Engineering Systems in Production
          </h1>
          <p className="text-sm sm:text-base text-[#909090]">
            A curated showcase of custom software platforms, cloud applications, and high-conversion
            web experiences.
          </p>
        </div>

        {!selectedCategory && !searchQuery && featuredProjects.length > 0 && (
          <div className="space-y-6">
            <h2 className="flex items-center gap-2 text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider font-mono">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Spotlight Featured Projects</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.16] rounded-xl overflow-hidden shadow-xl transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-4 p-6 sm:p-7">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[10px] font-mono font-medium rounded uppercase tracking-wider">
                        {project.category || "Case Study"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#8A8A8A] text-[11px] font-mono">
                        <Star className="w-3 h-3 fill-current" /> Featured
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#F5F5F3] transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-xs text-[#909090] line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>

                    {project.technologies && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {project.technologies
                          .split(",")
                          .slice(0, 4)
                          .map((tech, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-[#141414] border border-white/[0.06] text-[#8A8A8A] text-[10px] font-mono rounded"
                            >
                              {tech.trim()}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="p-6 sm:p-7 pt-0 flex items-center justify-between gap-4 border-t border-white/[0.06] mt-4">
                    <Link
                      href={`/work/${project.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E8E8E6] hover:text-white transition-colors"
                    >
                      <span>Read Case Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-2">
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#8A8A8A] hover:text-white bg-[#141414] border border-white/[0.06] rounded-lg transition-colors"
                          title="Live Demo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#8A8A8A] hover:text-white bg-[#141414] border border-white/[0.06] rounded-lg transition-colors"
                          title="GitHub Source Code"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <Link
                href="/work"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? "bg-[#E8E8E6] text-[#080808]"
                    : "bg-[#141414] text-[#8A8A8A] hover:text-[#F5F5F3] border border-white/[0.06]"
                }`}
              >
                All Projects
              </Link>
              {categories.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <Link
                    key={cat}
                    href={`/work?category=${encodeURIComponent(cat)}`}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      isSelected
                        ? "bg-[#E8E8E6] text-[#080808]"
                        : "bg-[#141414] text-[#8A8A8A] hover:text-[#F5F5F3] border border-white/[0.06]"
                    }`}
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>

            <form method="GET" action="/work" className="relative sm:w-72">
              <Search className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                aria-label="Filter case studies by keyword"
                placeholder="Filter by keyword..."
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#080808] border border-white/[0.10] text-xs text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-white/20 transition-colors"
              />
              {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
            </form>
          </div>

          {allProjects.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-8">
              <Layers className="w-8 h-8 text-[#666666] mx-auto" />
              <p className="text-sm font-semibold text-[#F5F5F3]">No Projects Match Your Filter</p>
              <p className="text-xs text-[#909090]">
                Try selecting a different category or clearing your search term.
              </p>
              <Link
                href="/work"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] text-xs font-medium text-[#F5F5F3] border border-white/[0.08] mt-2 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-6 space-y-4 flex flex-col justify-between transition-colors shadow-lg"
                >
                  <div className="space-y-3">
                    <span className="px-2.5 py-0.5 bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[10px] font-mono font-medium rounded uppercase tracking-wider w-fit block">
                      {project.category || "Project"}
                    </span>
                    <h3 className="text-base font-semibold text-[#F5F5F3]">{project.title}</h3>
                    <p className="text-xs text-[#909090] line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <Link
                      href={`/work/${project.slug}`}
                      className="text-xs font-medium text-[#E8E8E6] hover:text-white inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Explore Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8A8A8A] hover:text-white transition-colors"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { Project, Prisma } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, Star, ExternalLink, Github, Search, Layers, X } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Card3DTilt } from "@/components/animations/card-tilt";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

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
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto space-y-20 relative z-10 text-left">
        {/* Page Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.02] border border-white/10 text-[#A0A0A0] text-xs font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span>PORTFOLIO / CASE ARCHIVE</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-[#F5F5F3] tracking-tight uppercase">
            Engineering Systems in Production
          </h1>
          <p className="text-sm sm:text-base text-[#909090] max-w-2xl mx-auto leading-relaxed">
            A curated showcase of custom software platforms, cloud applications, and high-conversion
            web experiences engineered by Webgent.
          </p>
        </div>

        {/* 1. Large Editorial Spotlight Sections (Alternating Layout) */}
        {!selectedCategory && !searchQuery && featuredProjects.length > 0 && (
          <div className="space-y-12">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <h2 className="flex items-center gap-2 text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider font-mono">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Editorial Case Spotlights</span>
              </h2>
              <span className="text-xs font-mono text-[#666666]">01 — 0{featuredProjects.length}</span>
            </div>

            <div className="space-y-10">
              {featuredProjects.map((project, idx) => {
                const isEven = idx % 2 === 1;
                return (
                  <ScrollReveal key={project.id}>
                    <div
                      className="group bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-6 sm:p-10 transition-all duration-300 shadow-2xl"
                    >
                      <div
                        className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                          isEven ? "lg:flex-row-reverse" : ""
                        }`}
                      >
                        {/* Narrative Column */}
                        <div className={`space-y-6 ${isEven ? "lg:col-span-6 lg:order-2" : "lg:col-span-6"}`}>
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-0.5 bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[10px] font-mono font-medium rounded uppercase tracking-wider">
                              {project.category || "Case Study"}
                            </span>
                            <span className="text-xs font-mono text-[#666666]">
                              ARCHIVE / 0{idx + 1}
                            </span>
                          </div>

                          <h3 className="text-2xl sm:text-4xl font-bold text-[#F5F5F3] tracking-tight group-hover:text-white transition-colors">
                            {project.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-[#909090] leading-relaxed">
                            {project.description}
                          </p>

                          {project.technologies && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {project.technologies
                                .split(",")
                                .slice(0, 5)
                                .map((tech, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 bg-[#141414] border border-white/[0.06] text-[#8A8A8A] text-[10px] font-mono rounded"
                                  >
                                    {tech.trim()}
                                  </span>
                                ))}
                            </div>
                          )}

                          <div className="pt-4 flex items-center gap-4">
                            <Link
                              href={`/work/${project.slug}`}
                              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E8E8E6] hover:bg-white text-[#080808] font-medium text-xs rounded-lg transition-colors group-hover:translate-x-0.5"
                            >
                              <span>Read Full Case Study</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>

                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-lg text-[#888888] hover:text-white bg-[#141414] border border-white/[0.06] transition-colors"
                                title="Live Demo"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-lg text-[#888888] hover:text-white bg-[#141414] border border-white/[0.06] transition-colors"
                                title="Repository"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Visual Preview Column */}
                        <div className={`w-full ${isEven ? "lg:col-span-6 lg:order-1" : "lg:col-span-6"}`}>
                          <div className="w-full aspect-[16/10] rounded-xl bg-[#141414] border border-white/[0.08] overflow-hidden relative flex items-center justify-center group-hover:border-white/[0.18] transition-colors">
                            {project.imageUrl ? (
                              <img
                                src={project.imageUrl}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                              />
                            ) : (
                              <div className="text-center space-y-2 p-6">
                                <div className="w-10 h-10 rounded-xl bg-[#1D1D1D] border border-white/[0.08] mx-auto flex items-center justify-center font-mono font-bold text-sm text-[#F5F5F3]">
                                  {project.title.slice(0, 1)}
                                </div>
                                <span className="text-xs font-mono text-[#666666] block">
                                  {project.clientName || "SYSTEM PRODUCTION"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Interactive Filter & Archive Grid */}
        <div className="space-y-8 pt-4">
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
                <div key={project.id}>
                  <Card3DTilt>
                    <div className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.18] rounded-xl p-6 sm:p-7 space-y-4 flex flex-col justify-between transition-all duration-300 shadow-xl h-full min-h-[260px]">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[10px] font-mono font-medium rounded uppercase tracking-wider">
                            {project.category || "Project"}
                          </span>
                          {project.featured && (
                            <span className="text-[10px] font-mono text-[#8A8A8A] flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" /> Featured
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-[#F5F5F3]">{project.title}</h3>
                        <p className="text-xs text-[#909090] line-clamp-3 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                        <Link
                          href={`/work/${project.slug}`}
                          className="text-xs font-semibold text-[#E8E8E6] hover:text-white inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>Explore Project</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#888888] hover:text-white transition-colors"
                            title="Live Demo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </Card3DTilt>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

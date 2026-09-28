import { prisma } from "@/lib/db";
import { Project } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, Star, ExternalLink, Github, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portfolio & Case Studies | Webgent",
  description: "Explore Webgent's portfolio of web engineering, SaaS products, and custom software projects.",
};

export default async function PublicProjectsPage() {
  let featuredProjects: Project[] = [];
  let allProjects: Project[] = [];

  try {
    const [featuredRes, allRes] = await Promise.all([
      prisma.project.findMany({
        where: { published: true, featured: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: 3,
      }),
      prisma.project.findMany({
        where: { published: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
    ]);
    featuredProjects = featuredRes;
    allProjects = allRes;
  } catch {
    // Database connection offline fallback for build/preview
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Case Studies & Work</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Engineering Excellence in Action
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            A curated showcase of custom software platforms, cloud applications, and high-conversion web experiences.
          </p>
        </div>

        {/* Featured Projects Section */}
        {featuredProjects.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Star className="w-4 h-4 fill-current" />
              <span>Spotlight Featured Projects</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4 p-6 sm:p-8">
                    {/* Cover image or category pill */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold rounded-full uppercase tracking-wider">
                        {project.category || "Case Study"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-semibold">
                        <Star className="w-3 h-3 fill-current" /> Featured
                      </span>
                    </div>

                    <h2 className="text-2xl font-extrabold text-white group-hover:text-indigo-400 transition-colors">
                      {project.title}
                    </h2>

                    <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Tech stack pills */}
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {project.technologies.split(",").slice(0, 4).map((tech, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-semibold rounded-lg"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-6 sm:p-8 pt-0 flex items-center justify-between gap-4 border-t border-slate-800/60 mt-4">
                    <Link
                      href={`/work/${project.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-white group-hover:text-indigo-400 transition-colors"
                    >
                      <span>Read Case Study</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex items-center gap-3">
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl transition-colors"
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
                          className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl transition-colors"
                          title="GitHub Source Code"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Projects Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            All Case Studies & Deliverables
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProjects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  <span className="px-3 py-1 bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-bold rounded-full uppercase tracking-wider w-fit block">
                    {project.category || "Project"}
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between gap-4 border-t border-slate-800/40">
                  <Link
                    href={`/work/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

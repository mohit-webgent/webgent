import { prisma } from "@/lib/db";
import { Project } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Github, Tag, Building, Sparkles, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { DemoLink } from "@/components/work/demo-link";

import { siteConfig } from "@/config/site";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
    });

    if (!project || !project.published) {
      return {
        title: "Project Not Found | Webgent",
        robots: { index: false, follow: false },
      };
    }

    const title = project.seoTitle || `${project.title} — Case Study | Webgent`;
    const description = project.seoDescription || project.description;
    const ogImage =
      project.imageUrl ||
      `${siteConfig.url}/api/og?title=${encodeURIComponent(project.title)}&badge=${encodeURIComponent(project.category || "Case Study")}&desc=${encodeURIComponent(project.description.slice(0, 140))}`;

    return {
      title,
      description,
      alternates: {
        canonical: `/work/${project.slug}`,
      },
      openGraph: {
        title: project.seoTitle || `${project.title} — Webgent Case Study`,
        description,
        url: `${siteConfig.url}/work/${project.slug}`,
        siteName: siteConfig.name,
        type: "article",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: project.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: project.seoTitle || `${project.title} — Case Study | Webgent`,
        description,
        images: [ogImage],
        creator: "@webgent",
      },
    };
  } catch {
    return { title: "Case Study | Webgent" };
  }
}

export default async function PublicProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let project: Project | null = null;
  try {
    project = await prisma.project.findUnique({
      where: { slug: params.slug },
    });
  } catch {
    // Database connection offline fallback for build/preview
  }

  if (!project || !project.published) {
    notFound();
  }

  let screenshotList: string[] = [];
  if (project.screenshots) {
    try {
      const parsed = JSON.parse(project.screenshots);
      if (Array.isArray(parsed)) {
        screenshotList = parsed;
      } else {
        screenshotList = [project.screenshots];
      }
    } catch {
      screenshotList = project.screenshots.split("\n").filter(Boolean);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        {/* Back Link */}
        <Link
          href="/work"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Work</span>
        </Link>

        {/* Header Title Banner */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold rounded-full uppercase tracking-wider">
              {project.category || "Case Study"}
            </span>
            {project.clientName && (
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                {project.clientName}
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            {project.title}
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl">
            {project.description}
          </p>

          {/* Action Links & Tech Stack */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-slate-800">
            {project.technologies && (
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400 mr-1" />
                {project.technologies.split(",").map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              {project.demoUrl && (
                <DemoLink projectSlug={project.slug} demoUrl={project.demoUrl} />
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs rounded-xl transition-all"
                >
                  <Github className="w-4 h-4" />
                  <span>View Repository</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Case Study Full Content */}
        {project.content && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Project Case Study & Architecture</span>
            </h2>
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {project.content}
            </div>
          </div>
        )}

        {/* Screenshots Showcase */}
        {screenshotList.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Interface & Visual Gallery</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {screenshotList.map((url, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${project.title} screenshot ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Conversion CTA */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Build a Similar Solution?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Let&apos;s evaluate your technical requirements and build an enterprise platform engineered for scale.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>Discuss Your Architecture</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs rounded-xl transition-all"
            >
              <span>Browse More Projects</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

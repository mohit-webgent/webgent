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

export default async function PublicProjectDetailPage({ params }: { params: { slug: string } }) {
  let project: Project | null = null;
  try {
    project = await prisma.project.findUnique({
      where: { slug: params.slug },
    });
  } catch {}

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
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8A8A8A] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>PORTFOLIO / RETURN TO INDEX</span>
        </Link>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-0.5 bg-[#141414] text-[#B5B5B3] border border-white/[0.08] text-[10px] font-mono font-medium rounded uppercase tracking-wider">
              {project.category || "Case Study"}
            </span>
            {project.clientName && (
              <span className="flex items-center gap-1.5 text-xs text-[#8A8A8A] font-mono">
                <Building className="w-3.5 h-3.5 text-[#666666]" />
                {project.clientName}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#F5F5F3] tracking-tight uppercase">
            {project.title}
          </h1>

          <p className="text-base sm:text-lg text-[#909090] leading-relaxed max-w-3xl">
            {project.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/[0.06]">
            {project.technologies && (
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-[#8A8A8A] mr-1" />
                {project.technologies.split(",").map((tech, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-[#141414] border border-white/[0.06] text-[#8A8A8A] text-[11px] font-mono rounded"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              {project.demoUrl && <DemoLink projectSlug={project.slug} demoUrl={project.demoUrl} />}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#141414] hover:bg-[#1E1E1E] text-[#D0D0CE] border border-white/[0.08] font-medium text-xs rounded-lg transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>View Repository</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {project.content && (
          <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-8 sm:p-10 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-[#F5F5F3] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8A8A8A]" />
              <span>Project Architecture & Specifications</span>
            </h2>
            <div className="prose prose-invert max-w-none text-[#B5B5B3] leading-relaxed text-sm whitespace-pre-wrap">
              {project.content}
            </div>
          </div>
        )}

        {screenshotList.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#F5F5F3] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8A8A8A]" />
              <span>Interface & Telemetry Gallery</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {screenshotList.map((url, idx) => (
                <div
                  key={idx}
                  className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl"
                >
                  <img
                    src={url}
                    alt={`${project.title} screenshot ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-8 sm:p-12 text-center space-y-6">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F3] tracking-tight">
              Ready to Engineer a Similar Platform?
            </h2>
            <p className="text-xs sm:text-sm text-[#909090]">
              Let&apos;s evaluate your technical requirements and construct an enterprise system
              engineered for high scale.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8E8E6] hover:bg-white text-[#080808] font-medium text-xs rounded-lg transition-colors"
            >
              <span>Discuss Your Architecture</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-white/[0.04] text-[#E5E5E5] border border-white/14 font-medium text-xs rounded-lg transition-colors"
            >
              <span>Browse More Projects</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

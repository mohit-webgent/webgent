"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { RevealGroup } from "@/components/animations/reveal-group";
import { SectionHeading } from "@/components/ui/section-heading";

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category?: string | null;
  demoUrl?: string | null;
  imageUrl?: string | null;
}

function ProjectScreen({ project, className = "" }: { project: ProjectItem; className?: string }) {
  return project.imageUrl ? (
    <img src={project.imageUrl} alt="" loading="lazy" decoding="async" className={`shot-pan h-full w-full ${className}`} />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-surface-2">
      <span className="font-display text-6xl font-semibold text-white/10">{project.title.charAt(0)}</span>
    </div>
  );
}

/** A project in a browser frame. The screenshot scrolls while hovered, like browsing the real site. */
export function ProjectCard({ project, className = "" }: { project: ProjectItem; className?: string }) {
  const demoUrl = project.demoUrl?.trim();

  return (
    <article data-reveal className={`group relative ${className}`}>
      <div className="overflow-hidden rounded-xl border border-line bg-surface textured shadow-card transition-[border-color,transform] duration-500 ease-expo-out group-hover:-translate-y-1 group-hover:border-line-strong">
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-3 py-2">
          <span aria-hidden="true" className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
          </span>
          <span className="min-w-0 flex-1 truncate font-mono text-[0.6875rem] text-fg-muted">{project.slug}</span>
          {demoUrl && (
            <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Live
            </span>
          )}
        </div>
        <div className="aspect-[16/10] overflow-hidden">
          <ProjectScreen project={project} />
        </div>
      </div>

      <div className="mt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {project.category && <p className="text-[0.8125rem] text-fg-muted">{project.category}</p>}
          <h3 className="mt-0.5 text-lg font-semibold">
            <Link href={`/work/${project.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {project.title}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-fg-muted">{project.description}</p>
        </div>
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${project.title} (opens in a new tab)`}
            className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-fg-soft transition-colors hover:border-line-strong hover:text-fg"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

export function ProjectGrid({ projects }: { projects: ProjectItem[] }) {
  return (
    <RevealGroup className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </RevealGroup>
  );
}

/** Panels share a row and the one under the pointer opens up. Stacks into cards on small screens. */
function ProjectAccordion({ projects }: { projects: ProjectItem[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="hidden h-[29rem] gap-2.5 lg:flex">
      {projects.map((project, index) => {
        const isActive = index === active;
        const demoUrl = project.demoUrl?.trim();
        return (
          <article
            key={project.id}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            style={{ flexGrow: isActive ? 5 : 1, flexBasis: 0 }}
            className={`group relative min-w-0 overflow-hidden rounded-xl border bg-surface textured transition-[flex-grow,border-color] duration-700 ease-expo-out ${isActive ? "border-line-strong" : "border-line"}`}
          >
            <div className={`absolute inset-0 transition-[filter,opacity] duration-700 ${isActive ? "" : "opacity-50 saturate-[0.35]"}`}>
              <ProjectScreen project={project} />
            </div>
            <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${isActive ? "from-canvas from-20% via-canvas/90 via-35% to-transparent to-60%" : "from-canvas via-canvas/50 to-transparent to-60%"}`} />

            {!isActive && (
              <span className="absolute bottom-5 left-1/2 max-h-[80%] truncate text-sm font-medium [transform:translateX(-50%)_rotate(180deg)] [writing-mode:vertical-rl]">
                {project.title}
              </span>
            )}

            <div className={`absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5 transition-opacity duration-500 ${isActive ? "opacity-100 delay-200" : "pointer-events-none opacity-0"}`}>
              <div className="min-w-0 max-w-xl">
                <p className="flex items-center gap-2.5 text-[0.8125rem] text-fg-soft">
                  {project.category}
                  {demoUrl && (
                    <span className="inline-flex items-center gap-1.5 text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Live
                    </span>
                  )}
                </p>
                <h3 className="mt-1 truncate font-display text-2xl font-semibold">
                  <Link href={`/work/${project.slug}`} tabIndex={isActive ? 0 : -1} className="after:absolute after:inset-0 after:content-['']">
                    {project.title}
                  </Link>
                </h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-fg-soft">{project.description}</p>
              </div>
              <div className="relative z-10 flex shrink-0 gap-2">
                {demoUrl && (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={isActive ? 0 : -1}
                    aria-label={`Visit ${project.title} (opens in a new tab)`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-line-strong bg-canvas/70 text-fg transition-colors hover:bg-surface-3"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-fg">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function WorkSection({ projects = [] }: { projects?: ProjectItem[] }) {
  return (
    <section id="work" className="wrap section">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:mb-10 lg:flex-row lg:items-end">
        <SectionHeading eyebrow="Selected work" title="Built, shipped and live." />
        <Link href="/work" className="btn btn-secondary shrink-0 self-start lg:self-auto">
          <span>View all projects</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <ProjectAccordion projects={projects} />

      <RevealGroup className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:hidden">
        {projects.slice(0, 4).map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </RevealGroup>
    </section>
  );
}

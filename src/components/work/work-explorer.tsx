"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { ProjectCard, type ProjectItem } from "@/components/home/work-section";

/** Filters as you type or click, and keeps the choice in the URL so a filtered view can be shared. */
export function WorkExplorer({ projects, initialCategory, initialQuery = "" }: { projects: ProjectItem[]; initialCategory?: string; initialQuery?: string }) {
  // Categories are free text in the admin, so "E-commerce" and "E-Commerce" count as one.
  const categories = useMemo(() => {
    const byKey = new Map<string, string>();
    projects.forEach((project) => {
      const name = project.category?.trim();
      if (name && !byKey.has(name.toLowerCase())) byKey.set(name.toLowerCase(), name);
    });
    return Array.from(byKey.values());
  }, [projects]);
  const [category, setCategory] = useState<string | null>(
    categories.find((item) => item.toLowerCase() === initialCategory?.toLowerCase()) ?? null,
  );
  const [query, setQuery] = useState(initialQuery);

  const syncUrl = (nextCategory: string | null, nextQuery: string) => {
    const params = new URLSearchParams();
    if (nextCategory) params.set("category", nextCategory);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    const search = params.toString();
    window.history.replaceState(null, "", search ? `/work?${search}` : "/work");
  };

  const selectCategory = (next: string | null) => {
    setCategory(next);
    syncUrl(next, query);
  };

  const changeQuery = (next: string) => {
    setQuery(next);
    syncUrl(category, next);
  };

  const needle = query.trim().toLowerCase();
  const visible = projects.filter(
    (project) =>
      (!category || project.category?.trim().toLowerCase() === category.toLowerCase()) &&
      (!needle || `${project.title} ${project.description} ${project.category ?? ""}`.toLowerCase().includes(needle)),
  );

  const reset = () => {
    setCategory(null);
    setQuery("");
    syncUrl(null, "");
  };

  return (
    <section className="wrap pb-[var(--section-space)]">
      <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          <button type="button" aria-pressed={!category} onClick={() => selectCategory(null)} className="tab-pill">
            All
            <span className="font-mono text-[0.6875rem] opacity-60">{projects.length}</span>
          </button>
          {categories.map((item) => (
            <button key={item} type="button" aria-pressed={category === item} onClick={() => selectCategory(item)} className="tab-pill">
              {item}
            </button>
          ))}
        </div>

        <div className="relative md:w-64">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            placeholder="Search projects"
            aria-label="Search projects"
            className="field !min-h-9 !py-1.5 !pl-8 !pr-8 !text-[0.8125rem] [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => changeQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-fg-muted hover:text-fg">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "project" : "projects"} shown
      </p>

      {visible.length === 0 ? (
        <div className="card anim-pop p-8 text-center">
          <h2 className="display-md">{projects.length === 0 ? "New projects are on the way" : "No projects match that"}</h2>
          <p className="mt-2 text-sm text-fg-muted">
            {projects.length === 0 ? "Get in touch to discuss what you'd like to build." : "Try another search or show everything."}
          </p>
          {projects.length === 0 ? (
            <Link href="/contact" className="btn btn-light btn-sm mt-5">
              <span>Start a project</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <button type="button" onClick={reset} className="btn btn-secondary btn-sm mt-5">
              Show all projects
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((project, index) => (
            <div key={project.id} className="anim-pop" style={{ "--i": Math.min(index, 6) } as React.CSSProperties}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

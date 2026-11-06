"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { PostCard, type PostCardData } from "./post-card";

export function BlogExplorer({ posts }: { posts: Array<PostCardData & { id: string }> }) {
  const categories = useMemo(
    () => Array.from(new Set(posts.map((post) => post.category).filter((category): category is string => Boolean(category)))),
    [posts],
  );
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const visible = posts.filter(
    (post) =>
      (!category || post.category === category) &&
      (!needle || `${post.title} ${post.excerpt ?? ""} ${post.category ?? ""}`.toLowerCase().includes(needle)),
  );

  // The newest article leads only on the unfiltered list, where it really is the latest.
  const showFeatured = !category && !needle;
  const [featured, ...rest] = visible;
  const grid = showFeatured ? rest : visible;

  return (
    <section className="wrap pb-[var(--section-space)]">
      <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by topic">
          <button type="button" aria-pressed={!category} onClick={() => setCategory(null)} className="tab-pill">
            All
            <span className="font-mono text-[0.6875rem] opacity-60">{posts.length}</span>
          </button>
          {categories.map((item) => (
            <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className="tab-pill">
              {item}
            </button>
          ))}
        </div>
        <div className="relative md:w-64">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles"
            aria-label="Search articles"
            className="field !min-h-9 !py-1.5 !pl-8 !pr-8 !text-[0.8125rem] [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-fg-muted hover:text-fg">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "article" : "articles"} shown
      </p>

      {visible.length === 0 ? (
        <div className="card anim-pop p-8 text-center">
          <h2 className="display-md">No articles match that</h2>
          <button
            type="button"
            onClick={() => {
              setCategory(null);
              setQuery("");
            }}
            className="btn btn-secondary btn-sm mt-4"
          >
            Show all articles
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {showFeatured && featured && (
            <div className="anim-pop">
              <PostCard post={featured} large />
            </div>
          )}
          {grid.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {grid.map((post, index) => (
                <div key={post.id} className="anim-pop flex" style={{ "--i": Math.min(index, 6) } as React.CSSProperties}>
                  <PostCard post={post} className="w-full" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Loader2,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Tag,
} from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  tags?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  readTime?: number | null;
  views: number;
  createdAt: string;
  publishedAt?: string | null;
  author?: {
    name: string;
    email: string;
  } | null;
}

export function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog?limit=100");
      if (res.ok) {
        const json = await res.json();
        setPosts(json.data?.posts || []);
      }
    } catch {
      // Ignore network errors on unmount
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleTogglePublish = async (post: BlogPost) => {
    setError(null);
    const nextStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/blog/${post.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id ? { ...p, status: nextStatus } : p
          )
        );
        setFeedback(
          `Post "${post.title}" ${nextStatus === "PUBLISHED" ? "published" : "set to draft"}.`
        );
      }
    } catch {
      setError("Failed to update publication state.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);

    try {
      const url = `/api/admin/blog/${deleteTarget.id}${
        isPermanentDelete ? "?permanent=true" : ""
      }`;

      const res = await fetch(url, {
        method: "DELETE",
      });

      if (res.ok) {
        if (isPermanentDelete) {
          setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        } else {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === deleteTarget.id ? { ...p, status: "ARCHIVED" } : p
            )
          );
        }
        setFeedback(
          `Post "${deleteTarget.title}" ${
            isPermanentDelete ? "permanently deleted" : "archived (soft-deleted)"
          }.`
        );
        setDeleteTarget(null);
      } else {
        setError("Failed to delete blog post.");
      }
    } catch {
      setError("An unexpected error occurred during deletion.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      search.trim() === ""
        ? true
        : p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
          (p.tags && p.tags.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ? true : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Blog & Article CMS
          </h1>
          <p className="text-sm text-slate-400">
            Publish insights, tech articles, SEO content, and track reader engagement
          </p>
        </div>

        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs text-emerald-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search posts by title, tag, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Blog List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-xs">Loading blog database...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-base font-semibold text-white">No articles found</p>
            <p className="text-xs text-slate-400">
              Create your first blog article to publish insights.
            </p>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Create Article</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4">Category / Tags</th>
                  <th className="py-3.5 px-4">Read Time</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Title & Slug */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">
                        {post.title}
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1 max-w-md mt-0.5">
                        {post.excerpt || "No excerpt provided"}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                        <span>slug: /blog/{post.slug}</span>
                        {post.author && <span>By {post.author.name}</span>}
                      </div>
                    </td>

                    {/* Category & Tags */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-slate-950 text-indigo-400 border border-indigo-500/20 rounded-md font-semibold text-[10px]">
                          {post.category || "General"}
                        </span>
                        {post.tags && (
                          <div className="flex flex-wrap gap-1 items-center">
                            <Tag className="w-2.5 h-2.5 text-slate-500" />
                            <span className="text-[10px] text-slate-400 line-clamp-1">
                              {post.tags}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Read Time */}
                    <td className="py-4 px-4 text-slate-300 font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{post.readTime || 1} min read</span>
                      </div>
                    </td>

                    {/* Views Count */}
                    <td className="py-4 px-4 text-slate-300 font-mono">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-indigo-400" />
                        <span>{post.views}</span>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : post.status === "ARCHIVED"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-slate-950 text-slate-400 border-slate-800"
                        }`}
                      >
                        {post.status === "PUBLISHED" ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Published
                          </>
                        ) : post.status === "ARCHIVED" ? (
                          <>
                            <Trash2 className="w-3.5 h-3.5" /> Archived
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Draft
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="inline-flex items-center gap-1 p-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => {
                          setDeleteTarget(post);
                          setIsPermanentDelete(false);
                        }}
                        className="inline-flex items-center gap-1 p-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Article</h3>
                <p className="text-xs text-slate-400">Choose deletion mode for safety.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">&quot;{deleteTarget.title}&quot;</strong>?
            </p>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="delete-mode"
                  checked={!isPermanentDelete}
                  onChange={() => setIsPermanentDelete(false)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Soft Delete (Recommended)</span>
                  <span className="text-[11px] text-slate-400">Archives the article while preserving historical database references.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-slate-800">
                <input
                  type="radio"
                  name="delete-mode"
                  checked={isPermanentDelete}
                  onChange={() => setIsPermanentDelete(true)}
                  className="w-4 h-4 accent-red-600"
                />
                <div>
                  <span className="text-xs font-bold text-red-400 block">Permanent Delete</span>
                  <span className="text-[11px] text-slate-400">Completely removes record and associated media assets from database & R2.</span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{isPermanentDelete ? "Permanently Delete" : "Soft Delete"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

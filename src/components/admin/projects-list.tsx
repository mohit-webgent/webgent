"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Star,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Github,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category?: string | null;
  imageUrl?: string | null;
  demoUrl?: string | null;
  githubUrl?: string | null;
  technologies?: string | null;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: string;
}

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        const json = await res.json();
        setProjects(json.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleTogglePublish = async (project: Project) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !project.published }),
      });

      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === project.id ? { ...p, published: !p.published } : p
          )
        );
        setFeedback(
          `Project "${project.title}" ${!project.published ? "published" : "unpublished"}.`
        );
      }
    } catch {
      setError("Failed to update publication state.");
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !project.featured }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to update featured state.");
        return;
      }

      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, featured: !p.featured } : p
        )
      );
      setFeedback(
        `Project "${project.title}" ${!project.featured ? "featured" : "unfeatured"}.`
      );
    } catch {
      setError("Failed to update featured state.");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === projects.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...projects];

    // Swap position items
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Recalculate order indices
    const payloadItems = reordered.map((item, idx) => ({
      id: item.id,
      order: idx,
    }));

    setProjects(reordered.map((item, idx) => ({ ...item, order: idx })));

    try {
      await fetch("/api/admin/projects/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payloadItems }),
      });
    } catch {
      fetchProjects(); // Revert on failure
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/projects/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setFeedback(`Project "${deleteTarget.title}" deleted successfully.`);
        setDeleteTarget(null);
      } else {
        setError("Failed to delete project.");
      }
    } catch {
      setError("An unexpected error occurred during deletion.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    search.trim() === ""
      ? true
      : p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header & New Project Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Portfolio Project CMS
          </h1>
          <p className="text-sm text-slate-400">
            Manage case studies, showcase projects, and feature top engineering work
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by title, tagline, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Projects List Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-xs">Loading projects database...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-base font-semibold text-white">No projects found</p>
            <p className="text-xs text-slate-400">
              Create your first project case study to populate the portfolio.
            </p>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProjects.map((project, idx) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Reorder Buttons */}
                    <td className="py-4 px-4 w-16">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveOrder(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 bg-slate-950 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded transition-all"
                        >
                          <ArrowUp className="w-3 h-3 text-slate-300" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(idx, "down")}
                          disabled={idx === filteredProjects.length - 1}
                          className="p-1 bg-slate-950 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded transition-all"
                        >
                          <ArrowDown className="w-3 h-3 text-slate-300" />
                        </button>
                      </div>
                    </td>

                    {/* Title & Description */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">
                        {project.title}
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1 max-w-md mt-0.5">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                        <span>slug: /{project.slug}</span>
                        {project.demoUrl && (
                          <span className="flex items-center gap-0.5 text-indigo-400">
                            <ExternalLink className="w-2.5 h-2.5" /> demo
                          </span>
                        )}
                        {project.githubUrl && (
                          <span className="flex items-center gap-0.5 text-slate-400">
                            <Github className="w-2.5 h-2.5" /> code
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-slate-300 font-medium">
                      {project.category || "Uncategorized"}
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          project.featured
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300"
                        }`}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        <span>{project.featured ? "Featured" : "Standard"}</span>
                      </button>
                    </td>

                    {/* Publication Toggle */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleTogglePublish(project)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          project.published
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-950 text-slate-400 border-slate-800"
                        }`}
                      >
                        {project.published ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Published
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
                        href={`/admin/projects/${project.id}/edit`}
                        className="inline-flex items-center gap-1 p-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => setDeleteTarget(project)}
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
                <h3 className="text-lg font-bold text-white">Delete Project</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">&quot;{deleteTarget.title}&quot;</strong>? Attached media references will be cleaned up.
            </p>

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
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

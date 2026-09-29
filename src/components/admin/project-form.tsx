"use client";

import { useState } from "react";
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FolderPlus,
  Globe,
  Github,
  Tag,
  Star,
  Eye,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { projectSchema } from "@/lib/validations/project";
import { ImageUpload } from "@/components/admin/image-upload";

interface ProjectData {
  id?: string;
  title: string;
  slug?: string;
  description: string;
  content?: string | null;
  clientName?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  screenshots?: string | null;
  demoUrl?: string | null;
  githubUrl?: string | null;
  technologies?: string | null;
  featured: boolean;
  published: boolean;
  order: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export function ProjectForm({ initialData }: { initialData?: ProjectData }) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [category, setCategory] = useState(initialData?.category || "Web Development");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [screenshots, setScreenshots] = useState(() => {
    if (!initialData?.screenshots) return "";
    try {
      const parsed = JSON.parse(initialData.screenshots);
      return Array.isArray(parsed) ? parsed.join("\n") : initialData.screenshots;
    } catch {
      return initialData.screenshots;
    }
  });
  const [demoUrl, setDemoUrl] = useState(initialData?.demoUrl || "");
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl || "");
  const [technologies, setTechnologies] = useState(initialData?.technologies || "");
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [published, setPublished] = useState(initialData?.published ?? true);
  const [order, setOrder] = useState(initialData?.order || 0);
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validation = projectSchema.safeParse({
      title,
      slug: slug || undefined,
      description,
      content: content || undefined,
      clientName: clientName || undefined,
      category: category || undefined,
      imageUrl: imageUrl || undefined,
      screenshots: screenshots ? screenshots.split("\n").filter(Boolean) : undefined,
      demoUrl: demoUrl || undefined,
      githubUrl: githubUrl || undefined,
      technologies: technologies || undefined,
      featured,
      published,
      order: Number(order),
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    });

    if (!validation.success) {
      const firstError = Object.values(
        validation.error.flatten().fieldErrors
      )[0]?.[0];
      setError(firstError || "Please check form inputs.");
      return;
    }

    setLoading(true);

    try {
      const url = isEditing
        ? `/api/admin/projects/${initialData.id}`
        : "/api/admin/projects";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug.trim() || undefined,
          description,
          content: content.trim() || undefined,
          clientName: clientName.trim() || undefined,
          category: category.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          screenshots: screenshots ? screenshots.split("\n").map((s) => s.trim()).filter(Boolean) : undefined,
          demoUrl: demoUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          technologies: technologies.trim() || undefined,
          featured,
          published,
          order: Number(order),
          seoTitle: seoTitle.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to save project.");
        setLoading(false);
        return;
      }

      setSuccess(`Project ${isEditing ? "updated" : "created"} successfully!`);
      if (!isEditing) {
        router.push("/admin/projects");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div
          id="project-form-error"
          className="p-4 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-200 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          id="project-form-success"
          className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-sm flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEditing ? "Edit Project Details" : "Create New Portfolio Project"}
            </h2>
            <p className="text-xs text-slate-400">
              Fill out core project metadata, case study narrative, and external links
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Project Title */}
          <div>
            <label
              htmlFor="project-title"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Project Title <span className="text-red-400">*</span>
            </label>
            <input
              id="project-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NextGen SaaS Dashboard"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Custom Slug (Optional) */}
          <div>
            <label
              htmlFor="project-slug"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Custom URL Slug (Auto-generated if empty)
            </label>
            <input
              id="project-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="nextgen-saas-dashboard"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label
            htmlFor="project-description"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
          >
            Short Summary / Tagline <span className="text-red-400">*</span>
          </label>
          <textarea
            id="project-description"
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief high-level summary displayed on portfolio cards..."
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Category */}
          <div>
            <label
              htmlFor="project-category"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Category
            </label>
            <input
              id="project-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Web Development, Mobile, UI/UX..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Client Name */}
          <div>
            <label
              htmlFor="project-client"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Client Name
            </label>
            <input
              id="project-client"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Acme Health Inc"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Display Order */}
          <div>
            <label
              htmlFor="project-order"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Display Order Number
            </label>
            <input
              id="project-order"
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <label
            htmlFor="project-tech"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
          >
            Technologies / Tech Stack (Comma separated)
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
            <input
              id="project-tech"
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="Next.js, TypeScript, TailwindCSS, PostgreSQL, Prisma"
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Media & External Links Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white">Media & External Links</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Cover Image */}
          <div>
            <ImageUpload
              label="Cover Image"
              folder="projects"
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              description="Primary portfolio showcase image"
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>

          {/* Demo Live URL */}
          <div>
            <label
              htmlFor="project-demo"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Live Demo URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
              <input
                id="project-demo"
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://example-demo.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* GitHub Repository URL */}
        <div>
          <label
            htmlFor="project-github"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
          >
            GitHub Repository URL
          </label>
          <div className="relative">
            <Github className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
            <input
              id="project-github"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/organization/repository"
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Screenshots URLs */}
        <div>
          <label
            htmlFor="project-screenshots"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
          >
            Additional Screenshots (One URL per line)
          </label>
          <textarea
            id="project-screenshots"
            rows={3}
            value={screenshots}
            onChange={(e) => setScreenshots(e.target.value)}
            placeholder="https://images.unsplash.com/screenshot1.png&#10;https://images.unsplash.com/screenshot2.png"
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Case Study Content Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <span>Full Case Study Content (Markdown / HTML)</span>
        </h3>
        <textarea
          id="project-content"
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="### Project Overview&#10;&#10;Explain challenge, solution architecture, engineering highlights, key features, and results..."
          className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Visibility, Featured & SEO Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white">Publishing & SEO Settings</h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              Published (Visible on public site)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" />
              Featured Project (Max 3 allowed)
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* SEO Title */}
          <div>
            <label
              htmlFor="project-seo-title"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              SEO Meta Title
            </label>
            <input
              id="project-seo-title"
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. NextGen SaaS Platform Case Study | Webgent"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* SEO Description */}
          <div>
            <label
              htmlFor="project-seo-desc"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              SEO Meta Description
            </label>
            <input
              id="project-seo-desc"
              type="text"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Detailed case study on how Webgent built NextGen SaaS Dashboard..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        id="save-project-button"
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Saving Project...</span>
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            <span>{isEditing ? "Update Project" : "Create Project"}</span>
          </>
        )}
      </button>
    </form>
  );
}

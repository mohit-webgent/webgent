"use client";

import { useState } from "react";
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Tag,
  Eye,
  Clock,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { blogPostSchema } from "@/lib/validations/blog";
import { ImageUpload } from "@/components/admin/image-upload";

interface BlogPostData {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  ogImage?: string | null;
  category?: string | null;
  tags?: string | null;
  readTime?: number | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export function BlogForm({ initialData }: { initialData?: BlogPostData }) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [ogImage, setOgImage] = useState(initialData?.ogImage || "");
  const [category, setCategory] = useState(initialData?.category || "Engineering");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    initialData?.status || "DRAFT",
  );
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");

  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const liveReadTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validation = blogPostSchema.safeParse({
      title,
      slug: slug || undefined,
      excerpt: excerpt || undefined,
      content,
      coverImage: coverImage || undefined,
      ogImage: ogImage || undefined,
      category: category || undefined,
      tags: tags || undefined,
      status,
      featured,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    });

    if (!validation.success) {
      const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0];
      setError(firstError || "Please inspect form errors.");
      return;
    }

    setLoading(true);

    try {
      const url = isEditing ? `/api/admin/blog/${initialData.id}` : "/api/admin/blog";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug.trim() || undefined,
          excerpt: excerpt.trim() || undefined,
          content,
          coverImage: coverImage.trim() || undefined,
          ogImage: ogImage.trim() || undefined,
          category: category.trim() || undefined,
          tags: tags.trim() || undefined,
          status,
          featured,
          seoTitle: seoTitle.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to save blog article.");
        setLoading(false);
        return;
      }

      setSuccess(`Article ${isEditing ? "updated" : "created"} successfully!`);
      if (!isEditing) {
        router.push("/admin/blog");
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
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? "Edit Article Details" : "Create New Blog Article"}
              </h2>
              <p className="text-xs text-slate-400">
                Write technical articles, design case studies, and engineering insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-indigo-400">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Estimated {liveReadTime} min read ({wordCount} words)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Article Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Building High-Performance Web Applications in 2026"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Custom URL Slug (Auto-generated if empty)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="building-high-performance-web-applications"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Article Excerpt / Abstract
          </label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A concise summary of the article displayed on blog cards and search results..."
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Engineering, Architecture, Design, AI..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Tags (Comma separated)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="nextjs, typescript, prisma, database"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>MDX / Markdown Article Content</span>
          </h3>

          <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "editor"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Write (MDX)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "preview"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Live Preview
            </button>
          </div>
        </div>

        {activeTab === "editor" ? (
          <textarea
            required
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# Introduction&#10;&#10;Write your MDX content here using markdown headers, code blocks, lists, and images..."
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl min-h-[350px] prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
            {content || "(No content written yet)"}
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white">Media & Social Sharing Images</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <ImageUpload
              label="Cover Image"
              folder="blog"
              value={coverImage}
              onChange={(url) => setCoverImage(url)}
              description="Primary header banner for the article"
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>

          <div>
            <ImageUpload
              label="Open Graph (OG) Social Image"
              folder="blog"
              value={ogImage}
              onChange={(url) => setOgImage(url)}
              description="Preview card for Twitter, LinkedIn, and Discord"
              placeholder="https://images.unsplash.com/og-banner.png"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white">Publishing & SEO Optimization</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="DRAFT">Draft (Hidden from public site)</option>
              <option value="PUBLISHED">Published (Publicly accessible)</option>
              <option value="ARCHIVED">Archived (Soft-deleted)</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-3 cursor-pointer pt-6">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                Feature on Blog Landing Page
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              SEO Meta Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. Next.js 14 Performance Guide | Webgent Blog"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              SEO Meta Description
            </label>
            <input
              type="text"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="In-depth guide covering App Router performance tuning..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Saving Article...</span>
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            <span>{isEditing ? "Update Article" : "Create Article"}</span>
          </>
        )}
      </button>
    </form>
  );
}

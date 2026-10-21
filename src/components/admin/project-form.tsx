"use client";

import { useState, useRef } from "react";
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
  Plus,
  FolderOpen,
  Image as ImageIcon,
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { projectSchema } from "@/lib/validations/project";
import { ImageUpload } from "@/components/admin/image-upload";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";

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
  const [newScreenshotUrl, setNewScreenshotUrl] = useState("");
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const [showRawTextarea, setShowRawTextarea] = useState(false);
  const [previewModalIdx, setPreviewModalIdx] = useState<number | null>(null);

  const screenshotList = screenshots
    ? screenshots
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const handleAddScreenshotUrl = (urlToAdd?: string) => {
    const url = (urlToAdd || newScreenshotUrl).trim();
    if (!url) return;
    if (screenshotList.includes(url)) {
      setNewScreenshotUrl("");
      return;
    }
    const updated = [...screenshotList, url].join("\n");
    setScreenshots(updated);
    setNewScreenshotUrl("");
  };

  const handleAddMultipleScreenshotUrls = (urlsToAdd: string[]) => {
    const valid = urlsToAdd
      .map((u) => u.trim())
      .filter((u) => u && !screenshotList.includes(u));
    if (valid.length === 0) return;
    const updated = [...screenshotList, ...valid].join("\n");
    setScreenshots(updated);
  };

  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState("");
  const [galleryDragActive, setGalleryDragActive] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectSystemUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const validFiles = fileArray.filter((f) => {
      if (!validMimes.includes(f.type)) {
        setError(`File "${f.name}" is not a supported format (JPG, PNG, WEBP, AVIF).`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError(`File "${f.name}" exceeds the 5MB size limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setIsUploadingGallery(true);
      setError(null);
      const newUrls: string[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setGalleryUploadProgress(`Uploading ${i + 1} of ${validFiles.length}: ${file.name}...`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "projects");

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || `Failed to upload "${file.name}"`);
        }

        if (json.data?.url) {
          newUrls.push(json.data.url);
        }
      }

      handleAddMultipleScreenshotUrls(newUrls);
      setSuccess(`Successfully uploaded ${newUrls.length} screenshot${newUrls.length === 1 ? "" : "s"} from your device.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "System upload failed.";
      setError(msg);
    } finally {
      setIsUploadingGallery(false);
      setGalleryUploadProgress("");
    }
  };

  const handleRemoveScreenshot = (indexToRemove: number) => {
    const updated = screenshotList.filter((_, idx) => idx !== indexToRemove).join("\n");
    setScreenshots(updated);
  };
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
      const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0];
      setError(firstError || "Please check form inputs.");
      return;
    }

    setLoading(true);

    try {
      const url = isEditing ? `/api/admin/projects/${initialData.id}` : "/api/admin/projects";
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
          screenshots: screenshots
            ? screenshots
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
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

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white">Media & External Links</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label
                htmlFor="project-screenshots-input"
                className="block text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider"
              >
                Interface &amp; Telemetry Gallery (Screenshots)
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add screenshots via normal direct link or choose directly from your Media Library
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRawTextarea(!showRawTextarea)}
              className="text-[11px] font-mono text-slate-400 hover:text-white underline self-start sm:self-auto cursor-pointer"
            >
              {showRawTextarea ? "Hide Raw Textarea" : "Bulk Edit / Paste URLs"}
            </button>
          </div>

          {/* Controls: Direct URL Input + Add Button + Upload from Computer + Media Library Picker Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <ImageIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                id="project-screenshots-input"
                type="url"
                value={newScreenshotUrl}
                onChange={(e) => setNewScreenshotUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddScreenshotUrl();
                  }
                }}
                placeholder="Paste normal image link (https://...)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-none text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={() => handleAddScreenshotUrl()}
              disabled={!newScreenshotUrl.trim()}
              className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 text-white border border-slate-700 rounded-none text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add URL</span>
            </button>

            {/* Direct Upload From System Button */}
            <input
              ref={galleryFileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleDirectSystemUpload(e.target.files);
                }
                e.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => galleryFileInputRef.current?.click()}
              disabled={isUploadingGallery}
              className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-none text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              title="Upload multiple screenshot files directly from your computer"
            >
              {isUploadingGallery ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>{galleryUploadProgress || "Uploading..."}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload from Computer</span>
                </>
              )}
            </button>

            {/* Pick from Media Library Button */}
            <button
              type="button"
              onClick={() => setIsGalleryPickerOpen(true)}
              className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-slate-700 rounded-none text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              title="Choose one or more images from your existing Media Library"
            >
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              <span>Pick from Media Library</span>
            </button>
          </div>

          {/* Drag & Drop Zone for Direct Multi-Image Upload */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setGalleryDragActive(true);
            }}
            onDragLeave={() => setGalleryDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setGalleryDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleDirectSystemUpload(e.dataTransfer.files);
              }
            }}
            onClick={() => galleryFileInputRef.current?.click()}
            className={`p-3.5 border border-dashed transition-all text-center cursor-pointer ${
              galleryDragActive
                ? "border-emerald-400 bg-emerald-500/10 text-emerald-300"
                : "border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-mono">
              <UploadCloud className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isUploadingGallery
                  ? galleryUploadProgress || "Uploading screenshots from your system..."
                  : "Drag & drop multiple screenshot images here, or click to upload directly from computer"}
              </span>
              <span className="text-[10px] text-slate-500">(PNG, JPG, WebP, AVIF up to 5MB each)</span>
            </div>
          </div>

          {/* MediaPickerModal Instance (with Multi-Select & Batch Upload Support) */}
          <MediaPickerModal
            isOpen={isGalleryPickerOpen}
            onClose={() => setIsGalleryPickerOpen(false)}
            folder="projects"
            title="Select Project Screenshots from Media Library"
            multiple={true}
            onSelect={(asset) => {
              handleAddScreenshotUrl(asset.url);
              setIsGalleryPickerOpen(false);
            }}
            onSelectMultiple={(assets) => {
              handleAddMultipleScreenshotUrls(assets.map((a) => a.url));
              setIsGalleryPickerOpen(false);
            }}
          />

          {/* Screenshots Preview Cards Grid */}
          {screenshotList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
              {screenshotList.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setPreviewModalIdx(idx)}
                  className="relative group bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-none overflow-hidden flex flex-col transition-all cursor-pointer"
                  title="Click to view full image in modal"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/50">
                    <img
                      src={url}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 text-[10px] font-mono text-emerald-400 border border-white/10">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveScreenshot(idx);
                      }}
                      className="absolute top-1 right-1 p-1 bg-rose-950/90 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-colors cursor-pointer z-10"
                      title="Remove screenshot"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-[10px] font-mono text-emerald-300 bg-black/80 px-2 py-0.5 border border-emerald-500/30 flex items-center gap-1 shadow-md">
                        <ZoomIn className="w-3 h-3 text-emerald-400" />
                        Preview
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-900 border-t border-slate-800/80">
                    <p className="text-[10px] font-mono text-slate-400 truncate" title={url}>
                      {url}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-dashed border-slate-800 text-center text-xs font-mono text-slate-500">
              No gallery screenshots added yet. Paste an image link above or pick from the Media Library.
            </div>
          )}

          {/* Screenshot Preview Modal (Admin Form) */}
          {previewModalIdx !== null && screenshotList[previewModalIdx] && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Screenshot Preview Modal"
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
              onClick={() => setPreviewModalIdx(null)}
            >
              <div
                className="relative w-full max-w-4xl max-h-[90vh] bg-[#0D0D12] border border-white/[0.14] shadow-2xl flex flex-col rounded-none overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#09090D] shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
                      Screenshot {previewModalIdx + 1} of {screenshotList.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={screenshotList[previewModalIdx]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-white transition-colors"
                      title="Open link in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setPreviewModalIdx(null)}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors"
                      title="Close (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative flex-1 min-h-[250px] max-h-[calc(88vh-110px)] bg-black/60 flex items-center justify-center p-4 overflow-hidden">
                  <img
                    src={screenshotList[previewModalIdx]}
                    alt={`Screenshot preview ${previewModalIdx + 1}`}
                    className="max-h-[66vh] max-w-full w-auto h-auto object-contain shadow-2xl border border-white/[0.08]"
                  />

                  {screenshotList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewModalIdx((prev) =>
                            prev !== null
                              ? prev > 0
                                ? prev - 1
                                : screenshotList.length - 1
                              : null
                          );
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/80 hover:bg-black text-white border border-white/20 transition-all cursor-pointer"
                        title="Previous screenshot"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewModalIdx((prev) =>
                            prev !== null
                              ? prev < screenshotList.length - 1
                                ? prev + 1
                                : 0
                              : null
                          );
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/80 hover:bg-black text-white border border-white/20 transition-all cursor-pointer"
                        title="Next screenshot"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-slate-800 bg-[#09090D] flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
                  <span className="truncate max-w-md">{screenshotList[previewModalIdx]}</span>
                  <span>ESC to close</span>
                </div>
              </div>
            </div>
          )}

          {/* Raw Textarea Bulk Editor (Shown when toggled) */}
          {showRawTextarea && (
            <div className="space-y-1.5 pt-2">
              <label
                htmlFor="project-screenshots"
                className="block text-[11px] font-mono text-slate-400"
              >
                Raw URLs List (One URL per line):
              </label>
              <textarea
                id="project-screenshots"
                rows={3}
                value={screenshots}
                onChange={(e) => setScreenshots(e.target.value)}
                placeholder="https://images.unsplash.com/screenshot1.png&#10;https://images.unsplash.com/screenshot2.png"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-none text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>
          )}
        </div>
      </div>

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

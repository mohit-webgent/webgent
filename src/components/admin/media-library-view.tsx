"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Search,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  LayoutGrid,
  List,
  RefreshCw,
  Loader2,
  Edit2,
  X,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { AllowedFolder } from "@/lib/services/storage";

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  storageKey: string;
  bucket: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  folder: AllowedFolder;
  createdAt: string;
  updatedAt: string;
  referencesCount?: number;
  references?: Array<{
    type: "project" | "blog" | "testimonial" | "user" | "seo";
    id: string;
    title: string;
    field: string;
    status?: string;
  }>;
}

export function MediaLibraryView() {
  const toast = useToast();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [usageFilter, setUsageFilter] = useState<"all" | "in-use" | "unused">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "size" | "filename">("createdAt");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selection & Detail Modals
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editingAltText, setEditingAltText] = useState<string>("");
  const [editingFolder, setEditingFolder] = useState<AllowedFolder>("general");
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  // Deletion Modal
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [deleteForce, setDeleteForce] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Uploading state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState<AllowedFolder>("general");
  const [uploadAltText, setUploadAltText] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Copied URL state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch media library items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedFolder !== "all") params.set("folder", selectedFolder);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load media assets");
      }

      setItems(json.data.items || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load media assets.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, selectedFolder, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Copy to clipboard
  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    toast.success("Image URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: MediaItem) => {
    setEditingItem(item);
    setEditingAltText(item.altText || "");
    setEditingFolder(item.folder || "general");
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      setSavingEdit(true);
      const res = await fetch(`/api/admin/media/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          altText: editingAltText,
          folder: editingFolder,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update media details");
      }

      toast.success("Media details updated successfully.");
      setEditingItem(null);
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update details.";
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  // Trigger Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/media/${deletingItem.id}?force=${deleteForce}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (res.status === 409) {
          throw new Error(json.error?.message || "Asset is actively referenced. Deletion blocked.");
        }
        throw new Error(json.error?.message || "Failed to delete asset");
      }

      toast.success("Asset deleted successfully from Supabase Storage.");
      setDeletingItem(null);
      setDeleteForce(false);
      if (selectedItem?.id === deletingItem.id) setSelectedItem(null);
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete asset.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select an image file to upload.");
      return;
    }

    if (uploadFile.size > 5 * 1024 * 1024) {
      setUploadError("File exceeds the maximum limit of 5MB.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!validTypes.includes(uploadFile.type)) {
      setUploadError("Unsupported format. Please select a JPG, PNG, WebP, or AVIF image.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(20);

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("folder", uploadFolder);
      if (uploadAltText.trim()) {
        formData.append("altText", uploadAltText.trim());
      }

      setUploadProgress(60);
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Upload failed");
      }

      setUploadProgress(100);
      toast.success("Image uploaded successfully to Supabase Storage!");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadAltText("");
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during upload.";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Filter items by usage
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const refCount = item.referencesCount || 0;
      if (usageFilter === "in-use") return refCount > 0;
      if (usageFilter === "unused") return refCount === 0;
      return true;
    });
  }, [items, usageFilter]);

  // Total storage calculated
  const totalStorageBytes = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.size || 0), 0);
  }, [items]);

  const totalStorageMb = (totalStorageBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0E0E10] border border-white/[0.08] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F5F5F3]">Media & Asset Library</h1>
              <p className="text-xs text-[#8A8A8A]">
                High-performance image storage powered by Supabase Storage bucket:{" "}
                <span className="font-mono text-indigo-400">webgent-media</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchItems}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#A0A0A0] hover:text-[#F5F5F3] border border-white/[0.08] transition-colors"
            title="Refresh assets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Asset</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#0E0E10] border border-white/[0.08]">
          <p className="text-[11px] text-[#8A8A8A] uppercase font-mono">Total Assets</p>
          <p className="text-xl sm:text-2xl font-bold text-[#F5F5F3] mt-1">{items.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0E0E10] border border-white/[0.08]">
          <p className="text-[11px] text-[#8A8A8A] uppercase font-mono">Storage Used</p>
          <p className="text-xl sm:text-2xl font-bold text-[#F5F5F3] mt-1">
            {totalStorageMb} <span className="text-xs font-normal text-[#8A8A8A]">MB</span>
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#0E0E10] border border-white/[0.08]">
          <p className="text-[11px] text-[#8A8A8A] uppercase font-mono">In Use Content</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            {items.filter((i) => (i.referencesCount || 0) > 0).length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#0E0E10] border border-white/[0.08]">
          <p className="text-[11px] text-[#8A8A8A] uppercase font-mono">Unreferenced</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
            {items.filter((i) => (i.referencesCount || 0) === 0).length}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-[#0E0E10] border border-white/[0.08] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by filename, original name, or alt text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-[#F5F5F3] placeholder:text-[#606060] focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* View Toggles & Sorting */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Usage filter */}
            <select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value as "all" | "in-use" | "unused")}
              className="px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-[#A0A0A0] focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Usages</option>
              <option value="in-use">In Use (Referenced)</option>
              <option value="unused">Unreferenced (Safe to purge)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const parts = e.target.value.split("-");
                setSortBy(parts[0] as "createdAt" | "size" | "filename");
                setSortOrder(parts[1] as "desc" | "asc");
              }}
              className="px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-[#A0A0A0] focus:outline-none focus:border-indigo-500"
            >
              <option value="createdAt-desc">Newest Uploads</option>
              <option value="createdAt-asc">Oldest Uploads</option>
              <option value="size-desc">Largest Size</option>
              <option value="size-asc">Smallest Size</option>
              <option value="filename-asc">Filename (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-black/40 border border-white/[0.08] rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white/[0.12] text-white"
                    : "text-[#8A8A8A] hover:text-[#F5F5F3]"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white/[0.12] text-white"
                    : "text-[#8A8A8A] hover:text-[#F5F5F3]"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Folder Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {["all", "projects", "blog", "testimonials", "general"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFolder(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all shrink-0 ${
                selectedFolder === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white/[0.04] text-[#A0A0A0] hover:bg-white/[0.08] hover:text-[#F5F5F3]"
              }`}
            >
              {f === "all" ? "All Folders" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse p-3 flex flex-col justify-between"
            >
              <div className="w-full h-24 bg-white/[0.04] rounded-xl" />
              <div className="space-y-1.5">
                <div className="w-3/4 h-3 bg-white/[0.04] rounded" />
                <div className="w-1/2 h-2 bg-white/[0.04] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-3">
          <AlertTriangle className="w-8 h-8 mx-auto text-rose-400" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchItems}
            className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-medium"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0E0E10] border border-white/[0.08] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#8A8A8A]">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F3]">No images found</h3>
            <p className="text-xs text-[#8A8A8A] max-w-sm mx-auto mt-1">
              {search || selectedFolder !== "all" || usageFilter !== "all"
                ? "No media items matched your active search filters."
                : "Your Supabase storage bucket has no uploaded assets yet. Click 'Upload New Asset' to begin."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            Upload First Image
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ================= GRID VIEW ================= */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredItems.map((item) => {
            const sizeKb = (item.size / 1024).toFixed(0);
            const refCount = item.referencesCount || 0;

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-[#0E0E10] border border-white/[0.08] hover:border-indigo-500/50 p-2.5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-black/50"
              >
                {/* Thumbnail Container */}
                <div
                  onClick={() => setSelectedItem(item)}
                  className="w-full aspect-square rounded-xl bg-black/60 border border-white/[0.04] overflow-hidden relative cursor-pointer flex items-center justify-center group-hover:opacity-95"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)",
                    backgroundSize: "16px 16px",
                    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                  }}
                >
                  <img
                    src={item.url}
                    alt={item.altText || item.filename}
                    loading="lazy"
                    className="w-full h-full object-contain"
                  />

                  {/* Usage Badge */}
                  <div className="absolute top-2 left-2">
                    {refCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 shadow">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{refCount}</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md bg-zinc-900/80 border border-white/10 text-zinc-400 text-[10px] font-medium shadow">
                        Unused
                      </span>
                    )}
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(item);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Copy Public URL"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(item);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Edit metadata"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingItem(item);
                        setDeleteForce(false);
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="pt-2 space-y-1">
                  <p
                    className="text-xs font-medium text-[#F5F5F3] truncate"
                    title={item.originalName || item.filename}
                  >
                    {item.originalName || item.filename}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#8A8A8A] font-mono">
                    <span className="uppercase">{item.folder}</span>
                    <span>{sizeKb} KB</span>
                  </div>

                  {item.altText ? (
                    <p className="text-[10px] text-[#A0A0A0] truncate italic" title={item.altText}>
                      &ldquo;{item.altText}&rdquo;
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-500/80 italic">No alt text</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= LIST VIEW ================= */
        <div className="rounded-2xl bg-[#0E0E10] border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-black/40 text-[#8A8A8A] font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Folder</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Alt Text</th>
                  <th className="py-3 px-4">Usage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredItems.map((item) => {
                  const sizeKb = (item.size / 1024).toFixed(0);
                  const refCount = item.referencesCount || 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="py-2.5 px-4">
                        <div className="w-12 h-12 rounded-lg bg-black border border-white/[0.06] overflow-hidden flex items-center justify-center">
                          <img
                            src={item.url}
                            alt={item.altText || item.filename}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </td>

                      <td className="py-2.5 px-4 font-medium text-[#F5F5F3]">
                        <p className="truncate max-w-xs">{item.originalName || item.filename}</p>
                        <p className="text-[10px] text-[#8A8A8A] font-mono truncate max-w-xs">
                          {item.storageKey}
                        </p>
                      </td>

                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[#A0A0A0] text-[10px] uppercase font-mono">
                          {item.folder}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 font-mono text-[#8A8A8A]">{sizeKb} KB</td>

                      <td className="py-2.5 px-4 text-[#A0A0A0] max-w-xs truncate">
                        {item.altText ? (
                          <span>&ldquo;{item.altText}&rdquo;</span>
                        ) : (
                          <span className="text-amber-500/80 italic">No alt text</span>
                        )}
                      </td>

                      <td className="py-2.5 px-4">
                        {refCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>{refCount} place(s)</span>
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-zinc-400 text-[10px]">
                            Unused
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(item)}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#A0A0A0] hover:text-[#F5F5F3] transition-colors"
                            title="Copy Public URL"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#A0A0A0] hover:text-[#F5F5F3] transition-colors"
                            title="Edit metadata"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingItem(item);
                              setDeleteForce(false);
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= DETAIL PREVIEW MODAL ================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0E0E10] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-[#F5F5F3] truncate max-w-md">
                  {selectedItem.originalName || selectedItem.filename}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 text-[#8A8A8A] hover:text-[#F5F5F3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Preview Box */}
              <div
                className="w-full h-64 rounded-xl bg-black border border-white/[0.06] overflow-hidden flex items-center justify-center relative p-2"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                }}
              >
                <img
                  src={selectedItem.url}
                  alt={selectedItem.altText || selectedItem.filename}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] text-[#8A8A8A] uppercase font-mono">Format</p>
                  <p className="font-semibold text-[#F5F5F3] mt-0.5 uppercase">
                    {selectedItem.mimeType.replace("image/", "")}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] text-[#8A8A8A] uppercase font-mono">Size</p>
                  <p className="font-semibold text-[#F5F5F3] mt-0.5">
                    {(selectedItem.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] text-[#8A8A8A] uppercase font-mono">Folder</p>
                  <p className="font-semibold text-[#F5F5F3] mt-0.5 capitalize">
                    {selectedItem.folder}
                  </p>
                </div>
              </div>

              {/* Alt Text Section */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <p className="text-[10px] text-[#8A8A8A] uppercase font-mono">Alt Text (Accessibility & SEO)</p>
                <p className="text-xs text-[#E5E5E3]">
                  {selectedItem.altText || (
                    <span className="text-amber-400 italic">No alt text provided yet.</span>
                  )}
                </p>
              </div>

              {/* Public URL Box */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-[#8A8A8A] uppercase font-mono">Public CDN / Supabase URL</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedItem.url}
                    className="flex-1 px-3 py-2 bg-black border border-white/[0.08] rounded-xl text-xs text-[#8A8A8A] font-mono truncate select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(selectedItem)}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shrink-0"
                  >
                    {copiedId === selectedItem.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#A0A0A0] hover:text-white border border-white/[0.08]"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Active References Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-[#8A8A8A] uppercase font-mono">
                    Content References ({selectedItem.references?.length || 0})
                  </p>
                </div>

                {selectedItem.references && selectedItem.references.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedItem.references.map((ref, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono uppercase">
                            {ref.type}
                          </span>
                          <span className="font-medium text-[#F5F5F3]">{ref.title}</span>
                          <span className="text-[10px] text-[#8A8A8A]">({ref.field})</span>
                        </div>
                        {ref.status && (
                          <span className="text-[10px] font-mono text-[#8A8A8A] uppercase">
                            {ref.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-[#8A8A8A] flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>This asset is not currently referenced in published or draft content.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleOpenEdit(selectedItem);
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#F5F5F3] text-xs font-medium border border-white/[0.08]"
              >
                Edit Metadata
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeletingItem(selectedItem);
                  setDeleteForce(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-medium border border-rose-500/20 transition-colors"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT METADATA MODAL ================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E0E10] border border-white/[0.12] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F5F5F3]">Edit Asset Metadata</h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 text-[#8A8A8A] hover:text-[#F5F5F3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#A0A0A0] mb-1">
                  Alt Text (Descriptive text for accessibility & SEO)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Modern dashboard showing web metrics"
                  value={editingAltText}
                  onChange={(e) => setEditingAltText(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-white/[0.08] rounded-xl text-xs text-[#F5F5F3] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0A0A0] mb-1">
                  Folder Category
                </label>
                <select
                  value={editingFolder}
                  onChange={(e) => setEditingFolder(e.target.value as AllowedFolder)}
                  className="w-full px-3 py-2 bg-black border border-white/[0.08] rounded-xl text-xs text-[#F5F5F3] focus:outline-none focus:border-indigo-500 capitalize"
                >
                  <option value="projects">Projects</option>
                  <option value="blog">Blog</option>
                  <option value="testimonials">Testimonials</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-[#A0A0A0] hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5"
              >
                {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= UPLOAD MODAL ================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUploadSubmit}
            className="w-full max-w-lg bg-[#0E0E10] border border-white/[0.12] rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-[#F5F5F3]">Upload Image to Supabase</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-[#8A8A8A] hover:text-[#F5F5F3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* File drop zone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A0A0A0]">Select Image File</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadFile(e.target.files[0]);
                  }
                }}
                className="w-full px-3 py-2 bg-black border border-white/[0.08] rounded-xl text-xs text-[#F5F5F3] file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
              />
              <p className="text-[11px] text-[#8A8A8A]">
                Supported: JPEG, PNG, WebP, AVIF. Max 5MB. SVG is rejected for safety.
              </p>
            </div>

            {/* Folder Destination */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A0A0A0]">Folder Destination</label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value as AllowedFolder)}
                className="w-full px-3 py-2 bg-black border border-white/[0.08] rounded-xl text-xs text-[#F5F5F3] focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="projects">projects (images/projects/)</option>
                <option value="blog">blog (images/blog/)</option>
                <option value="testimonials">testimonials (images/testimonials/)</option>
                <option value="general">general (images/general/)</option>
              </select>
            </div>

            {/* Alt Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A0A0A0]">
                Alt Text (Recommended for SEO)
              </label>
              <input
                type="text"
                placeholder="Descriptive text for this image..."
                value={uploadAltText}
                onChange={(e) => setUploadAltText(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-white/[0.08] rounded-xl text-xs text-[#F5F5F3] focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Progress bar */}
            {isUploading && (
              <div className="space-y-1 pt-2">
                <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-center text-[#8A8A8A] font-mono">
                  Uploading to Supabase Storage...
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-[#A0A0A0] hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Start Upload</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E0E10] border border-rose-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">Delete Media Asset</h3>
            </div>

            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-white">
                {deletingItem.originalName || deletingItem.filename}
              </span>{" "}
              from Supabase Storage and the database?
            </p>

            {/* Reference Warning if referenced */}
            {(deletingItem.referencesCount || 0) > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Warning: This image is referenced in {deletingItem.referencesCount} place(s)!</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Deleting this file will break images in published or draft content.
                </p>

                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="forceDeleteCheckbox"
                    checked={deleteForce}
                    onChange={(e) => setDeleteForce(e.target.checked)}
                    className="rounded border-amber-500/50 bg-black/40 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="forceDeleteCheckbox" className="text-[11px] text-amber-200 cursor-pointer">
                    I understand the risk and wish to force deletion anyway
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingItem(null);
                  setDeleteForce(false);
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-[#A0A0A0] hover:text-white text-xs font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting || ((deletingItem.referencesCount || 0) > 0 && !deleteForce)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

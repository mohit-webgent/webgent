"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Search,
  UploadCloud,
  Check,
  ImageIcon,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { AllowedFolder } from "@/lib/services/storage";

export interface MediaPickerAsset {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  altText?: string | null;
  folder: string;
}

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: { url: string; altText?: string; filename: string }) => void;
  folder?: AllowedFolder | "all";
  title?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  folder = "all",
  title = "Select Image from Media Library",
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaPickerAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [activeFolder, setActiveFolder] = useState<string>(folder);
  const [selectedAsset, setSelectedAsset] = useState<MediaPickerAsset | null>(null);

  // Tab: "library" or "upload"
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");

  // Inline upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState<AllowedFolder>(
    folder !== "all" ? folder : "general",
  );
  const [uploadAltText, setUploadAltText] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!isOpen) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeFolder !== "all") params.set("folder", activeFolder);
      params.set("limit", "60");

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setItems(json.data.items || []);
      } else {
        setError(json.error?.message || "Failed to load media assets");
      }
    } catch {
      setError("Network error loading assets.");
    } finally {
      setLoading(false);
    }
  }, [isOpen, search, activeFolder]);

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
      setSelectedAsset(null);
      setActiveTab("library");
      setUploadError(null);
    }
  }, [isOpen, fetchAssets]);

  if (!isOpen) return null;

  const handleConfirmSelect = () => {
    if (!selectedAsset) return;
    onSelect({
      url: selectedAsset.url,
      altText: selectedAsset.altText || undefined,
      filename: selectedAsset.originalName || selectedAsset.filename,
    });
    onClose();
  };

  const handleInlineUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("folder", uploadFolder);
      if (uploadAltText.trim()) {
        formData.append("altText", uploadAltText.trim());
      }

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Upload failed");
      }

      const uploaded = json.data;
      onSelect({
        url: uploaded.url,
        altText: uploaded.altText || undefined,
        filename: uploaded.originalName || uploaded.filename,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error occurred.";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0E0E10] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[720px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F5F5F3]">{title}</h3>
              <p className="text-[11px] text-[#8A8A8A]">
                Choose an existing image or upload a new one to Supabase Storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-black/40 rounded-xl p-0.5 border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setActiveTab("library")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "library"
                    ? "bg-white/[0.12] text-white"
                    : "text-[#8A8A8A] hover:text-[#F5F5F3]"
                }`}
              >
                Media Library
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "upload"
                    ? "bg-white/[0.12] text-white"
                    : "text-[#8A8A8A] hover:text-[#F5F5F3]"
                }`}
              >
                Upload New
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#F5F5F3] hover:bg-white/[0.04]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: Library Browser */}
        {activeTab === "library" ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter toolbar */}
            <div className="p-3 border-b border-white/[0.08] bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter images..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-black border border-white/[0.08] rounded-xl text-xs text-[#F5F5F3] placeholder:text-[#606060] focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Folder Pills */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
                {["all", "projects", "blog", "testimonials", "general"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setActiveFolder(f)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors shrink-0 ${
                      activeFolder === f
                        ? "bg-indigo-600 text-white"
                        : "bg-white/[0.04] text-[#A0A0A0] hover:text-[#F5F5F3]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset Grid & Preview Sidebar */}
            <div className="flex-1 flex overflow-hidden">
              {/* Asset Grid */}
              <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl bg-white/[0.02] border border-white/[0.06] animate-pulse"
                      />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-rose-400 text-xs">{error}</div>
                ) : items.length === 0 ? (
                  <div className="p-12 text-center text-[#8A8A8A] space-y-2">
                    <ImageIcon className="w-8 h-8 mx-auto text-[#606060]" />
                    <p className="text-xs">No media assets found in this folder.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {items.map((item) => {
                      const isSelected = selectedAsset?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedAsset(item)}
                          className={`group aspect-square rounded-xl overflow-hidden border cursor-pointer relative transition-all ${
                            isSelected
                              ? "border-indigo-500 ring-2 ring-indigo-500/30 scale-[0.98]"
                              : "border-white/[0.08] hover:border-white/[0.24] bg-black/60"
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={item.altText || item.filename}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />

                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                              <Check className="w-3 h-3" />
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
                            <p className="text-[10px] text-white truncate font-medium">
                              {item.originalName || item.filename}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar Preview */}
              {selectedAsset && (
                <div className="w-64 border-l border-white/[0.08] p-4 bg-black/30 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-3">
                    <div className="w-full aspect-video rounded-xl bg-black border border-white/[0.08] overflow-hidden flex items-center justify-center">
                      <img
                        src={selectedAsset.url}
                        alt={selectedAsset.altText || selectedAsset.filename}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#F5F5F3] break-all">
                        {selectedAsset.originalName || selectedAsset.filename}
                      </p>
                      <p className="text-[10px] text-[#8A8A8A] font-mono">
                        {(selectedAsset.size / 1024).toFixed(1)} KB • {selectedAsset.folder}
                      </p>
                    </div>

                    {selectedAsset.altText && (
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[10px] text-[#A0A0A0]">
                        <span className="font-semibold text-white block">Alt Text:</span>
                        {selectedAsset.altText}
                      </div>
                    )}
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleConfirmSelect}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
                    >
                      <Check className="w-4 h-4" />
                      <span>Use Selected Image</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Upload New */
          <form
            onSubmit={handleInlineUpload}
            className="flex-1 p-6 overflow-y-auto flex flex-col justify-between space-y-4 max-w-xl mx-auto w-full"
          >
            <div className="space-y-4">
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#A0A0A0]">
                  Select Image File (Max 5MB)
                </label>
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
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#A0A0A0]">Folder</label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value as AllowedFolder)}
                  className="w-full px-3 py-2 bg-black border border-white/[0.08] rounded-xl text-xs text-[#F5F5F3] capitalize"
                >
                  <option value="projects">Projects</option>
                  <option value="blog">Blog</option>
                  <option value="testimonials">Testimonials</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#A0A0A0]">Alt Text</label>
                <input
                  type="text"
                  placeholder="Describe this image for SEO and screen readers..."
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-white/[0.08] rounded-xl text-xs text-[#F5F5F3] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setActiveTab("library")}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-[#A0A0A0] text-xs font-medium"
              >
                Back to Library
              </button>

              <button
                type="submit"
                disabled={isUploading}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload & Select</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer for Library Tab */}
        {activeTab === "library" && (
          <div className="p-3 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-xs">
            <span className="text-[#8A8A8A]">
              {selectedAsset ? "1 asset selected" : "Click any image to preview and select"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] text-[#A0A0A0] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSelect}
                disabled={!selectedAsset}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium"
              >
                Select
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

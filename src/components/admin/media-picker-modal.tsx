"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Search,
  UploadCloud,
  Check,
  ImageIcon,
  Loader2,
  AlertTriangle,
  CheckSquare,
  Square,
  Trash2,
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

export interface SelectedAssetItem {
  url: string;
  altText?: string;
  filename: string;
}

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: SelectedAssetItem) => void;
  onSelectMultiple?: (assets: SelectedAssetItem[]) => void;
  folder?: AllowedFolder | "all";
  title?: string;
  multiple?: boolean;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  onSelectMultiple,
  folder = "all",
  title = "Select Image from Media Library",
  multiple = false,
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaPickerAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [activeFolder, setActiveFolder] = useState<string>(folder);

  // Single select state
  const [selectedAsset, setSelectedAsset] = useState<MediaPickerAsset | null>(null);
  // Multiple select state
  const [selectedAssets, setSelectedAssets] = useState<MediaPickerAsset[]>([]);

  // Tab: "library" or "upload"
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");

  // Inline upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadFolder, setUploadFolder] = useState<AllowedFolder>(
    folder !== "all" ? folder : "general",
  );
  const [uploadAltText, setUploadAltText] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(async () => {
    if (!isOpen) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeFolder !== "all") params.set("folder", activeFolder);
      params.set("limit", "100");

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
      setSelectedAssets([]);
      setActiveTab("library");
      setUploadError(null);
      setUploadFiles([]);
      setUploadProgress("");
    }
  }, [isOpen, fetchAssets]);

  // Keyboard escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Toggle selection for an item
  const handleItemClick = (item: MediaPickerAsset) => {
    if (multiple) {
      setSelectedAssets((prev) => {
        const exists = prev.some((a) => a.id === item.id);
        if (exists) {
          return prev.filter((a) => a.id !== item.id);
        } else {
          return [...prev, item];
        }
      });
      setSelectedAsset(item);
    } else {
      setSelectedAsset(item);
    }
  };

  const handleSelectAllVisible = () => {
    setSelectedAssets(items);
  };

  const handleClearSelection = () => {
    setSelectedAssets([]);
    setSelectedAsset(null);
  };

  const handleConfirmSelect = () => {
    if (multiple) {
      if (selectedAssets.length === 0) return;
      const formatted = selectedAssets.map((asset) => ({
        url: asset.url,
        altText: asset.altText || undefined,
        filename: asset.originalName || asset.filename,
      }));
      if (onSelectMultiple) {
        onSelectMultiple(formatted);
      } else {
        formatted.forEach((item) => onSelect(item));
      }
    } else {
      if (!selectedAsset) return;
      onSelect({
        url: selectedAsset.url,
        altText: selectedAsset.altText || undefined,
        filename: selectedAsset.originalName || selectedAsset.filename,
      });
    }
    onClose();
  };

  const handleFilesAdded = (files: FileList | File[]) => {
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const incoming = Array.from(files);
    const valid = incoming.filter((f) => {
      if (!validMimes.includes(f.type)) {
        setUploadError(`File "${f.name}" is not a supported image (JPG, PNG, WEBP, AVIF).`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        setUploadError(`File "${f.name}" exceeds the 5MB size limit.`);
        return false;
      }
      return true;
    });

    if (valid.length > 0) {
      setUploadError(null);
      if (multiple) {
        setUploadFiles((prev) => [...prev, ...valid]);
      } else {
        setUploadFiles([valid[0]]);
      }
    }
  };

  const handleRemoveUploadFile = (indexToRemove: number) => {
    setUploadFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleInlineUpload = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (uploadFiles.length === 0) {
      setUploadError("Please select at least one image file to upload.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const uploadedResults: SelectedAssetItem[] = [];

      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        setUploadProgress(`Uploading ${i + 1} of ${uploadFiles.length}: ${file.name}...`);

        const formData = new FormData();
        formData.append("file", file);
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
          throw new Error(json.error?.message || `Failed to upload "${file.name}"`);
        }

        const uploaded = json.data;
        uploadedResults.push({
          url: uploaded.url,
          altText: uploaded.altText || undefined,
          filename: uploaded.originalName || uploaded.filename,
        });
      }

      setUploadProgress("Done! Applying selection...");

      if (multiple && onSelectMultiple) {
        onSelectMultiple(uploadedResults);
      } else if (multiple) {
        uploadedResults.forEach((item) => onSelect(item));
      } else if (uploadedResults[0]) {
        onSelect(uploadedResults[0]);
      }

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error occurred.";
      setUploadError(msg);
      setUploadProgress("");
    } finally {
      setIsUploading(false);
    }
  };

  const totalSelected = multiple ? selectedAssets.length : selectedAsset ? 1 : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-[#0D0D12] border border-white/[0.12] rounded-none shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[760px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#09090D] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#F5F5F3] font-mono tracking-tight uppercase">
                  {title}
                </h3>
                {multiple && (
                  <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                    Multi-Select Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#888888] font-mono mt-0.5">
                {multiple
                  ? "Select multiple images from library or batch upload from your device"
                  : "Choose an existing image or upload a new one directly to Supabase Storage"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-black/60 p-0.5 border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setActiveTab("library")}
                className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${
                  activeTab === "library"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-[#888888] hover:text-white"
                }`}
              >
                Media Library
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${
                  activeTab === "upload"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-[#888888] hover:text-white"
                }`}
              >
                Upload New {multiple && "(Batch)"}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#888888] hover:text-white hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/10"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: Library Browser */}
        {activeTab === "library" ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter toolbar */}
            <div className="p-3 border-b border-white/[0.08] bg-black/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter media..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-black border border-white/[0.08] rounded-none text-xs font-mono text-[#F5F5F3] placeholder:text-[#555555] focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Folder Pills + Multi-select Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                  {["all", "projects", "blog", "testimonials", "general"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setActiveFolder(f)}
                      className={`px-2.5 py-1 text-[11px] font-mono capitalize transition-colors shrink-0 cursor-pointer ${
                        activeFolder === f
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-white/[0.04] border border-white/[0.06] text-[#888888] hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {multiple && items.length > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-white/10">
                    <button
                      type="button"
                      onClick={handleSelectAllVisible}
                      className="px-2 py-1 text-[10px] font-mono text-[#A0A0A0] hover:text-white bg-white/[0.04] border border-white/10 flex items-center gap-1 cursor-pointer"
                      title="Select all currently visible images"
                    >
                      <CheckSquare className="w-3 h-3 text-emerald-400" />
                      <span>Select All</span>
                    </button>
                    {selectedAssets.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="px-2 py-1 text-[10px] font-mono text-rose-300 hover:text-white bg-rose-950/40 border border-rose-500/30 flex items-center gap-1 cursor-pointer"
                        title="Clear all selections"
                      >
                        <Square className="w-3 h-3" />
                        <span>Clear ({selectedAssets.length})</span>
                      </button>
                    )}
                  </div>
                )}
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
                        className="aspect-square bg-white/[0.02] border border-white/[0.06] animate-pulse"
                      />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-rose-400 text-xs font-mono">{error}</div>
                ) : items.length === 0 ? (
                  <div className="p-12 text-center text-[#888888] space-y-2 font-mono">
                    <ImageIcon className="w-8 h-8 mx-auto text-[#444444]" />
                    <p className="text-xs">No media assets found in this folder.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {items.map((item) => {
                      const isSelected = multiple
                        ? selectedAssets.some((a) => a.id === item.id)
                        : selectedAsset?.id === item.id;
                      const selectionIndex = multiple
                        ? selectedAssets.findIndex((a) => a.id === item.id)
                        : -1;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={`group aspect-square overflow-hidden border cursor-pointer relative transition-all ${
                            isSelected
                              ? "border-emerald-400 ring-2 ring-emerald-400/40 bg-black/40 scale-[0.98]"
                              : "border-white/[0.08] hover:border-emerald-500/40 bg-black/60"
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={item.altText || item.filename}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Selected Badge */}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-emerald-500 text-black font-mono text-[10px] font-bold flex items-center gap-1 shadow-lg border border-black/30">
                              <Check className="w-3 h-3 stroke-[3]" />
                              {multiple && <span>#{selectionIndex + 1}</span>}
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
                            <p className="text-[10px] text-white truncate font-mono">
                              {item.originalName || item.filename}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar Preview (Shows clicked asset details) */}
              {selectedAsset && (
                <div className="w-64 border-l border-white/[0.08] p-4 bg-black/40 flex flex-col justify-between overflow-y-auto shrink-0 hidden md:flex">
                  <div className="space-y-3">
                    <div className="w-full aspect-[16/10] bg-black border border-white/[0.08] overflow-hidden flex items-center justify-center">
                      <img
                        src={selectedAsset.url}
                        alt={selectedAsset.altText || selectedAsset.filename}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#F5F5F3] font-mono break-all">
                        {selectedAsset.originalName || selectedAsset.filename}
                      </p>
                      <p className="text-[10px] text-[#888888] font-mono">
                        {(selectedAsset.size / 1024).toFixed(1)} KB • {selectedAsset.folder}
                      </p>
                    </div>

                    {selectedAsset.altText && (
                      <div className="p-2 bg-white/[0.02] border border-white/[0.06] text-[10px] font-mono text-[#A0A0A0]">
                        <span className="font-semibold text-white block">Alt Text:</span>
                        {selectedAsset.altText}
                      </div>
                    )}

                    {multiple && (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                        <span className="font-bold">{selectedAssets.length}</span> images selected
                        in this batch.
                      </div>
                    )}
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleConfirmSelect}
                      disabled={totalSelected === 0}
                      className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-mono font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {multiple
                          ? `Use ${selectedAssets.length} Selected Image${selectedAssets.length === 1 ? "" : "s"}`
                          : "Use Selected Image"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Upload New (PURE DIV, NEVER NESTED IN FORM TO PREVENT PARENT FORM SUBMISSION BUGS) */
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between space-y-4 max-w-2xl mx-auto w-full">
            <div className="space-y-4">
              {uploadError && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadProgress && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin text-emerald-400" />
                  <span>{uploadProgress}</span>
                </div>
              )}

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFilesAdded(e.dataTransfer.files);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-slate-800 hover:border-emerald-500/40 bg-black/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={multiple}
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesAdded(e.target.files);
                    }
                  }}
                  className="hidden"
                />

                <UploadCloud className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <p className="text-xs font-mono text-[#F5F5F3]">
                  {multiple
                    ? "Drag & drop multiple image files here, or click to browse"
                    : "Drag & drop an image file here, or click to browse"}
                </p>
                <p className="text-[10px] font-mono text-[#888888] mt-1">
                  Supports JPEG, PNG, WebP, AVIF up to 5MB each
                </p>
              </div>

              {/* Selected Files List Preview */}
              {uploadFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                    <span>
                      Files to Upload ({uploadFiles.length} file{uploadFiles.length === 1 ? "" : "s"}):
                    </span>
                    <button
                      type="button"
                      onClick={() => setUploadFiles([])}
                      className="text-rose-400 hover:text-rose-300 text-[10px] underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 border border-white/[0.08] p-2 bg-black/40">
                    {uploadFiles.map((file, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center justify-between p-1.5 bg-slate-950 border border-slate-800 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="text-emerald-400">#{fIdx + 1}</span>
                          <span className="text-white truncate">{file.name}</span>
                          <span className="text-[#888888] shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveUploadFile(fIdx)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold text-[#A0A0A0]">
                    Destination Folder
                  </label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value as AllowedFolder)}
                    className="w-full px-3 py-2 bg-black border border-white/[0.08] text-xs font-mono text-[#F5F5F3] capitalize focus:outline-none focus:border-emerald-400"
                  >
                    <option value="projects">Projects</option>
                    <option value="blog">Blog</option>
                    <option value="testimonials">Testimonials</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold text-[#A0A0A0]">
                    Alt Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description for SEO..."
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/[0.08] text-xs font-mono text-[#F5F5F3] focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-white/[0.08] shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("library")}
                className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-[#A0A0A0] text-xs font-mono transition-colors cursor-pointer"
              >
                Back to Library
              </button>

              <button
                type="button"
                onClick={handleInlineUpload}
                disabled={isUploading || uploadFiles.length === 0}
                className="px-5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-semibold flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>
                      {uploadFiles.length > 1
                        ? `Upload & Add ${uploadFiles.length} Images`
                        : "Upload & Select"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer for Library Tab */}
        {activeTab === "library" && (
          <div className="p-3 border-t border-white/[0.08] bg-[#09090D] flex items-center justify-between text-xs font-mono shrink-0">
            <span className="text-[#888888]">
              {multiple
                ? `${selectedAssets.length} image${selectedAssets.length === 1 ? "" : "s"} selected`
                : selectedAsset
                  ? "1 asset selected"
                  : "Click any image to select"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-[#888888] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSelect}
                disabled={totalSelected === 0}
                className="px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors cursor-pointer"
              >
                {multiple
                  ? `Add ${selectedAssets.length} Image${selectedAssets.length === 1 ? "" : "s"}`
                  : "Select"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  X,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { MediaPickerModal } from "./media-picker-modal";
import { AllowedFolder } from "@/lib/services/storage";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  folder: AllowedFolder;
  label?: string;
  description?: string;
  placeholder?: string;
  altText?: string;
  onAltTextChange?: (alt: string) => void;
}

export function ImageUpload({
  value,
  onChange,
  folder,
  label = "Upload Image",
  description = "PNG, JPG, WEBP, or AVIF (max. 5MB)",
  placeholder = "https://images.unsplash.com/...",
  altText,
  onAltTextChange,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    setError(null);

    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!validMimes.includes(file.type)) {
      setError("Only JPG, PNG, WEBP, and AVIF image formats are supported. SVG is rejected.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds the maximum limit of 5MB.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        setError(json.error?.message || "Failed to upload image.");
        return;
      }

      onChange(json.data.url);
      if (onAltTextChange && json.data.altText) {
        onAltTextChange(json.data.altText);
      }
    } catch {
      setError("Network error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = async () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-xs">
          <label className="text-slate-300 font-semibold">{label}</label>
          {description && <span className="text-slate-500">{description}</span>}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60 p-2 flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative flex items-center justify-center">
            <img src={value} alt={altText || "Uploaded preview"} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0 pr-10">
            <p className="text-xs font-mono text-slate-300 truncate">{value}</p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">✓ Ready and loaded</p>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="p-1.5 bg-slate-900/90 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg border border-slate-700/80 transition-all shadow-md"
              title="Change from Media Library"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-slate-900/90 hover:bg-rose-600 text-slate-400 hover:text-white rounded-lg border border-slate-700/80 transition-all shadow-md"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            dragActive
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-900/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 cursor-pointer hover:text-white hover:border-indigo-500/50 transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5 text-indigo-400" />
              )}
            </div>

            <div className="text-xs">
              <span
                onClick={() => fileInputRef.current?.click()}
                className="font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Click to upload
              </span>{" "}
              <span className="text-slate-400">or</span>{" "}
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="font-semibold text-emerald-400 hover:text-emerald-300 underline"
              >
                choose from Media Library
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Folder: <span className="font-mono text-slate-400">images/{folder}/</span>
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <div className="relative flex-1">
          <ImageIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Library</span>
        </button>
      </div>

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        folder={folder}
        onSelect={(asset) => {
          onChange(asset.url);
          if (onAltTextChange && asset.altText) {
            onAltTextChange(asset.altText);
          }
        }}
      />
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  folder: "projects" | "blog" | "testimonials";
  label?: string;
  description?: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder,
  label = "Upload Image",
  description = "PNG, JPG, or WEBP (max. 5MB)",
  placeholder = "https://images.unsplash.com/...",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    setError(null);

    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type)) {
      setError("Only JPG, PNG, and WEBP image formats are supported.");
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

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        setError(json.error?.message || "Failed to upload image.");
        return;
      }

      onChange(json.data.url);
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
    if (!value) return;
    const previousUrl = value;
    onChange("");

    if (previousUrl.includes("images/")) {
      try {
        await fetch(`/api/admin/upload`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: previousUrl }),
        });
      } catch {}
    }
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
            <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0 pr-10">
            <p className="text-xs font-mono text-slate-300 truncate">{value}</p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">✓ Ready and loaded</p>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 p-1.5 bg-slate-900/90 hover:bg-rose-600 text-slate-400 hover:text-white rounded-lg border border-slate-700/80 transition-all shadow-md"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-900/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5 text-indigo-400" />
              )}
            </div>

            <div className="text-xs">
              <span className="font-semibold text-indigo-400 hover:text-indigo-300">
                Click to upload
              </span>{" "}
              <span className="text-slate-400">or drag and drop</span>
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
      </div>
    </div>
  );
}

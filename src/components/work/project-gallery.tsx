"use client";

import * as React from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, X, ZoomIn } from "lucide-react";

interface ProjectGalleryProps {
  screenshots: string[];
  projectTitle: string;
}

export function ProjectGallery({ screenshots, projectTitle }: ProjectGalleryProps) {
  const [activeIdx, setActiveIdx] = React.useState<number | null>(null);

  const total = screenshots.length;
  const isOpen = activeIdx !== null;
  const currentUrl = activeIdx !== null ? screenshots[activeIdx] : null;

  const handlePrev = React.useCallback(() => {
    setActiveIdx((prev) => (prev !== null ? (prev > 0 ? prev - 1 : total - 1) : null));
  }, [total]);

  const handleNext = React.useCallback(() => {
    setActiveIdx((prev) => (prev !== null ? (prev < total - 1 ? prev + 1 : 0) : null));
  }, [total]);

  const handleClose = React.useCallback(() => {
    setActiveIdx(null);
  }, []);

  // Keyboard navigation & body scroll locking
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose, handlePrev, handleNext]);

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F3] flex items-center gap-2.5 tracking-tight uppercase">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Interface &amp; Telemetry Gallery</span>
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#888888] flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-emerald-400/80" />
            Click image to preview
          </span>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5">
            {total} {total === 1 ? "Screen" : "Screens"}
          </span>
        </div>
      </div>

      {/* Gallery Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {screenshots.map((url, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className="group relative bg-[#0D0D12] border border-white/[0.08] rounded-none overflow-hidden shadow-xl hover:border-emerald-500/50 transition-all text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-400"
            aria-label={`Open screenshot ${idx + 1} of ${total} in modal`}
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
              <img
                src={url}
                alt={`${projectTitle} screenshot ${idx + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Index Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400">
                #{idx + 1}
              </div>

              {/* Hover Inspection Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <span className="px-3 py-1.5 bg-black/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">
                  <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                  View Full Image
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Image Preview Modal (Dialog View, NOT Fullscreen) */}
      {isOpen && currentUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image Preview Modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleClose}
        >
          {/* Centered Modal Container */}
          <div
            className="relative w-full max-w-4xl lg:max-w-5xl max-h-[90vh] bg-[#0D0D12] border border-white/[0.14] shadow-2xl flex flex-col rounded-none overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#09090D] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider uppercase shrink-0">
                  Screen {activeIdx + 1} of {total}
                </span>
                <span className="text-xs text-[#8A8A8A] font-mono truncate hidden sm:inline">
                  — {projectTitle}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-[#888888] hover:text-white hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/10"
                  title="Open original image in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 text-[#888888] hover:text-white hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/10"
                  aria-label="Close modal (Esc)"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Body with Contain Scaling */}
            <div className="relative flex-1 min-h-[260px] max-h-[calc(88vh-120px)] bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none">
              <img
                src={currentUrl}
                alt={`${projectTitle} preview ${activeIdx + 1}`}
                className="max-h-[66vh] max-w-full w-auto h-auto object-contain shadow-2xl border border-white/[0.06] select-none"
              />

              {/* Prev / Next Navigation Arrows (when multiple images) */}
              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-black/80 hover:bg-black text-[#D0D0CE] hover:text-emerald-400 border border-white/15 transition-all shadow-xl cursor-pointer"
                    aria-label="Previous image (Left Arrow)"
                    title="Previous (Left Arrow)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-black/80 hover:bg-black text-[#D0D0CE] hover:text-emerald-400 border border-white/15 transition-all shadow-xl cursor-pointer"
                    aria-label="Next image (Right Arrow)"
                    title="Next (Right Arrow)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Modal Footer with Thumbnail Strip & Shortcuts */}
            <div className="px-4 sm:px-6 py-2.5 border-t border-white/[0.08] bg-[#09090D] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              {/* Mini Thumbnails Strip if multiple images */}
              {total > 1 ? (
                <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full scrollbar-thin">
                  {screenshots.map((thumbUrl, tIdx) => (
                    <button
                      key={tIdx}
                      type="button"
                      onClick={() => setActiveIdx(tIdx)}
                      className={`relative w-12 h-8 shrink-0 overflow-hidden border transition-all cursor-pointer ${
                        tIdx === activeIdx
                          ? "border-emerald-400 ring-1 ring-emerald-400/50 scale-105"
                          : "border-white/10 opacity-50 hover:opacity-100 hover:border-white/30"
                      }`}
                      aria-label={`Jump to screenshot ${tIdx + 1}`}
                    >
                      <img
                        src={thumbUrl}
                        alt={`Thumb ${tIdx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div />
              )}

              {/* Navigation Hints */}
              <div className="text-[11px] font-mono text-[#888888] flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span>ESC to close</span>
                {total > 1 && <span>• &larr; &rarr; to navigate</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

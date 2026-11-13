"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X, ZoomIn } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-4">
        <h2 className="display-md">Screens</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-fg-muted flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-accent/80" />
            Click image to preview
          </span>
          <span className="text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-2 py-0.5">
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
            className="group relative bg-surface textured border border-line rounded-none overflow-hidden shadow-xl hover:border-accent/50 transition-all text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
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
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md border border-line text-xs font-mono text-accent">
                #{idx + 1}
              </div>

              {/* Hover Inspection Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <span className="px-3 py-1.5 bg-black/90 border border-accent/40 text-accent text-xs font-mono flex items-center gap-1.5 shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">
                  <ZoomIn className="w-3.5 h-3.5 text-accent" />
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
            className="relative w-full max-w-4xl lg:max-w-5xl max-h-[90vh] bg-surface textured border border-line-strong shadow-2xl flex flex-col rounded-none overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-line bg-canvas textured shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                <span className="text-xs font-mono text-accent font-semibold tracking-wider uppercase shrink-0">
                  Screen {activeIdx + 1} of {total}
                </span>
                <span className="text-xs text-fg-muted font-mono truncate hidden sm:inline">
                  — {projectTitle}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-fg-muted hover:text-white hover:bg-white/[0.05] transition-colors border border-transparent hover:border-line"
                  title="Open original image in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 text-fg-muted hover:text-white hover:bg-white/[0.05] transition-colors border border-transparent hover:border-line"
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
                className="max-h-[66vh] max-w-full w-auto h-auto object-contain shadow-2xl border border-line select-none"
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-black/80 hover:bg-black text-fg-soft hover:text-accent border border-line-strong transition-all shadow-xl cursor-pointer"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-black/80 hover:bg-black text-fg-soft hover:text-accent border border-line-strong transition-all shadow-xl cursor-pointer"
                    aria-label="Next image (Right Arrow)"
                    title="Next (Right Arrow)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Modal Footer with Thumbnail Strip & Shortcuts */}
            <div className="px-4 sm:px-6 py-2.5 border-t border-line bg-canvas textured flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
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
                          ? "border-accent ring-1 ring-accent/50 scale-105"
                          : "border-line opacity-50 hover:opacity-100 hover:border-line-strong"
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
              <div className="text-xs font-mono text-fg-muted flex items-center gap-2 shrink-0 self-end sm:self-auto">
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

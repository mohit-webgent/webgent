"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Segment Error Captured:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans bg-[#080808]">
      <div className="max-w-md w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-8 sm:p-10 text-center shadow-2xl relative z-10 space-y-6">
        <div className="p-4 rounded-xl bg-[#141414] border border-white/[0.10] text-[#E5E5E3] w-14 h-14 mx-auto flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-[#E8E8E6]" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.10] text-[#A0A0A0] text-xs font-mono uppercase tracking-wider">
            Runtime Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-[#F5F5F3] tracking-tight">
            System Exception
          </h1>
          <p className="text-xs sm:text-sm text-[#969696] leading-relaxed">
            An unexpected error interrupted this view. The diagnostic telemetry payload has been
            logged.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-[#666666] bg-[#080808] px-3 py-1.5 rounded border border-white/[0.06] inline-block">
              Ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#E8E8E6] hover:bg-white text-[#080808] font-medium text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Operation</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] text-[#E5E5E3] border border-white/[0.12] font-medium text-xs transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

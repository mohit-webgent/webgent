"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global Layout Error Captured:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#080808] text-[#F5F5F3] min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-8 text-center space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.10] text-[#A0A0A0] text-xs font-mono uppercase tracking-wider">
            Critical Root Failure
          </div>
          <h1 className="text-2xl font-light text-[#F5F5F3] tracking-tight">System Interruption</h1>
          <p className="text-[#969696] text-xs leading-relaxed">
            An unhandled fatal exception occurred at the root layout boundary.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 bg-[#E8E8E6] hover:bg-white text-[#080808] rounded-lg font-medium text-xs transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}

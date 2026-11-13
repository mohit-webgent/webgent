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
      <body className="bg-canvas textured text-fg min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-surface textured border border-line rounded-xl p-8 text-center space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/[0.02] border border-line text-fg-muted text-xs font-mono uppercase tracking-wider">
            Critical Root Failure
          </div>
          <h1 className="text-2xl font-light text-fg tracking-tight">System Interruption</h1>
          <p className="text-fg-muted text-xs leading-relaxed">
            An unhandled fatal exception occurred at the root layout boundary.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-fg rounded-lg font-medium text-xs transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}

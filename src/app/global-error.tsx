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
      <body className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-3xl font-extrabold text-rose-500">Critical Application Error</h1>
          <p className="text-slate-400 text-sm">
            A unhandled fatal error occurred at the root layout boundary.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}

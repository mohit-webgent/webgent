"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

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
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="p-4 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-400">
        <AlertCircle className="h-10 w-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-slate-100">Something went wrong!</h2>
        <p className="text-sm text-slate-400">
          An unexpected application error occurred. The diagnostic log has been recorded.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-slate-500">Digest: {error.digest}</p>
        )}
      </div>

      <Button variant="primary" onClick={() => reset()} className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

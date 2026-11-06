"use client";

import * as React from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

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
    <section className="flex min-h-[70vh] items-center">
      <div className="wrap py-20 text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="display-lg mt-6">That didn&apos;t load properly.</h1>
        <p className="lede mx-auto mt-5 max-w-lg">Please try again. If it keeps happening, get in touch and I&apos;ll look into it.</p>
        {error.digest && <p className="mt-4 font-mono text-sm text-fg-muted">Reference: {error.digest}</p>}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn btn-primary">
            <RotateCcw className="h-4 w-4" />
            <span>Try again</span>
          </button>
          <Link href="/" className="btn btn-secondary">
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

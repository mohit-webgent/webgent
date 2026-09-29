"use client";

import { useEffect, useRef } from "react";
import { trackBlogRead } from "@/lib/analytics/client";

interface BlogReadTrackerProps {
  slug: string;
  title: string;
  readTime?: number | null;
}

export function BlogReadTracker({ slug, title, readTime }: BlogReadTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackBlogRead(slug, title, readTime || undefined);
    }
  }, [slug, title, readTime]);

  return null;
}

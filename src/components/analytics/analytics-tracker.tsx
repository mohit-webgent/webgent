"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics/client";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    const fullPath = pathname;
    if (lastPathnameRef.current !== fullPath) {
      lastPathnameRef.current = fullPath;
      trackPageView(fullPath);
    }
  }, [pathname, searchParams]);

  return null;
}

"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView, trackWhatsAppClick } from "@/lib/analytics/client";
import { MessageCircle } from "lucide-react";

/**
 * AnalyticsTracker automatically records page views upon route changes
 * and renders an accessible floating WhatsApp contact trigger.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // Only track public paths, ignore admin
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    const fullPath = pathname;
    if (lastPathnameRef.current !== fullPath) {
      lastPathnameRef.current = fullPath;
      trackPageView(fullPath);
    }
  }, [pathname, searchParams]);

  // If in admin, do not show public floating widgets
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleWhatsApp = () => {
    trackWhatsAppClick("floating_action_button");
    window.open("https://wa.me/15551234567?text=Hello%20Webgent%20team,%20I%20would%20like%20to%20inquire%20about%20a%20project.", "_blank", "noopener,noreferrer");
  };

  return (
    <aside aria-label="Quick Contact Actions">
      <button
        onClick={handleWhatsApp}
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-full shadow-lg shadow-emerald-950/40 hover:shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950 group"
      >
        <MessageCircle className="w-5 h-5 text-white transition-transform group-hover:rotate-12" />
        <span className="hidden sm:inline font-semibold">Chat with Us</span>
      </button>
    </aside>
  );
}

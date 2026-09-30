"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { ChatWidget } from "@/components/chat/chat-widget";

export interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        {children}
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
      </>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:p-3 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white text-xs font-bold"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      <ChatWidget />
    </div>
  );
}

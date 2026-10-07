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
    <div className="relative flex min-h-screen flex-col bg-transparent text-[#D0D0CE] selection:bg-white/15 selection:text-[#F5F5F3] overflow-x-hidden w-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:p-3 focus:bg-[#E8E8E6] focus:text-[#080808] focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-1 focus:ring-white text-xs font-mono"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1 w-full">
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

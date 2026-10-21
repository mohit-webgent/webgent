"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { ChatWidget } from "@/components/chat/chat-widget";
import { WhatsAppFloatingButton } from "./whatsapp-floating-button";

import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { ScrollProgressBar } from "@/components/animations/scroll-progress";
import { PageTransition } from "@/components/animations/page-transition";
import { WebgentOpeningAnimation } from "@/components/animations/webgent-opening-animation";
import type { NavItem, FooterConfig } from "@/lib/services/cms-shared";

export interface MainLayoutProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  footerData?: FooterConfig;
}

export function MainLayout({ children, navItems, footerData }: MainLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isHome = pathname === "/";

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
    <SmoothScrollProvider>
      {isHome && <WebgentOpeningAnimation />}
      <div className="relative flex min-h-screen flex-col bg-transparent text-[#D0D0CE] selection:bg-white/15 selection:text-[#F5F5F3] overflow-x-clip w-full">
        <ScrollProgressBar />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:p-3 focus:bg-[#E8E8E6] focus:text-[#080808] focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-1 focus:ring-white text-xs font-mono"
        >
          Skip to main content
        </a>
        <Header navItems={navItems} />
        <main id="main-content" className="flex-1 w-full">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer data={footerData} />
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <WhatsAppFloatingButton />
        <ChatWidget />
      </div>
    </SmoothScrollProvider>
  );
}

"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { ChatWidget } from "@/components/chat/chat-widget";
import { WhatsAppFloatingButton } from "./whatsapp-floating-button";
import { MaintenanceScreen } from "./maintenance-screen";

import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { ScrollProgressBar } from "@/components/animations/scroll-progress";
import { PageTransition } from "@/components/animations/page-transition";
import type { NavItem, FooterConfig } from "@/lib/services/cms-shared";

export interface MainLayoutProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  footerData?: FooterConfig;
  /** Admin → Settings → AI chat */
  chatEnabled?: boolean;
  /** Admin → Settings → Maintenance mode. The admin console is never blocked, so it can be switched off. */
  maintenanceMode?: boolean;
  contact?: { email?: string; phone?: string };
}

export function MainLayout({
  children,
  navItems,
  footerData,
  chatEnabled = true,
  maintenanceMode = false,
  contact,
}: MainLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (maintenanceMode && !isAdmin) {
    return <MaintenanceScreen email={contact?.email} phone={contact?.phone} />;
  }

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
      <div className="relative flex min-h-screen w-full flex-col">
        <ScrollProgressBar />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-fg focus:px-4 focus:py-3 focus:text-sm focus:text-canvas"
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
        {chatEnabled && <ChatWidget />}
      </div>
    </SmoothScrollProvider>
  );
}

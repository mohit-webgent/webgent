"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";

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
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </div>
  );
}

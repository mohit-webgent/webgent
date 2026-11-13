"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";
import { AdminBreadcrumbs } from "./admin-breadcrumbs";
import { AdminNotifications } from "./admin-notifications";
import { AdminUserMenu } from "./admin-user-menu";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm-provider";
import { Menu } from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    image?: string | null;
  };
}

export function AdminShell({ children, user }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // When a session ends mid-visit, the redirect to login is a client navigation that keeps this
  // layout, so the shell has to step aside itself.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="admin-theme">
      <ToastProvider>
        <ConfirmProvider>
          <div className="min-h-screen bg-canvas textured text-fg flex font-sans">
          <AdminSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            userRole={user.role}
          />

          <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
            <header className="sticky top-0 z-30 h-16 bg-surface border-b border-line px-4 sm:px-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open navigation sidebar"
                  className="lg:hidden p-2 text-fg-muted hover:text-fg rounded-none hover:bg-white/[0.05] border border-transparent hover:border-line transition-colors"
                >
                  <Menu className="w-5 h-5" aria-hidden="true" />
                </button>

                <AdminBreadcrumbs />
              </div>

              <div className="flex items-center gap-2.5 sm:gap-4">
                <AdminNotifications />
                <div className="h-5 w-px bg-white/[0.08]" />
                <AdminUserMenu user={user} />
              </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">{children}</main>
          </div>
          </div>
        </ConfirmProvider>
      </ToastProvider>
    </div>
  );
}

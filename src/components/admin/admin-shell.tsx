"use client";

import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminBreadcrumbs } from "./admin-breadcrumbs";
import { AdminNotifications } from "./admin-notifications";
import { AdminUserMenu } from "./admin-user-menu";
import { ToastProvider } from "@/components/ui/toast";
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

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation sidebar"
                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <AdminBreadcrumbs />
            </div>

            <div className="flex items-center gap-2.5 sm:gap-4">
              <AdminNotifications />
              <div className="h-5 w-px bg-slate-800" />
              <AdminUserMenu user={user} />
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}

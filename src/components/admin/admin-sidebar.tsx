"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  MessageSquareQuote,
  Mail,
  BarChart3,
  MessageCircle,
  Settings,
  Shield,
  UserCheck,
  X,
  ExternalLink,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  colorClass: string;
  badge?: string | number;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
    colorClass: "text-indigo-400 group-hover:text-indigo-300",
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: Users,
    colorClass: "text-blue-400 group-hover:text-blue-300",
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: Briefcase,
    colorClass: "text-emerald-400 group-hover:text-emerald-300",
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: FileText,
    colorClass: "text-amber-400 group-hover:text-amber-300",
  },
  {
    label: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquareQuote,
    colorClass: "text-pink-400 group-hover:text-pink-300",
  },
  {
    label: "Newsletter",
    href: "/admin/newsletter",
    icon: Mail,
    colorClass: "text-violet-400 group-hover:text-violet-300",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    colorClass: "text-sky-400 group-hover:text-sky-300",
  },
  {
    label: "Chat Sessions",
    href: "/admin/chat",
    icon: MessageCircle,
    colorClass: "text-teal-400 group-hover:text-teal-300",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    colorClass: "text-slate-400 group-hover:text-slate-300",
  },
  {
    label: "Profile & Security",
    href: "/admin/profile",
    icon: UserCheck,
    colorClass: "text-cyan-400 group-hover:text-cyan-300",
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3 group"
          >
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight leading-none block">
                Webgent
              </span>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest block mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Management & Content
          </div>

          {ADMIN_NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-indigo-600/15 text-white border border-indigo-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      active
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800/80 " + item.colorClass
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Area with Site Preview Link */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Website</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>
    </>
  );
}

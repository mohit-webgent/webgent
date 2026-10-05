"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  admin: "Dashboard",
  leads: "Leads",
  projects: "Projects",
  blog: "Blog",
  testimonials: "Testimonials",
  newsletter: "Newsletter",
  analytics: "Analytics",
  chat: "Chat Sessions",
  settings: "Settings",
  profile: "Profile & Security",
  "change-password": "Change Password",
  new: "New",
  edit: "Edit",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  if (!pathname || pathname === "/admin") {
    return (
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <Home className="w-3.5 h-3.5 text-indigo-400" />
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-white font-semibold">Dashboard</span>
      </div>
    );
  }

  const segments = pathname.split("/").filter(Boolean);

  let accumulatedPath = "";
  const breadcrumbs = segments.map((seg, idx) => {
    accumulatedPath += `/${seg}`;
    const isLast = idx === segments.length - 1;
    const label =
      ROUTE_LABELS[seg] || (seg.length > 18 ? `${seg.slice(0, 8)}...` : seg.replace(/-/g, " "));

    return {
      path: accumulatedPath,
      label,
      isLast,
    };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden sm:flex items-center gap-1.5 text-xs font-medium"
    >
      <Link
        href="/admin"
        className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Home className="w-3.5 h-3.5 text-indigo-400" />
      </Link>

      {breadcrumbs.map((crumb, idx) => {
        if (crumb.label === "Dashboard" && idx === 0) return null;

        return (
          <div key={crumb.path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            {crumb.isLast ? (
              <span className="text-slate-200 font-semibold capitalize truncate max-w-[140px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.path}
                className="text-slate-400 hover:text-white capitalize transition-colors truncate max-w-[120px]"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

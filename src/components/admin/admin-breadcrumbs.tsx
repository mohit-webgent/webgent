"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  admin: "Dashboard",
  pages: "Pages & CMS",
  projects: "Projects",
  blog: "Blog",
  testimonials: "Testimonials",
  faqs: "FAQs",
  media: "Media Library",
  leads: "Leads",
  pricing: "Pricing & Packages",
  newsletter: "Newsletter",
  analytics: "Analytics",
  chat: "Chat Sessions",
  knowledge: "AI Knowledge",
  navigation: "Navigation",
  seo: "SEO & Meta",
  settings: "Settings",
  users: "Users & Roles",
  "audit-logs": "Audit Logs",
  profile: "Profile & Security",
  "change-password": "Change Password",
  new: "New",
  edit: "Edit",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  if (!pathname || pathname === "/admin") {
    return (
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#888888] font-mono">
        <Home className="w-3.5 h-3.5 text-emerald-400" />
        <ChevronRight className="w-3 h-3 text-[#555555]" />
        <span className="text-white font-medium">Dashboard</span>
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
      className="hidden sm:flex items-center gap-1.5 text-xs font-mono"
    >
      <Link
        href="/admin"
        className="flex items-center gap-1 text-[#888888] hover:text-white transition-colors"
      >
        <Home className="w-3.5 h-3.5 text-emerald-400" />
      </Link>

      {breadcrumbs.map((crumb, idx) => {
        if (crumb.label === "Dashboard" && idx === 0) return null;

        return (
          <div key={crumb.path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-[#555555] shrink-0" />
            {crumb.isLast ? (
              <span className="text-white font-medium capitalize truncate max-w-[140px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.path}
                className="text-[#888888] hover:text-white capitalize transition-colors truncate max-w-[120px]"
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

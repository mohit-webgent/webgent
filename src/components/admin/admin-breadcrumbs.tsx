"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  admin: "Dashboard",
  pages: "Pages & CMS",
  services: "Services & Features",
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
  knowledge: "Knowledge Base",
  navigation: "Navigation & Menus",
  seo: "SEO & Meta Tags",
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
  const segments = (pathname || "/admin").split("/").filter(Boolean).slice(1);

  const breadcrumbs = segments.map((segment, index) => ({
    path: `/admin/${segments.slice(0, index + 1).join("/")}`,
    // Anything not listed is a record ID, which means nothing to the person reading it.
    label: ROUTE_LABELS[segment] || "Details",
    isLast: index === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs">
      <Link
        href="/admin"
        aria-label="Dashboard"
        className="flex items-center text-fg-muted hover:text-fg transition-colors"
      >
        <Home className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
      </Link>

      {breadcrumbs.length === 0 && (
        <>
          <ChevronRight className="w-3 h-3 text-fg-muted shrink-0" aria-hidden="true" />
          <span className="text-fg font-medium">Dashboard</span>
        </>
      )}

      {breadcrumbs.map((crumb) => (
        <div key={crumb.path} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-fg-muted shrink-0" aria-hidden="true" />
          {crumb.isLast ? (
            <span aria-current="page" className="text-fg font-medium truncate max-w-[180px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.path}
              className="text-fg-muted hover:text-fg transition-colors truncate max-w-[160px]"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

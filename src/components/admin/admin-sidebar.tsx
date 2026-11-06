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
  LayoutTemplate,
  Tags,
  HelpCircle,
  Image as ImageIcon,
  Sparkles,
  Compass,
  Search,
  UserCog,
  ScrollText,
  Layers,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  colorClass: string;
  badge?: string | number;
  adminOnly?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "Pages & CMS",
        href: "/admin/pages",
        icon: LayoutTemplate,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
      {
        label: "Services & Features",
        href: "/admin/services",
        icon: Layers,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
      {
        label: "Projects",
        href: "/admin/projects",
        icon: Briefcase,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
      {
        label: "Blog",
        href: "/admin/blog",
        icon: FileText,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
      {
        label: "Testimonials",
        href: "/admin/testimonials",
        icon: MessageSquareQuote,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
      {
        label: "FAQs",
        href: "/admin/faqs",
        icon: HelpCircle,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
      {
        label: "Media Library",
        href: "/admin/media",
        icon: ImageIcon,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        label: "Leads",
        href: "/admin/leads",
        icon: Users,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
      {
        label: "Pricing & Packages",
        href: "/admin/pricing",
        icon: Tags,
        colorClass: "text-fg-muted group-hover:text-fg",
        adminOnly: true,
      },
      {
        label: "Newsletter",
        href: "/admin/newsletter",
        icon: Mail,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
    ],
  },
  {
    title: "AI Consultant",
    items: [
      {
        label: "Chat Sessions",
        href: "/admin/chat",
        icon: MessageCircle,
        colorClass: "text-fg-muted group-hover:text-fg",
        adminOnly: true,
      },
      {
        label: "Knowledge Base",
        href: "/admin/knowledge",
        icon: Sparkles,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Navigation & Menus",
        href: "/admin/navigation",
        icon: Compass,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
      {
        label: "SEO & Meta Tags",
        href: "/admin/seo",
        icon: Search,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        colorClass: "text-fg-muted group-hover:text-fg",
        adminOnly: true,
      },
      {
        label: "Users & Roles",
        href: "/admin/users",
        icon: UserCog,
        colorClass: "text-fg-muted group-hover:text-fg",
        adminOnly: true,
      },
      {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: ScrollText,
        colorClass: "text-fg-muted group-hover:text-fg",
        adminOnly: true,
      },
      {
        label: "Profile & Security",
        href: "/admin/profile",
        icon: UserCheck,
        colorClass: "text-fg-muted group-hover:text-fg",
      },
    ],
  },
];

/**
 * Flat list of all admin nav items preserved for compatibility with existing tests and scripts
 */
export const ADMIN_NAV_ITEMS: NavItem[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items);

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string | null;
}

export function AdminSidebar({ isOpen, onClose, userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    if (item.href === "/admin/profile" && pathname === "/admin/change-password") {
      return true;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const isSuperAdmin = userRole === "ADMIN";

  return (
    <>
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-surface border-r border-line flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-line shrink-0">
          <Link href="/admin" onClick={onClose} className="flex items-center gap-3 group">
            <div className="p-2 bg-accent/10 border border-accent/20 text-accent rounded-none">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-fg tracking-tight leading-none block">
                Webgent
              </span>
              <span className="text-xs font-medium text-fg-muted block mt-0.5">
                Admin console
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden p-1 text-fg-muted hover:text-fg rounded-none hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {ADMIN_NAV_GROUPS.map((group) => {
            // Filter items based on user role authorization
            const visibleItems = group.items.filter((item) => {
              if (item.adminOnly && !isSuperAdmin) {
                return false;
              }
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <div className="px-3 pb-1 text-xs font-semibold text-fg-muted">
                  {group.title}
                </div>

                {visibleItems.map((item) => {
                  const active = isItemActive(item);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center justify-between px-3 py-2 rounded-none text-xs font-semibold transition-colors border-l-2 ${
                        active
                          ? "bg-accent/10 text-fg border-accent"
                          : "text-fg-muted hover:text-fg hover:bg-white/[0.03] border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-none transition-colors ${
                            active
                              ? "bg-accent/15 text-accent"
                              : "bg-white/[0.03] " + item.colorClass
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-none bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-line shrink-0">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-none text-xs text-fg-muted hover:text-fg hover:bg-white/[0.04] transition-colors border border-transparent hover:border-line"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent"></span>
              <span>Live Website</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Briefcase,
  ChevronRight,
  Eye,
  FilePlus,
  FileText,
  Mail,
  MessageCircle,
  PlusCircle,
  RefreshCw,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/api/client-error";
import { LEAD_STATUS_CONFIG, type LeadStatus } from "./lead-status";

interface RecentLead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  budget: string | null;
  score: number;
  status: LeadStatus;
  createdAt: string;
}

export interface DashboardData {
  leads: {
    total: number;
    new: number;
    contacted: number;
    proposalSent: number;
    won: number;
    lost: number;
    onHold: number;
    conversionRate: number;
    averageScore: number;
    recent: RecentLead[];
  };
  content: {
    projects: { total: number; published: number };
    blogPosts: { total: number; published: number };
    testimonials: { total: number; approved: number };
    subscribers: { total: number; active: number };
    chat: { total: number; active: number };
  };
  analytics: {
    totalPageViews: number;
    last7Days: number;
    last30Days: number;
    totalEvents: number;
    topPages: { path: string; views: number }[];
  };
}

function describeAverageScore(total: number, score: number): string {
  if (total === 0) return "No leads yet";
  return score >= 60 ? "Mostly strong leads" : "Mixed lead quality";
}

function getScoreBadge(score: number): string {
  if (score >= 70) return "bg-accent/10 text-accent border-accent/30";
  if (score >= 40) return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  return "bg-white/[0.03] text-fg-muted border-line";
}

const cardClassName = "bg-surface border border-line rounded-none";
const sectionLinkClassName =
  "text-xs font-medium text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-1";
const quickActionClassName =
  "flex items-center gap-2 p-2.5 rounded-none bg-white/[0.02] hover:bg-white/[0.05] border border-line hover:border-line-strong text-xs text-fg-soft hover:text-fg transition-colors";

export function AdminDashboardView({
  initialData,
  userName,
  isAdmin = false,
  accessDenied = false,
}: {
  initialData: DashboardData;
  userName?: string;
  isAdmin?: boolean;
  accessDenied?: boolean;
}) {
  const toast = useToast();
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard/stats");
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data) {
        setData(json.data);
      } else {
        toast.error("Couldn't refresh the dashboard", getApiErrorMessage(json, "Please try again."));
      }
    } catch {
      toast.error("Couldn't refresh the dashboard", "Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Leads",
      icon: Users,
      value: data.leads.total.toLocaleString(),
      detail: `${data.leads.new} new, ${data.leads.contacted} contacted`,
    },
    {
      label: "Conversion Rate",
      icon: TrendingUp,
      value: `${data.leads.conversionRate}%`,
      detail: `${data.leads.won} won of ${data.leads.total} leads`,
    },
    {
      label: "Average Lead Score",
      icon: Award,
      value: `${data.leads.averageScore}/100`,
      detail: describeAverageScore(data.leads.total, data.leads.averageScore),
    },
    {
      label: "Page Views (30 days)",
      icon: Eye,
      value: data.analytics.last30Days.toLocaleString(),
      detail: `${data.analytics.last7Days.toLocaleString()} in the last 7 days`,
    },
  ];

  const pipeline: { status: LeadStatus; count: number }[] = [
    { status: "NEW", count: data.leads.new },
    { status: "CONTACTED", count: data.leads.contacted },
    { status: "PROPOSAL_SENT", count: data.leads.proposalSent },
    { status: "WON", count: data.leads.won },
    { status: "LOST", count: data.leads.lost },
    { status: "ON_HOLD", count: data.leads.onHold },
  ];

  const contentRows = [
    {
      label: "Projects",
      icon: Briefcase,
      value: `${data.content.projects.published} published of ${data.content.projects.total}`,
    },
    {
      label: "Blog Articles",
      icon: FileText,
      value: `${data.content.blogPosts.published} published of ${data.content.blogPosts.total}`,
    },
    {
      label: "Testimonials",
      icon: Star,
      value: `${data.content.testimonials.approved} approved of ${data.content.testimonials.total}`,
    },
    {
      label: "Subscribers",
      icon: Mail,
      value: `${data.content.subscribers.active} active of ${data.content.subscribers.total}`,
    },
    {
      label: "Chat Sessions",
      icon: MessageCircle,
      value: `${data.content.chat.active} active of ${data.content.chat.total}`,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {accessDenied && (
        <div
          role="alert"
          className="p-3 rounded-none bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span>That page is only available to administrators.</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight">Dashboard</h1>
          <p className="text-sm text-fg-muted">
            Welcome back, <span className="text-fg font-medium">{userName || "Admin"}</span>. Here&apos;s
            how your leads, content and traffic are doing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-none bg-white/[0.04] hover:bg-white/[0.08] border border-line text-xs font-semibold text-fg-soft hover:text-fg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-none bg-accent hover:bg-accent-hover text-accent-fg text-xs font-semibold transition-colors"
          >
            <span>Manage Leads</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, icon: Icon, value, detail }) => (
          <div key={label} className={`${cardClassName} p-5 space-y-3`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-fg-muted">{label}</span>
              <Icon className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-fg tracking-tight">{value}</p>
              <p className="text-xs text-fg-muted">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={`${cardClassName} p-5 sm:p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-fg">Lead Pipeline</h2>
            <p className="text-xs text-fg-muted mt-0.5">How many leads are at each stage</p>
          </div>
          <Link href="/admin/leads" className={sectionLinkClassName}>
            <span>View all leads</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipeline.map(({ status, count }) => {
            const config = LEAD_STATUS_CONFIG[status];
            return (
              <div key={status} className="p-3 rounded-none bg-white/[0.02] border border-line text-center">
                <p className={`text-lg font-bold ${config.value}`}>{count}</p>
                <p className="text-xs text-fg-muted mt-0.5">{config.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 min-w-0 ${cardClassName} p-5 sm:p-6 space-y-5`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-fg">Recent Leads</h2>
              <p className="text-xs text-fg-muted mt-0.5">The latest inquiries from your site</p>
            </div>
            <Link href="/admin/leads" className={`${sectionLinkClassName} shrink-0`}>
              <span>All leads ({data.leads.total})</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          {data.leads.recent.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2 border border-dashed border-line rounded-none">
              <Users className="w-8 h-8 text-fg-muted mx-auto" aria-hidden="true" />
              <p className="text-sm font-semibold text-fg-soft">No leads yet</p>
              <p className="text-xs text-fg-muted">Contact form inquiries will appear here.</p>
            </div>
          ) : (
            <div className="relative overflow-x-auto -mx-5 px-5 sm:-mx-6 sm:px-6">
              <table className="w-full min-w-[560px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-line text-fg-muted font-medium">
                    <th className="py-3 pr-4 font-medium">Lead</th>
                    <th className="py-3 px-4 font-medium">Service</th>
                    <th className="py-3 px-4 font-medium">Score</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 pl-4 font-medium text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {data.leads.recent.map((lead) => {
                    const statusConfig = LEAD_STATUS_CONFIG[lead.status] ?? LEAD_STATUS_CONFIG.NEW;
                    return (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 pr-4">
                          <p className="font-semibold text-fg">{lead.name}</p>
                          <p className="text-xs text-fg-muted truncate max-w-[180px]">{lead.email}</p>
                        </td>
                        <td className="py-3.5 px-4 text-fg-soft">
                          <p className="truncate max-w-[150px]">{lead.service || "General inquiry"}</p>
                          {lead.budget && <p className="text-xs text-fg-muted">{lead.budget}</p>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-none border text-xs font-semibold ${getScoreBadge(lead.score)}`}
                          >
                            {lead.score}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-none border text-xs font-medium whitespace-nowrap ${statusConfig.badge}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            aria-label={`View lead from ${lead.name}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none bg-white/[0.04] hover:bg-white/[0.08] border border-line text-fg-soft hover:text-fg transition-colors text-xs"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className={`${cardClassName} p-5 space-y-3`}>
            <h2 className="text-sm font-semibold text-fg">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2.5">
              <Link href="/admin/projects/new" className={quickActionClassName}>
                <PlusCircle className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <span>New Project</span>
              </Link>
              <Link href="/admin/blog/new" className={quickActionClassName}>
                <FilePlus className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <span>New Article</span>
              </Link>
              <Link href="/admin/testimonials" className={quickActionClassName}>
                <Star className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <span>Testimonials</span>
              </Link>
              {isAdmin && (
                <Link href="/admin/chat" className={quickActionClassName}>
                  <MessageCircle className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                  <span>Chat Sessions</span>
                </Link>
              )}
            </div>
          </div>

          <div className={`${cardClassName} p-5 space-y-4`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-fg">Top Pages</h2>
              <Link href="/admin/analytics" className={sectionLinkClassName}>
                <span>Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {data.analytics.topPages.length === 0 ? (
              <p className="text-xs text-fg-muted py-3">No page views recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {data.analytics.topPages.map((page) => (
                  <div
                    key={page.path}
                    className="flex items-center justify-between gap-2 p-2 rounded-none bg-white/[0.02] border border-line text-xs"
                  >
                    <span className="text-fg-soft font-mono truncate">{page.path}</span>
                    <span className="font-semibold text-accent shrink-0">
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`${cardClassName} p-5 space-y-3 text-xs`}>
            <h2 className="text-sm font-semibold text-fg">Content & Audience</h2>
            <div className="divide-y divide-white/[0.06]">
              {contentRows.map(({ label, icon: Icon, value }) => (
                <div key={label} className="flex justify-between gap-3 py-2 text-fg-soft">
                  <span className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                    <span>{label}</span>
                  </span>
                  <span className="text-fg text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

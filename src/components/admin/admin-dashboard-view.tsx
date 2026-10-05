"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Award,
  Eye,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  FilePlus,
  MessageCircle,
  Mail,
  Briefcase,
  Star,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface RecentLead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  budget: string | null;
  score: number;
  status: "NEW" | "CONTACTED" | "PROPOSAL_SENT" | "WON" | "LOST" | "ON_HOLD";
  createdAt: string;
}

interface DashboardData {
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

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  NEW: {
    label: "New",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  CONTACTED: {
    label: "Contacted",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  PROPOSAL_SENT: {
    label: "Proposal Sent",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  WON: {
    label: "Won",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  LOST: {
    label: "Lost",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
  },
  ON_HOLD: {
    label: "On Hold",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
  },
};

export function AdminDashboardView({
  initialData,
  userName,
}: {
  initialData: DashboardData;
  userName?: string;
}) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard/stats");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData(json.data);
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
    if (score >= 40) {
      return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
    return "bg-slate-500/10 text-slate-400 border-slate-500/30";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Production Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Welcome back,{" "}
              <span className="text-slate-200 font-semibold">{userName || "Admin"}</span>. Real-time
              overview of business leads, conversion telemetry, and operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={refreshData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Refreshing..." : "Refresh Data"}</span>
            </button>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <span>Manage Leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Leads</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-white tracking-tight">{data.leads.total}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
              <span className="font-semibold text-blue-300">{data.leads.new} new</span>
              <span>•</span>
              <span className="text-slate-400">{data.leads.contacted} contacted</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Conversion Rate</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {data.leads.conversionRate}%
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="font-semibold text-emerald-400">{data.leads.won} won</span>
              <span>of</span>
              <span>{data.leads.total} total inquiries</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg Lead Score</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {data.leads.averageScore}
              <span className="text-sm font-normal text-slate-400">/100</span>
            </p>
            <p className="text-xs text-slate-400">
              {data.leads.averageScore >= 60
                ? "High commercial qualification"
                : "Moderate inbound intent"}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Page Views (30d)</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {data.analytics.last30Days.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-sky-400">
                {data.analytics.last7Days.toLocaleString()}
              </span>{" "}
              views in last 7 days
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Lead Pipeline Distribution
            </h2>
            <p className="text-xs text-slate-400">
              Inbound lead lifecycle stages across current client engagements
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
          >
            <span>View Full Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <p className="text-lg font-bold text-blue-400">{data.leads.new}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">New</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <p className="text-lg font-bold text-purple-400">{data.leads.contacted}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Contacted</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <p className="text-lg font-bold text-amber-400">{data.leads.proposalSent}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Proposal</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <p className="text-lg font-bold text-emerald-400">{data.leads.won}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Won</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <p className="text-lg font-bold text-rose-400">{data.leads.lost}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Lost</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <p className="text-lg font-bold text-slate-400">{data.leads.onHold}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">On Hold</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Recent Leads</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest client inquiries submitted through the contact funnel
              </p>
            </div>
            <Link
              href="/admin/leads"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
            >
              <span>All leads ({data.leads.total})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data.leads.recent.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-xl">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No leads recorded yet</p>
              <p className="text-xs text-slate-400">
                Inquiries submitted on the contact form will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 pr-4">Lead</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.leads.recent.map((lead) => {
                    const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                    return (
                      <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3.5 pr-4">
                          <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                            {lead.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                            {lead.email}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <p className="truncate max-w-[130px]">
                            {lead.service || "General Inquiry"}
                          </p>
                          {lead.budget && (
                            <p className="text-[10px] text-slate-400">{lead.budget}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold ${getScoreBadge(
                              lead.score,
                            )}`}
                          >
                            {lead.score}/100
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                          >
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors text-[11px] font-medium"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3" />
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/admin/projects/new"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 text-xs font-medium text-slate-200 hover:text-white transition-all"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>New Project</span>
              </Link>
              <Link
                href="/admin/blog/new"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/30 text-xs font-medium text-slate-200 hover:text-white transition-all"
              >
                <FilePlus className="w-4 h-4 text-amber-400" />
                <span>New Article</span>
              </Link>
              <Link
                href="/admin/testimonials"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/30 text-xs font-medium text-slate-200 hover:text-white transition-all"
              >
                <Star className="w-4 h-4 text-pink-400" />
                <span>Reviews</span>
              </Link>
              <Link
                href="/admin/chat"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/30 text-xs font-medium text-slate-200 hover:text-white transition-all"
              >
                <MessageCircle className="w-4 h-4 text-teal-400" />
                <span>Chat Hub</span>
              </Link>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Top Visited Pages
              </h3>
              <Link
                href="/admin/analytics"
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold"
              >
                Full Analytics &rarr;
              </Link>
            </div>

            {data.analytics.topPages.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No page view data yet.</p>
            ) : (
              <div className="space-y-2">
                {data.analytics.topPages.map((page, idx) => (
                  <div
                    key={page.path}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-mono text-slate-400 text-[10px] w-4">#{idx + 1}</span>
                      <span className="font-mono text-slate-200 truncate">{page.path}</span>
                    </div>
                    <span className="font-semibold text-sky-400 shrink-0">
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Content & Audience
            </h3>
            <div className="divide-y divide-slate-800/60">
              <div className="flex justify-between py-2 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Projects</span>
                </span>
                <span className="font-semibold text-white">
                  {data.content.projects.published} / {data.content.projects.total}
                </span>
              </div>
              <div className="flex justify-between py-2 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Blog Articles</span>
                </span>
                <span className="font-semibold text-white">
                  {data.content.blogPosts.published} / {data.content.blogPosts.total}
                </span>
              </div>
              <div className="flex justify-between py-2 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-pink-400" />
                  <span>Testimonials</span>
                </span>
                <span className="font-semibold text-white">
                  {data.content.testimonials.approved} / {data.content.testimonials.total}
                </span>
              </div>
              <div className="flex justify-between py-2 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-violet-400" />
                  <span>Subscribers</span>
                </span>
                <span className="font-semibold text-white">
                  {data.content.subscribers.active} / {data.content.subscribers.total}
                </span>
              </div>
              <div className="flex justify-between py-2 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-teal-400" />
                  <span>Live Chat</span>
                </span>
                <span className="font-semibold text-white">
                  {data.content.chat.active} active ({data.content.chat.total} total)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

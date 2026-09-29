"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  Users,
  Eye,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  RefreshCw,
  Layers,
} from "lucide-react";
import { ValidPeriod } from "@/lib/validations/analytics";

interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  totalEvents: number;
  overallConversionRate: number;
}

interface TopPage {
  path: string;
  views: number;
  uniqueVisitors: number;
  percentage: number;
}

interface FunnelStep {
  step: string;
  count: number;
  rate: number;
  dropOff: number;
}

interface DeviceStat {
  device: string;
  count: number;
  percentage: number;
}

interface CountryStat {
  country: string;
  count: number;
  percentage: number;
}

interface TimelineItem {
  date: string;
  views: number;
  events: number;
  visitors: number;
}

interface AnalyticsData {
  period: ValidPeriod;
  days: number;
  summary: AnalyticsSummary;
  topPages: TopPage[];
  eventCounts: Record<string, number>;
  conversionFunnel: FunnelStep[];
  deviceSplit: DeviceStat[];
  countryDistribution: CountryStat[];
  timeline: TimelineItem[];
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<ValidPeriod>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (selectedPeriod: ValidPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?period=${selectedPeriod}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to load analytics");
      }
      setData(json.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load analytics data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Phase 10 Custom Telemetry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Traffic & Conversion Analytics
          </h1>
          <p className="text-sm text-slate-400">
            Real-time privacy-compliant site analytics, event tracking, and conversion funnels.
          </p>
        </div>

        {/* Period Selector Controls */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          {(["7d", "30d", "90d"] as ValidPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                period === p
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
          <button
            onClick={() => fetchAnalytics(period)}
            title="Refresh analytics"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors ml-1"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 rounded-2xl text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchAnalytics(period)}
            className="text-xs bg-red-800/50 hover:bg-red-800 px-3 py-1.5 rounded-lg text-white font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Page Views */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Page Views
            </span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? "..." : (data?.summary.totalPageViews ?? 0).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Total public page visits</p>
        </div>

        {/* Unique Visitors */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Unique Visitors
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? "..." : (data?.summary.uniqueVisitors ?? 0).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Distinct anonymous sessions</p>
        </div>

        {/* Total Events */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tracked Events
            </span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? "..." : (data?.summary.totalEvents ?? 0).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">CTAs, forms & engagement</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Conversion Rate
            </span>
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? "..." : `${data?.summary.overallConversionRate ?? 0}%`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Visitors converting to leads</p>
        </div>
      </div>

      {/* Conversion Funnel Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Conversion Funnel</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Step-by-step visitor progression from discovery to inquiry submission
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.conversionFunnel.map((step, idx) => (
            <div
              key={step.step}
              className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400">Step {idx + 1}</span>
                {idx > 0 && step.dropOff > 0 && (
                  <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    -{step.dropOff}% drop
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-white">{step.step}</h3>
              <div className="text-2xl font-extrabold text-white">{step.count.toLocaleString()}</div>
              {/* Funnel Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(step.rate, 2))}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Step Rate</span>
                <span className="text-slate-200 font-semibold">{step.rate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Top Pages & Event Counts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Top Pages</span>
            </h2>
            <span className="text-xs text-slate-500">Most visited paths</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Path</th>
                  <th className="pb-3 text-right">Views</th>
                  <th className="pb-3 text-right">Unique</th>
                  <th className="pb-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data?.topPages && data.topPages.length > 0 ? (
                  data.topPages.map((page) => (
                    <tr key={page.path} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 text-slate-200 font-sans truncate max-w-[200px]" title={page.path}>
                        {page.path}
                      </td>
                      <td className="py-3 text-right text-slate-300 font-semibold">
                        {page.views.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-slate-400">
                        {page.uniqueVisitors.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-indigo-400 font-semibold font-sans">
                        {page.percentage}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 font-sans">
                      No pageviews recorded in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Tracked Event Distribution</span>
            </h2>
            <span className="text-xs text-slate-500">Key user interactions</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {data?.eventCounts &&
              Object.entries(data.eventCounts).map(([name, count]) => (
                <div
                  key={name}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between"
                >
                  <span className="text-[11px] font-semibold text-slate-400 font-mono truncate" title={name}>
                    {name}
                  </span>
                  <span className="text-xl font-extrabold text-white mt-2">
                    {count.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Device Split & Country Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Split */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Device Category Split</span>
            </h2>
            <span className="text-xs text-slate-500">Visitor technology</span>
          </div>

          <div className="space-y-4">
            {data?.deviceSplit && data.deviceSplit.length > 0 ? (
              data.deviceSplit.map((dev) => {
                const Icon =
                  dev.device === "mobile"
                    ? Smartphone
                    : dev.device === "tablet"
                    ? Tablet
                    : Monitor;
                return (
                  <div key={dev.device} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-300 font-semibold capitalize">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{dev.device}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono">{dev.count.toLocaleString()} visits</span>
                        <span className="font-bold text-white">{dev.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, dev.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No device statistics available.</p>
            )}
          </div>
        </div>

        {/* Country Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Country Distribution</span>
            </h2>
            <span className="text-xs text-slate-500">Geographic origin</span>
          </div>

          <div className="space-y-3">
            {data?.countryDistribution && data.countryDistribution.length > 0 ? (
              data.countryDistribution.map((item) => (
                <div
                  key={item.country}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 py-1 rounded bg-slate-800 text-center font-mono font-bold text-[11px] text-emerald-400">
                      {item.country}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {item.country === "Unknown" ? "Undetected Header" : item.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">{item.count.toLocaleString()} visits</span>
                    <span className="font-bold text-white min-w-[40px] text-right">{item.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No location headers recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Download,
  Search,
  CheckCircle2,
  Clock,
  UserX,
  Loader2,
  Users,
  RefreshCw,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: "PENDING" | "ACTIVE" | "UNSUBSCRIBED";
  isActive: boolean;
  subscribedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
  hasPendingToken: boolean;
  tokenExpiresAt: string | null;
}

export function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [isExporting, setIsExporting] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      params.set("page", pagination.page.toString());
      params.set("limit", "25");

      const res = await fetch(`/api/admin/newsletter/subscribers?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSubscribers(json.data);
        if (json.meta?.pagination) {
          setPagination(json.meta.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load subscribers:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, pagination.page]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleExportCsv = () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      params.set("format", "csv");

      // Trigger native download
      window.location.href = `/api/admin/newsletter/subscribers?${params.toString()}`;
    } finally {
      setTimeout(() => setIsExporting(false), 1500);
    }
  };

  const counts = {
    total: pagination.total,
    active: subscribers.filter((s) => s.status === "ACTIVE").length,
    pending: subscribers.filter((s) => s.status === "PENDING").length,
    unsubscribed: subscribers.filter((s) => s.status === "UNSUBSCRIBED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header and CSV Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-violet-400" />
            <span>Newsletter Subscribers</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor double opt-in subscriptions, confirmation states, and audience growth.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/20 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>Export CSV</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total In View</p>
          <p className="text-2xl font-extrabold text-white mt-1">{counts.total}</p>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active Verified</p>
          <p className="text-2xl font-extrabold text-emerald-300 mt-1">{counts.active}</p>
        </div>
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Opt-In</p>
          <p className="text-2xl font-extrabold text-amber-300 mt-1">{counts.pending}</p>
        </div>
        <div className="bg-slate-950/40 border border-slate-800/40 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unsubscribed</p>
          <p className="text-2xl font-extrabold text-slate-400 mt-1">{counts.unsubscribed}</p>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subscribers by email address or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(["ALL", "ACTIVE", "PENDING", "UNSUBSCRIBED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === status
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
          <button
            onClick={() => fetchSubscribers()}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-2" />
          <p className="text-sm">Fetching subscriber records...</p>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No subscribers found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
            {search || statusFilter !== "ALL"
              ? "No subscriber records match your current search and filter criteria."
              : "Subscribers will appear here once visitors submit the newsletter form."}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Subscriber</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Double Opt-In</th>
                  <th className="px-5 py-3.5">Subscribed Date</th>
                  <th className="px-5 py-3.5 text-right">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white text-sm">{sub.email}</div>
                      {sub.name && <div className="text-slate-400 text-xs mt-0.5">{sub.name}</div>}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          sub.status === "ACTIVE"
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            : sub.status === "PENDING"
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                            : "bg-slate-800 border border-slate-700 text-slate-400"
                        }`}
                      >
                        {sub.status === "ACTIVE" && <CheckCircle2 className="w-3 h-3" />}
                        {sub.status === "PENDING" && <Clock className="w-3 h-3" />}
                        {sub.status === "UNSUBSCRIBED" && <UserX className="w-3 h-3" />}
                        <span>{sub.status}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {sub.status === "ACTIVE" ? (
                        <span className="text-emerald-400 font-medium">Verified</span>
                      ) : sub.status === "PENDING" ? (
                        <span className="text-amber-400 font-medium">
                          Pending confirmation (Token expires {sub.tokenExpiresAt ? new Date(sub.tokenExpiresAt).toLocaleTimeString() : "24h"})
                        </span>
                      ) : (
                        <span className="text-slate-500">Unsubscribed</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-300 font-mono text-[11px]">
                      {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString() : "—"}
                    </td>

                    <td className="px-5 py-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 bg-slate-950/40 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

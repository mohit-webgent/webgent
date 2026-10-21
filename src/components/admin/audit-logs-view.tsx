"use client";

import { useState, useCallback } from "react";
import {
  ScrollText,
  Search,
  RefreshCw,
  Clock,
  Code2,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  Briefcase,
  Layers,
  Settings,
  Mail,
  Sparkles,
} from "lucide-react";

export interface AuditLogItem {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface AuditLogsViewProps {
  initialLogs: AuditLogItem[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ACTION_CATEGORIES = [
  { id: "ALL", label: "All Actions" },
  { id: "AUTH", label: "Auth / Login" },
  { id: "USER", label: "Users & Roles" },
  { id: "PROJECT", label: "Projects" },
  { id: "SERVICE", label: "Services" },
  { id: "LEAD", label: "Leads" },
  { id: "SETTINGS", label: "Settings" },
  { id: "KNOWLEDGE", label: "Knowledge" },
];

export function AuditLogsView({ initialLogs, initialPagination }: AuditLogsViewProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [pagination, setPagination] = useState(initialPagination);
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(
    async (pageToLoad: number, actionFilter: string, searchQuery: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(pageToLoad));
        params.set("limit", String(pagination.limit));
        if (actionFilter && actionFilter !== "ALL") {
          params.set("action", actionFilter);
        }
        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }

        const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setLogs(json.data || []);
          if (json.meta?.pagination) {
            setPagination(json.meta.pagination);
          }
        }
      } catch (err) {
        console.error("Failed to load audit logs", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  const handleActionChange = (cat: string) => {
    setSelectedAction(cat);
    fetchLogs(1, cat, search);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1, selectedAction, search);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.startsWith("AUTH")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (action.startsWith("USER")) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    if (action.startsWith("PROJECT")) return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    if (action.startsWith("SERVICE")) return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    if (action.startsWith("LEAD")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (action.startsWith("KNOWLEDGE")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  const getActionIcon = (action: string) => {
    if (action.startsWith("AUTH")) return <Shield className="w-3.5 h-3.5" />;
    if (action.startsWith("USER")) return <UserCheck className="w-3.5 h-3.5" />;
    if (action.startsWith("PROJECT")) return <Briefcase className="w-3.5 h-3.5" />;
    if (action.startsWith("SERVICE")) return <Layers className="w-3.5 h-3.5" />;
    if (action.startsWith("LEAD")) return <Mail className="w-3.5 h-3.5" />;
    if (action.startsWith("KNOWLEDGE")) return <Sparkles className="w-3.5 h-3.5" />;
    return <Settings className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              System Audit
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {pagination.total} Logged Events
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ScrollText className="w-6 h-6" />
            </div>
            <span>System Audit Logs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Chronological records of security events, administrative modifications, user role changes, and content mutations.
          </p>
        </div>

        <button
          onClick={() => fetchLogs(pagination.page, selectedAction, search)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Action Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {ACTION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleActionChange(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                selectedAction === cat.id
                  ? "bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-600/30"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or metadata..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Actor / Details</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const meta = log.metadata || {};
                  const actor =
                    (meta.actorEmail as string) ||
                    (meta.actorName as string) ||
                    (meta.actorId as string) ||
                    "System / Automated";
                  const details =
                    (meta.details as string) ||
                    (meta.message as string) ||
                    (meta.targetEmail as string) ||
                    (meta.targetId ? `Target: ${meta.targetId}` : "-");

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border ${getActionBadgeColor(
                              log.action,
                            )}`}
                          >
                            {getActionIcon(log.action)}
                            <span>{log.action}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-semibold text-white">{actor}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-md">{details}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {log.metadata ? (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors"
                          >
                            <Code2 className="w-3 h-3 text-purple-400" />
                            <span>Inspect</span>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[11px] italic">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    <ScrollText className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-slate-400">No audit logs found</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {search || selectedAction !== "ALL"
                        ? "Try clearing filters to see more events."
                        : "Security and modification events will appear here automatically."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400">
            <div>
              Showing page <span className="text-white font-semibold">{pagination.page}</span> of{" "}
              <span className="text-white font-semibold">{pagination.totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLogs(pagination.page - 1, selectedAction, search)}
                disabled={pagination.page <= 1 || loading}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchLogs(pagination.page + 1, selectedAction, search)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Metadata Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono text-xs font-semibold border border-purple-500/20">
                  {selectedLog.action}
                </span>
                <span className="text-xs text-slate-400">Metadata Payload</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Recorded:</span>
                <span className="text-slate-200 font-mono">
                  {new Date(selectedLog.createdAt).toISOString()}
                </span>
              </div>
              <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-80">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

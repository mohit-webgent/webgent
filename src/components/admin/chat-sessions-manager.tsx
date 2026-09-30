"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageCircle,
  Search,
  Send,
  Loader2,
  Trash2,
  CheckCircle,
  Archive,
  RefreshCw,
  User,
  Bot,
  Calendar,
  X,
  ChevronLeft,
  Sparkles,
  Mail,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
}

interface ChatSessionItem {
  id: string;
  visitorId: string;
  status: "ACTIVE" | "CLOSED" | "ARCHIVED";
  metadata?: Record<string, unknown> | null;
  messageCount: number;
  lastMessage?: ChatMessage | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatSessionDetail extends ChatSessionItem {
  messages: ChatMessage[];
}

export function ChatSessionsManager() {
  const toast = useToast();
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [counts, setCounts] = useState({ all: 0, active: 0, closed: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ChatSessionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Composer
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Destructive Confirm Dialog
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "15");
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/chat/sessions?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setSessions(json.data || []);
        if (json.meta?.pagination) {
          setTotalPages(json.meta.pagination.totalPages || 1);
        }
        if (json.meta?.counts) {
          setCounts(json.meta.counts);
        }

        // If no session selected yet, select first if exists
        if (!selectedSessionId && json.data && json.data.length > 0) {
          setSelectedSessionId(json.data[0].id);
        }
      }
    } catch {
      toast.error("Failed to load chat sessions");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, selectedSessionId, toast]);

  const fetchSessionDetail = useCallback(
    async (id: string) => {
      setLoadingDetail(true);
      try {
        const res = await fetch(`/api/admin/chat/sessions/${id}`);
        if (res.ok) {
          const json = await res.json();
          setActiveSession(json.data);
        }
      } catch {
        toast.error("Failed to load conversation history");
      } finally {
        setLoadingDetail(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchSessionDetail(selectedSessionId);
    } else {
      setActiveSession(null);
    }
  }, [selectedSessionId, fetchSessionDetail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedSessionId || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await fetch(`/api/admin/chat/${selectedSessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim(), sender: "admin" }),
      });

      if (res.ok) {
        const json = await res.json();
        setReplyText("");
        if (activeSession) {
          setActiveSession({
            ...activeSession,
            messages: [...activeSession.messages, json.data],
            updatedAt: new Date().toISOString(),
          });
        }
        toast.success("Reply dispatched to visitor");
        // refresh list to update lastMessage snippet
        fetchSessions();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send message");
      }
    } catch {
      toast.error("Network error while sending reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleStatusChange = async (newStatus: "ACTIVE" | "CLOSED" | "ARCHIVED") => {
    if (!selectedSessionId) return;
    try {
      const res = await fetch(`/api/admin/chat/sessions/${selectedSessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Session status marked as ${newStatus.toLowerCase()}`);
        if (activeSession) {
          setActiveSession({ ...activeSession, status: newStatus });
        }
        setSessions((prev) =>
          prev.map((s) => (s.id === selectedSessionId ? { ...s, status: newStatus } : s))
        );
        fetchSessions();
      } else {
        toast.error("Failed to update session status");
      }
    } catch {
      toast.error("Network error updating status");
    }
  };

  const handleDeleteSession = async () => {
    if (!selectedSessionId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/chat/sessions/${selectedSessionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Chat session deleted");
        setDeleteModalOpen(false);
        setActiveSession(null);
        setSelectedSessionId(null);
        fetchSessions();
      } else {
        toast.error("Failed to delete chat session");
      }
    } catch {
      toast.error("Network error deleting chat session");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: "ACTIVE" | "CLOSED" | "ARCHIVED") => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "CLOSED":
        return "bg-slate-500/10 text-slate-300 border-slate-500/20";
      case "ARCHIVED":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span>Live Chat Sessions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time visitor inquiries, support threads, and AI concierge transcripts
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchSessions();
            if (selectedSessionId) fetchSessionDetail(selectedSessionId);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Two-Pane Master-Detail Layout */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Master List (4 Cols) */}
        <div
          className={`lg:col-span-5 xl:col-span-4 border-r border-slate-800 flex flex-col ${
            selectedSessionId && "hidden lg:flex"
          }`}
        >
          {/* Search & Filter Controls */}
          <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/60">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search visitor ID or content..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] font-semibold">
              {(["ALL", "ACTIVE", "CLOSED", "ARCHIVED"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab);
                    setPage(1);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    statusFilter === tab
                      ? "bg-teal-600/20 text-teal-300 border border-teal-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab === "ALL" ? `All (${counts.all})` : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[520px]">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-6 h-6 text-teal-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading chat sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-2">
                <MessageCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No chat sessions found</p>
                <p className="text-xs text-slate-400">
                  {search ? "Try clearing your search query" : "Active chat sessions will appear here"}
                </p>
              </div>
            ) : (
              sessions.map((item) => {
                const isSelected = item.id === selectedSessionId;
                const metaName = item.metadata && typeof item.metadata === "object" && "name" in item.metadata && item.metadata.name
                  ? String(item.metadata.name)
                  : null;
                const metaEmail = item.metadata && typeof item.metadata === "object" && "email" in item.metadata && item.metadata.email
                  ? String(item.metadata.email)
                  : null;

                const formattedDate = new Date(item.updatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedSessionId(item.id)}
                    className={`w-full text-left p-4 transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-teal-950/20 border-l-4 border-l-teal-500"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate max-w-[170px]">
                        <span className="font-semibold text-xs text-white">
                          {metaName || `Visitor: ${item.visitorId.slice(0, 10)}...`}
                        </span>
                        {metaEmail && (
                          <span className="block text-[10px] text-teal-400/80 truncate">
                            {metaEmail}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.lastMessage
                        ? `${item.lastMessage.sender === "admin" ? "You: " : ""}${item.lastMessage.content}`
                        : "No messages in session"}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{item.messageCount} messages</span>
                      <span>{formattedDate}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Master List Pagination */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 shrink-0">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Detail Pane (7-8 Cols) */}
        <div
          className={`lg:col-span-7 xl:col-span-8 flex flex-col bg-slate-950/30 ${
            !selectedSessionId && "hidden lg:flex"
          }`}
        >
          {loadingDetail ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            </div>
          ) : !activeSession ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-slate-600">
                <MessageCircle className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-white">Select a Chat Session</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Choose a conversation from the left to view the complete transcript, update status, or respond to the visitor.
              </p>
            </div>
          ) : (
            <>
              {/* Detail Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSessionId(null)}
                    className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white">
                        {activeSession.metadata?.name
                          ? String(activeSession.metadata.name)
                          : activeSession.visitorId}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(
                          activeSession.status
                        )}`}
                      >
                        {activeSession.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Started:{" "}
                        {new Date(activeSession.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        ID: {activeSession.id.slice(0, 8)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Session Actions */}
                <div className="flex items-center gap-2">
                  {activeSession.status === "ACTIVE" ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange("CLOSED")}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                      <span>Close</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStatusChange("ACTIVE")}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-xs font-semibold text-emerald-300 border border-emerald-500/30 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                      <span>Reopen</span>
                    </button>
                  )}

                  {activeSession.status !== "ARCHIVED" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange("ARCHIVED")}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 transition-colors"
                      title="Archive session"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visitor Contact Info Banner (If Provided) */}
              {activeSession.metadata &&
                (Boolean(activeSession.metadata.name) || Boolean(activeSession.metadata.email)) && (
                  <div className="px-4 py-2.5 bg-teal-950/20 border-b border-teal-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-teal-300 font-medium">
                      <User className="w-3.5 h-3.5 text-teal-400" />
                      <span>{String(activeSession.metadata.name || "Anonymous Visitor")}</span>
                      {Boolean(activeSession.metadata.email) && (
                        <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px]">
                          <Mail className="w-3 h-3 text-teal-400" />
                          {String(activeSession.metadata.email)}
                        </span>
                      )}
                    </div>
                    {Boolean(activeSession.metadata.ipAddress) && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        IP: {String(activeSession.metadata.ipAddress)}
                      </span>
                    )}
                  </div>
                )}

              {/* Message Transcript Thread */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[460px]">
                {activeSession.messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No messages recorded in this chat session yet.
                  </div>
                ) : (
                  activeSession.messages.map((msg) => {
                    const isAdmin = msg.sender === "admin";
                    const isAssistant = msg.sender === "assistant" || msg.sender === "bot" || msg.sender === "agent";
                    const formattedTime = new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2.5 ${
                          isAdmin ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                            isAdmin
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                              : isAssistant
                              ? "bg-teal-600/20 text-teal-400 border border-teal-500/30"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {isAdmin ? (
                            <Bot className="w-3.5 h-3.5" />
                          ) : isAssistant ? (
                            <Sparkles className="w-3.5 h-3.5" />
                          ) : (
                            <User className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            isAdmin
                              ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20"
                              : isAssistant
                              ? "bg-slate-900 border border-teal-500/20 text-slate-100 rounded-bl-none"
                              : "bg-slate-800/80 border border-slate-700/60 text-slate-100 rounded-bl-none"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 opacity-75 text-[10px] font-semibold">
                            <span>
                              {isAdmin
                                ? "Admin (You)"
                                : isAssistant
                                ? "Webgent AI Concierge"
                                : activeSession.metadata?.name
                                ? String(activeSession.metadata.name)
                                : "Visitor"}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p
                            className={`text-[9px] mt-1 text-right ${
                              isAdmin ? "text-indigo-200" : "text-slate-400"
                            }`}
                          >
                            {formattedTime}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Composer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/60">
                <form onSubmit={handleSendReply} className="space-y-2">
                  <div className="relative">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        activeSession.status === "ARCHIVED"
                          ? "This conversation is archived. Reopen to send replies."
                          : "Type an admin response (Ctrl+Enter to send)..."
                      }
                      disabled={activeSession.status === "ARCHIVED" || sendingReply}
                      className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Press Ctrl+Enter to send quickly</span>
                    <button
                      type="submit"
                      disabled={
                        !replyText.trim() ||
                        sendingReply ||
                        activeSession.status === "ARCHIVED"
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all disabled:opacity-50 shadow-md shadow-teal-600/20"
                    >
                      {sendingReply ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Deleting Chat Session */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSession}
        title="Delete Chat Session"
        description="Are you sure you want to permanently delete this chat session and its full message history? This action cannot be undone."
        confirmText="Delete Session"
        isLoading={deleting}
      />
    </div>
  );
}

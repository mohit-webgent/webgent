"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, User, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  href: string;
  read: boolean;
  type: "lead" | "subscriber" | "system";
}

export function AdminNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchRecent = async () => {
    setLoading(true);
    try {
      // Query recent leads to populate real notifications
      const res = await fetch("/api/admin/leads?limit=5&sortBy=createdAt&sortOrder=desc");
      if (res.ok) {
        const json = await res.json();
        const leads = json.data || [];
        const items: NotificationItem[] = leads.map((l: { id: string; name: string; service?: string; createdAt: string }) => ({
          id: l.id,
          title: "New Lead Inbound",
          message: `${l.name} submitted an inquiry for ${l.service || "services"}`,
          time: new Date(l.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          href: `/admin/leads/${l.id}`,
          read: false,
          type: "lead",
        }));

        setNotifications(items);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  // Close dropdown on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="py-2 divide-y divide-slate-800/60 max-h-[340px] overflow-y-auto">
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">All caught up! No new notifications.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl transition-colors ${
                    item.read
                      ? "opacity-75 hover:bg-slate-800/40"
                      : "bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-white">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {item.message}
                  </p>
                  <div className="mt-2 flex justify-end">
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 text-center">
            <Link
              href="/admin/leads"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              View all lead activity &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

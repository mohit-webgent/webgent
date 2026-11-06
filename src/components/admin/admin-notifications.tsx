"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, User, ArrowRight, Inbox } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  href: string;
  createdAt: number;
}

const LAST_READ_STORAGE_KEY = "webgent-admin-notifications-read-at";

function readLastReadAt(): number {
  try {
    return Number(window.localStorage.getItem(LAST_READ_STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function AdminNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [lastReadAt, setLastReadAt] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRecent = async () => {
      try {
        // Only leads nobody has acted on yet count as notifications.
        const res = await fetch("/api/admin/leads?limit=5&status=NEW&sortBy=createdAt&sortOrder=desc");
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        if (cancelled) return;

        const leads: { id: string; name: string; service?: string | null; createdAt: string }[] =
          json.data || [];
        setNotifications(
          leads.map((lead) => ({
            id: lead.id,
            title: "New lead",
            message: `${lead.name} asked about ${lead.service || "your services"}`,
            time: new Date(lead.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            href: `/admin/leads/${lead.id}`,
            createdAt: new Date(lead.createdAt).getTime(),
          })),
        );
        setLastReadAt(readLastReadAt());
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRecent();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const unreadCount = notifications.filter((n) => n.createdAt > lastReadAt).length;

  const markAllAsRead = () => {
    const now = Date.now();
    setLastReadAt(now);
    try {
      window.localStorage.setItem(LAST_READ_STORAGE_KEY, String(now));
    } catch {
      // Without storage the read state simply lasts until the next page load.
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={isOpen}
        className="relative p-2 text-fg-muted hover:text-fg hover:bg-white/[0.05] rounded-none border border-transparent hover:border-line transition-colors"
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-none bg-accent text-[10px] font-bold leading-none text-accent-fg">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-[4.25rem] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 rounded-none border border-line-strong bg-surface p-4 shadow-2xl z-50">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-fg">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-accent/15 text-accent rounded-none border border-accent/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-fg-muted hover:text-accent transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="py-2 space-y-2 max-h-[340px] overflow-y-auto">
            {loading ? (
              <div className="py-6 text-center text-xs text-fg-muted">Loading notifications...</div>
            ) : failed ? (
              <div className="py-6 text-center text-xs text-rose-300">
                Couldn&apos;t load notifications. Refresh the page to try again.
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Inbox className="w-6 h-6 text-fg-muted mx-auto" aria-hidden="true" />
                <p className="text-xs text-fg-muted">No new leads waiting for a reply.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block p-3 rounded-none transition-colors border hover:bg-white/[0.04] ${
                    item.createdAt > lastReadAt
                      ? "bg-white/[0.02] border-line"
                      : "opacity-70 border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                      <span className="text-xs font-semibold text-fg">{item.title}</span>
                    </div>
                    <span className="text-xs text-fg-muted shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-fg-soft mt-1.5 leading-relaxed">{item.message}</p>
                </Link>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-line text-center">
            <Link
              href="/admin/leads"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg transition-colors"
            >
              <span>View all leads</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

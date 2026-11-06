"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, KeyRound, Settings, LogOut, ChevronDown, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import { useToast } from "@/components/ui/toast";

interface UserSessionInfo {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  image?: string | null;
}

const menuLinkClassName =
  "flex items-center gap-2.5 px-3 py-2 text-xs text-fg-soft hover:text-fg rounded-none hover:bg-white/[0.04] transition-colors";

export function AdminUserMenu({ user }: { user: UserSessionInfo }) {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Navigate from here rather than following the server's redirect, which is built from
      // AUTH_URL and would send a local session to the production site.
      await signOut({ redirect: false });
      window.location.assign(new URL("/admin/login", window.location.origin).href);
    } catch {
      setLoggingOut(false);
      toast.error("Couldn't sign out", "Check your connection and try again.");
    }
  };

  const isAdmin = user.role === "ADMIN";
  const displayName = user.name || user.email?.split("@")[0] || "Admin";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User navigation menu"
        className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-none bg-surface border border-line hover:border-line-strong transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-none bg-accent/10 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
          {initials}
        </div>
        <div className="hidden md:block text-xs">
          <p className="font-semibold text-fg leading-none truncate max-w-[120px]">{displayName}</p>
          <p className="mt-1 text-xs text-fg-muted">{isAdmin ? "Admin" : "Editor"}</p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-fg-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-none border border-line-strong bg-surface p-2 shadow-2xl z-50">
          <div className="px-3 py-2.5 border-b border-line">
            <p className="text-xs font-semibold text-fg leading-none">{displayName}</p>
            <p className="text-xs text-fg-muted mt-1.5 truncate">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
              <Shield className="w-3 h-3" aria-hidden="true" />
              <span>{isAdmin ? "Administrator" : "Editor"}</span>
            </div>
          </div>

          <div className="py-1">
            <Link href="/admin/profile" onClick={() => setIsOpen(false)} className={menuLinkClassName}>
              <User className="w-4 h-4 text-fg-muted" aria-hidden="true" />
              <span>Profile & Account</span>
            </Link>
            <Link
              href="/admin/change-password"
              onClick={() => setIsOpen(false)}
              className={menuLinkClassName}
            >
              <KeyRound className="w-4 h-4 text-fg-muted" aria-hidden="true" />
              <span>Change Password</span>
            </Link>
            {isAdmin && (
              <Link href="/admin/settings" onClick={() => setIsOpen(false)} className={menuLinkClassName}>
                <Settings className="w-4 h-4 text-fg-muted" aria-hidden="true" />
                <span>Site Settings</span>
              </Link>
            )}
          </div>

          <div className="pt-1 border-t border-line">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 rounded-none hover:bg-rose-500/10 transition-colors disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

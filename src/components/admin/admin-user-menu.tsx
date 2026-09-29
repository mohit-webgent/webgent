"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, KeyRound, Settings, LogOut, ChevronDown, Shield } from "lucide-react";
import { signOut } from "next-auth/react";

interface UserSessionInfo {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  image?: string | null;
}

export function AdminUserMenu({ user }: { user: UserSessionInfo }) {
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
    await signOut({ callbackUrl: "/admin/login" });
  };

  const displayName = user.name || user.email?.split("@")[0] || "Admin";
  const initials = displayName
    .split(" ")
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
        className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-600/20">
          {initials}
        </div>
        <div className="hidden md:block text-xs">
          <p className="font-semibold text-white leading-none truncate max-w-[120px]">
            {displayName}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              {user.role || "ADMIN"}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2.5 border-b border-slate-800/80">
            <p className="text-xs font-bold text-white leading-none">{displayName}</p>
            <p className="text-[11px] text-slate-400 mt-1 truncate">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold">
              <Shield className="w-3 h-3" />
              <span>Full Administrator Privileges</span>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/admin/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <User className="w-4 h-4 text-indigo-400" />
              <span>Profile & Account</span>
            </Link>
            <Link
              href="/admin/change-password"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>Change Password</span>
            </Link>
            <Link
              href="/admin/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Site Settings</span>
            </Link>
          </div>

          <div className="pt-1 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

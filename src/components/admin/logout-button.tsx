"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <button
      id="admin-logout-button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-red-950/50 hover:text-red-400 hover:border-red-800/50 text-slate-300 border border-slate-700/50 transition-all disabled:opacity-50"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{loading ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
}

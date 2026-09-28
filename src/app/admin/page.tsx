import { requireAdmin } from "@/lib/auth-utils";
import { Shield, KeyRound, User, Lock, Activity, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const user = session.user;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Phase 3 Authentication Active</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user.name || "Admin"}!
            </h1>
            <p className="text-sm text-slate-400">
              Authenticated session active for <span className="text-slate-200 font-mono">{user.email}</span>
            </p>
          </div>

          <Link
            href="/admin/change-password"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all shrink-0"
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </Link>
        </div>
      </div>

      {/* Security Infrastructure Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Session Info */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit border border-emerald-500/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Active Session</h3>
            <p className="text-xs text-slate-400 mt-1">NextAuth v5 JWT strategy</p>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Role:</span>
              <span className="font-semibold text-indigo-400">{user.role}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Account Status:</span>
              <span className="font-semibold text-emerald-400">{user.status}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>User ID:</span>
              <span className="font-mono text-slate-400 text-[10px] truncate max-w-[120px]">{user.id}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Security & Protection */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit border border-cyan-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Route Protection</h3>
            <p className="text-xs text-slate-400 mt-1">Middleware & API guards enabled</p>
          </div>
          <ul className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Protected <code className="text-cyan-300 font-mono">/admin/*</code> pages</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Protected <code className="text-cyan-300 font-mono">/api/admin/*</code> endpoints</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>BCrypt password hashing & rate limiting</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Rate Limiting & Audit */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit border border-purple-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Security Guardrails</h3>
            <p className="text-xs text-slate-400 mt-1">Brute-force protection</p>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Rate Limiter:</span>
              <span className="text-emerald-400 font-medium">Sliding Window (5 attempts/15m)</span>
            </div>
            <div className="flex justify-between">
              <span>CSRF Protection:</span>
              <span className="text-emerald-400 font-medium">NextAuth Token Tokens</span>
            </div>
            <div className="flex justify-between">
              <span>Password Leaks:</span>
              <span className="text-emerald-400 font-medium">Stripped from API responses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

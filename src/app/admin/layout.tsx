import { getAuthSession } from "@/lib/auth-utils";
import { AuthProvider } from "@/components/providers/session-provider";
import { LogoutButton } from "@/components/admin/logout-button";
import { Shield, KeyRound, LayoutDashboard, UserCheck } from "lucide-react";
import Link from "next/link";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  // If unauthenticated or accessing login page, render child component directly
  if (!session?.user) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Top Navigation Header */}
        <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Logo Branding */}
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="flex items-center gap-2.5 text-white font-bold text-lg hover:opacity-90 transition-opacity"
              >
                <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Shield className="w-5 h-5" />
                </div>
                <span>Webgent Admin</span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/change-password"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                >
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Security</span>
                </Link>
              </nav>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <div className="text-left text-xs">
                  <p className="font-semibold text-white leading-none">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
                    {session.user.role} • {session.user.status}
                  </p>
                </div>
              </div>

              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}

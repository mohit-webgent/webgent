import { requireAdmin } from "@/lib/auth-utils";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminChangePasswordPage() {
  await requireAdmin();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Dashboard</span>
      </Link>

      <ChangePasswordForm />
    </div>
  );
}

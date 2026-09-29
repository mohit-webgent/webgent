import { requireAdmin } from "@/lib/auth-utils";
import { BlogForm } from "@/components/admin/blog-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminNewBlogPage() {
  await requireAdmin();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Articles List</span>
      </Link>

      <BlogForm />
    </div>
  );
}

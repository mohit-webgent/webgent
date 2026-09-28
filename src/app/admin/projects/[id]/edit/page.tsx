import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminEditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const project = await prisma.project.findUnique({
    where: { id: params.id },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects List</span>
      </Link>

      <ProjectForm initialData={project} />
    </div>
  );
}

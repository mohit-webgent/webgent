import { requireAdmin } from "@/lib/auth-utils";
import { ProjectsList } from "@/components/admin/projects-list";

export default async function AdminProjectsPage() {
  await requireAdmin();

  return (
    <div className="animate-in fade-in duration-300">
      <ProjectsList />
    </div>
  );
}

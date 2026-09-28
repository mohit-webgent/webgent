import { requireAdmin } from "@/lib/auth-utils";
import { LeadsList } from "@/components/admin/leads-list";

export default async function AdminLeadsPage() {
  await requireAdmin();

  return (
    <div className="animate-in fade-in duration-300">
      <LeadsList />
    </div>
  );
}

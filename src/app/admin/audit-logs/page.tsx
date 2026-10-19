import { requireStrictAdmin } from "@/lib/auth-utils";
import { AdminScaffoldView } from "@/components/admin/admin-scaffold-view";
import { ScrollText } from "lucide-react";

export const metadata = {
  title: "System Audit Logs — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAuditLogsPage() {
  await requireStrictAdmin();

  return (
    <AdminScaffoldView
      title="System Audit Logs"
      description="Inspect chronological records of security actions, administrative modifications, content deletions, and sensitive setting updates across Webgent."
      group="System"
      icon={ScrollText}
      targetStorage="Prisma Model: SystemAuditLog (table: system_audit_logs)"
      publicConsumers={["Security Compliance", "Internal Audit & Diagnostics"]}
      adminOnly={true}
      plannedFeatures={[
        "Searchable and paginated table of administrative audit events",
        "Action type filtering (AUTH_LOGIN, LEAD_DELETED, SETTINGS_UPDATED, PROJECT_PUBLISHED)",
        "Actor attribution (admin ID, timestamp, IP address)",
        "Detailed JSON metadata inspector dialog for security forensics",
      ]}
    />
  );
}

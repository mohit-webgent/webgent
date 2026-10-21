import { requireStrictAdmin } from "@/lib/auth-utils";
import { getAuditLogs } from "@/lib/services/audit-log";
import { AuditLogsView } from "@/components/admin/audit-logs-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "System Audit Logs — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAuditLogsPage() {
  await requireStrictAdmin();

  const data = await getAuditLogs({ page: 1, limit: 20 });

  return (
    <div className="animate-in fade-in duration-300">
      <AuditLogsView
        initialLogs={data.logs}
        initialPagination={{
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages,
        }}
      />
    </div>
  );
}

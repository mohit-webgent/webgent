import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { LeadDetailEditor } from "@/components/admin/lead-detail-editor";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
  });

  if (!lead) {
    notFound();
  }

  const serializedLead = {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    followUpDate: lead.followUpDate ? lead.followUpDate.toISOString() : null,
  };

  return (
    <div className="animate-in fade-in duration-300">
      <LeadDetailEditor initialLead={serializedLead} />
    </div>
  );
}

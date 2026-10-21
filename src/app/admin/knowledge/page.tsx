import { requireAdmin } from "@/lib/auth-utils";
import { getKnowledgeBaseConfig } from "@/lib/services/knowledge-base-service";
import { KnowledgeBaseEditor } from "@/components/admin/knowledge-base-editor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Consultant Knowledge Base — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminKnowledgePage() {
  await requireAdmin();

  const config = await getKnowledgeBaseConfig();

  return (
    <div className="animate-in fade-in duration-300">
      <KnowledgeBaseEditor initialConfig={config} />
    </div>
  );
}

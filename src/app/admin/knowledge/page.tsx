import { requireAdmin } from "@/lib/auth-utils";
import { AdminScaffoldView } from "@/components/admin/admin-scaffold-view";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "AI Consultant Knowledge Base — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminKnowledgePage() {
  await requireAdmin();

  return (
    <AdminScaffoldView
      title="AI Consultant Approved Knowledge"
      description="Manage the ground-truth facts, domain blueprints, custom behavioral instructions, and quoting boundaries used by the Google Gemini AI Consultant."
      group="AI Consultant"
      icon={Sparkles}
      targetStorage="SiteSetting (keys: ai_approved_knowledge, ai_custom_rules)"
      publicConsumers={["/api/chat/start", "/api/chat/message", "AI Consultant Orchestrator"]}
      plannedFeatures={[
        "Approved facts manager (verified company credentials, founder background, verified projects)",
        "Domain blueprint editor (Gym, E-commerce, SaaS, Booking starter packages)",
        "Custom behavioral instructions and tone guardrails editor",
        "Instant in-memory knowledge index reload without restarting server processes",
      ]}
    />
  );
}

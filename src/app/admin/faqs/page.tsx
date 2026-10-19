import { requireAdmin } from "@/lib/auth-utils";
import { AdminScaffoldView } from "@/components/admin/admin-scaffold-view";
import { HelpCircle } from "lucide-react";

export const metadata = {
  title: "FAQs Management — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminFaqsPage() {
  await requireAdmin();

  return (
    <AdminScaffoldView
      title="Frequently Asked Questions"
      description="Create, update, reorder, and categorize customer FAQs across Development, Hosting, Pricing, and Post-Launch Support."
      group="Content"
      icon={HelpCircle}
      targetStorage="SiteSetting (key: site_faqs)"
      publicConsumers={["/pricing", "/contact", "Homepage FAQ Accordion"]}
      plannedFeatures={[
        "Categorized FAQ editor with drag-and-drop or numerical display reordering",
        "Publish/draft toggle per question",
        "Rich text formatting for detailed answers and policy explanations",
        "Instant feed into pricing matrix accordion and AI consultant knowledge retrieval",
      ]}
    />
  );
}

import { requireAdmin } from "@/lib/auth-utils";
import { AdminScaffoldView } from "@/components/admin/admin-scaffold-view";
import { Tags } from "lucide-react";

export const metadata = {
  title: "Pricing, Packages & Matrix — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPricingPage() {
  await requireAdmin();

  return (
    <AdminScaffoldView
      title="Pricing, Packages & Add-ons"
      description="Configure public tier pricing (Starter, Professional, Enterprise), feature matrix checklist, add-on costs, SLA guarantees, and hourly maintenance rates."
      group="Business"
      icon={Tags}
      targetStorage="SiteSetting (key: pricing_overrides)"
      publicConsumers={["/pricing", "Calculator Modal", "AI Consultant API"]}
      plannedFeatures={[
        "Interactive editor for Starter, Professional, and Enterprise package prices and features",
        "Add-on feature pricing configuration (auth, payments, CMS, analytics)",
        "Turnaround timelines and SLA text management",
        "Real-time propagation to public pricing calculator and AI Consultant quoting engine",
      ]}
    />
  );
}

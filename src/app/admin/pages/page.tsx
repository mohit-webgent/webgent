import { requireAdmin } from "@/lib/auth-utils";
import { AdminScaffoldView } from "@/components/admin/admin-scaffold-view";
import { LayoutTemplate } from "lucide-react";

export const metadata = {
  title: "Pages & Content Builder — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPagesPage() {
  await requireAdmin();

  return (
    <AdminScaffoldView
      title="Pages & Content Builder"
      description="Manage public website pages, hero headings, subtitles, call-to-action buttons, section ordering, and component visibility across Webgent."
      group="Content"
      icon={LayoutTemplate}
      targetStorage="SiteSetting (keys: home_hero_content, home_sections_config)"
      publicConsumers={["/", "/about", "/contact"]}
      plannedFeatures={[
        "Homepage Hero title, subtitle, badges, and primary/secondary CTA editing",
        "Section visibility toggles and display sequence reordering",
        "Feature list and capability card customization without code deployment",
        "Cache revalidation triggers for instant homepage updates",
      ]}
    />
  );
}

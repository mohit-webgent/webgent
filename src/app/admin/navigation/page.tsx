import { requireAdmin } from "@/lib/auth-utils";
import { AdminScaffoldView } from "@/components/admin/admin-scaffold-view";
import { Compass } from "lucide-react";

export const metadata = {
  title: "Navigation & Menus — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNavigationPage() {
  await requireAdmin();

  return (
    <AdminScaffoldView
      title="Navigation & Menus"
      description="Manage top header navbar items, footer navigation links, external social media profiles, and call-to-action redirect links."
      group="System"
      icon={Compass}
      targetStorage="SiteSetting (keys: navigation_menu, footer_links)"
      publicConsumers={["Navbar Component", "Footer Component", "Root Layout"]}
      plannedFeatures={[
        "Add, reorder, rename, or toggle visibility of header navigation links",
        "Footer column link groups and copyright notice editor",
        "Social media profile link management (GitHub, Twitter, LinkedIn, Discord)",
        "Direct cache revalidation for the root layout component",
      ]}
    />
  );
}

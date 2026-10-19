import { requireAdmin } from "@/lib/auth-utils";
import { AdminScaffoldView } from "@/components/admin/admin-scaffold-view";
import { Search } from "lucide-react";

export const metadata = {
  title: "Global SEO & Meta Tags — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSeoPage() {
  await requireAdmin();

  return (
    <AdminScaffoldView
      title="Global SEO & Meta Tags"
      description="Manage search engine indexing, default page meta titles, OpenGraph preview cards, Twitter cards, and third-party analytics telemetry tags."
      group="System"
      icon={Search}
      targetStorage="SiteSetting (keys: default_meta_title, default_meta_description, google_analytics_id)"
      publicConsumers={["layout.tsx", "robots.ts", "sitemap.ts", "/api/og"]}
      plannedFeatures={[
        "Default fallback meta title, description, and keywords editor",
        "Per-route custom OpenGraph badge and social preview image manager",
        "Google Analytics 4 Measurement ID and Search Console verification tag setup",
        "Live SERP search snippet preview card",
      ]}
    />
  );
}

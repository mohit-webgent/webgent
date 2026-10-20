import { requireAdmin } from "@/lib/auth-utils";
import { getSiteSeoSettings } from "@/lib/services/cms";
import { SeoContentEditor } from "@/components/admin/seo-content-editor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Global SEO & Metadata Studio — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSeoPage() {
  await requireAdmin();
  const settings = await getSiteSeoSettings();

  return <SeoContentEditor initialSettings={settings} />;
}

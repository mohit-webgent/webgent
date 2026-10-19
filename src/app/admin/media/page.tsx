import { requireAdmin } from "@/lib/auth-utils";
import { AdminScaffoldView } from "@/components/admin/admin-scaffold-view";
import { Image as ImageIcon } from "lucide-react";

export const metadata = {
  title: "Media & Asset Library — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  await requireAdmin();

  return (
    <AdminScaffoldView
      title="Media & Asset Library"
      description="Centralized library for browsing, uploading, previewing, and organizing images stored on Cloudflare R2 object storage."
      group="Content"
      icon={ImageIcon}
      targetStorage="Cloudflare R2 Storage (directories: images/projects/, images/blog/, images/testimonials/)"
      publicConsumers={["Project Editor", "Blog Post Editor", "Testimonial Avatars", "Hero Visuals"]}
      plannedFeatures={[
        "Cloudflare R2 visual file browser with thumbnail grid and list views",
        "Drag-and-drop batch uploader with magic-byte validation and 5MB size enforcement",
        "One-click CDN URL copying and asset deletion protections",
        "Direct integration into project, blog, and site settings media selectors",
      ]}
    />
  );
}

import { requireAdmin } from "@/lib/auth-utils";
import { MediaLibraryView } from "@/components/admin/media-library-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Media & Asset Library — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  await requireAdmin();

  return (
    <div className="animate-in fade-in duration-300">
      <MediaLibraryView />
    </div>
  );
}

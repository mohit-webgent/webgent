import { requireAdmin } from "@/lib/auth-utils";
import { getNavigationMenu, getFooterConfig } from "@/lib/services/cms";
import { NavigationContentEditor } from "@/components/admin/navigation-content-editor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Navigation & Menus — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNavigationPage() {
  await requireAdmin();

  // Load all navigation items and footer configuration including drafts
  const [initialNavigation, initialFooter] = await Promise.all([
    getNavigationMenu({ publishedOnly: false }),
    getFooterConfig({ publishedOnly: false }),
  ]);

  return (
    <div className="animate-in fade-in duration-300">
      <NavigationContentEditor
        initialNavigation={initialNavigation}
        initialFooter={initialFooter}
      />
    </div>
  );
}

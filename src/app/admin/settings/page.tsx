import { requireStrictAdmin } from "@/lib/auth-utils";
import { SettingsManager } from "@/components/admin/settings-manager";

export const metadata = {
  title: "System Settings — Webgent Admin",
};

export default async function AdminSettingsPage() {
  await requireStrictAdmin();

  return (
    <div className="animate-in fade-in duration-300">
      <SettingsManager />
    </div>
  );
}

import { requireAdmin } from "@/lib/auth-utils";
import { ProfileManager } from "@/components/admin/profile-manager";

export const metadata = {
  title: "Admin Profile — Webgent",
};

export default async function AdminProfilePage() {
  await requireAdmin();

  return (
    <div className="animate-in fade-in duration-300">
      <ProfileManager defaultTab="profile" />
    </div>
  );
}

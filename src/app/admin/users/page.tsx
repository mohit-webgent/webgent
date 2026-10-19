import { requireStrictAdmin } from "@/lib/auth-utils";
import { AdminScaffoldView } from "@/components/admin/admin-scaffold-view";
import { UserCog } from "lucide-react";

export const metadata = {
  title: "Users & Access Control — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  await requireStrictAdmin();

  return (
    <AdminScaffoldView
      title="Users & Access Control"
      description="Manage internal administrative users, assign role privileges (ADMIN vs EDITOR), suspend compromised accounts, and inspect last-login activity."
      group="System"
      icon={UserCog}
      targetStorage="Prisma Model: User (table: users)"
      publicConsumers={["Admin Console Authentication Guard", "API Access Verification"]}
      adminOnly={true}
      plannedFeatures={[
        "List all system users with role badges, status flags, and last login dates",
        "Invite or create new authorized staff accounts with bcrypt password hashes",
        "Role elevation / demotion (ADMIN / EDITOR) with server-side privilege check",
        "Account suspension and immediate session revocation capabilities",
      ]}
    />
  );
}

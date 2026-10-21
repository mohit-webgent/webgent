import { requireStrictAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Users & Roles — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const session = await requireStrictAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatarUrl: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
  }));

  return (
    <div className="animate-in fade-in duration-300">
      <UsersManager
        initialUsers={serializedUsers}
        currentAdminId={session.user.id}
      />
    </div>
  );
}

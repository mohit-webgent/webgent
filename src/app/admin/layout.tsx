import { getAuthSession } from "@/lib/auth-utils";
import { AuthProvider } from "@/components/providers/session-provider";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin Console — Webgent",
  description: "Secure production administrative management dashboard for Webgent.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  // If unauthenticated or accessing login page, render child component directly
  if (!session?.user) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AuthProvider>
      <AdminShell user={session.user}>
        {children}
      </AdminShell>
    </AuthProvider>
  );
}

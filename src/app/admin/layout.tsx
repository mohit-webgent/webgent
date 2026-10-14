import { getAuthSession } from "@/lib/auth-utils";
import { AuthProvider } from "@/components/providers/session-provider";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin Console — Webgent",
  description: "Secure production administrative management dashboard for Webgent.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();

  if (!session?.user) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AuthProvider>
      <AdminShell user={session.user}>{children}</AdminShell>
    </AuthProvider>
  );
}

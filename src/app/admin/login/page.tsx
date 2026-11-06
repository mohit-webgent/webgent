import { redirect } from "next/navigation";
import { canAccessAdminConsole, getAuthSession } from "@/lib/auth-utils";
import { resolveAdminCallback } from "@/lib/auth-redirect";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata = {
  title: "Sign in — Webgent Admin",
  robots: { index: false, follow: false },
};

interface AdminLoginPageProps {
  searchParams: Promise<{ callbackUrl?: string | string[]; error?: string | string[] }>;
}

const firstValue = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

function describeUrlError(error?: string): string | null {
  if (!error) return null;
  if (error === "Forbidden") return "This account doesn't have access to the admin console.";
  return "We couldn't sign you in. Please try again.";
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const [session, params] = await Promise.all([getAuthSession(), searchParams]);
  const callbackUrl = resolveAdminCallback(firstValue(params.callbackUrl));

  if (canAccessAdminConsole(session)) {
    redirect(callbackUrl);
  }

  return (
    <AdminLoginForm
      callbackUrl={callbackUrl}
      initialError={describeUrlError(firstValue(params.error))}
    />
  );
}

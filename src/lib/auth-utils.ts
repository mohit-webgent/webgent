import { auth } from "@/auth";
import type { Session } from "next-auth";
import { UserRole, UserStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { ApiResponse } from "@/lib/api/response";

export type AuthSessionResolver = () => Promise<Session | null>;
let sessionResolver: AuthSessionResolver | null = null;

/**
 * Allows injecting a custom auth session resolver for integration tests.
 * Pass null to restore default behavior (NextAuth auth()).
 */
export function setAuthSessionResolver(resolver: AuthSessionResolver | null) {
  sessionResolver = resolver;
}

export async function getAuthSession(): Promise<Session | null> {
  if (sessionResolver) {
    return await sessionResolver();
  }
  try {
    return (await auth()) as Session | null;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getAuthSession();

  if (!session || !session.user || session.user.status !== UserStatus.ACTIVE) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.EDITOR) {
    redirect("/admin/login?error=Forbidden");
  }

  return session;
}

export async function requireStrictAdmin() {
  const session = await requireAuth();

  if (session.user.role !== UserRole.ADMIN) {
    redirect("/admin?error=Unauthorized");
  }

  return session;
}

export async function verifyAdminApiAccess() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    return ApiResponse.unauthorized("Authentication required to access admin resources.");
  }

  if (session.user.status !== UserStatus.ACTIVE) {
    return ApiResponse.forbidden("Your account is inactive or suspended.");
  }

  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.EDITOR) {
    return ApiResponse.forbidden("Insufficient permissions. Admin role required.");
  }

  return { session };
}

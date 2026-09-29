import { auth } from "@/auth";
import { UserRole, UserStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { ApiResponse } from "@/lib/api/response";

/**
 * Retrieves current server-side NextAuth session.
 */
export async function getAuthSession() {
  try {
    return await auth();
  } catch {
    return null;
  }
}

/**
 * Asserts that a session exists and the user is active.
 * Redirects to /admin/login if unauthenticated.
 */
export async function requireAuth() {
  const session = await getAuthSession();

  if (!session || !session.user || session.user.status !== UserStatus.ACTIVE) {
    redirect("/admin/login");
  }

  return session;
}

/**
 * Asserts that the authenticated user has ADMIN or EDITOR permissions.
 * Redirects unauthenticated or non-admin users to /admin/login.
 */
export async function requireAdmin() {
  const session = await requireAuth();

  if (
    session.user.role !== UserRole.ADMIN &&
    session.user.role !== UserRole.EDITOR
  ) {
    redirect("/admin/login?error=Forbidden");
  }

  return session;
}

/**
 * Server-side API guard for /api/admin/* endpoints.
 * Returns null if authorized, or a Next.js Response (401/403) if rejected.
 */
export async function verifyAdminApiAccess() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    return ApiResponse.unauthorized("Authentication required to access admin resources.");
  }

  if (session.user.status !== UserStatus.ACTIVE) {
    return ApiResponse.forbidden("Your account is inactive or suspended.");
  }

  if (
    session.user.role !== UserRole.ADMIN &&
    session.user.role !== UserRole.EDITOR
  ) {
    return ApiResponse.forbidden("Insufficient permissions. Admin role required.");
  }

  return { session };
}

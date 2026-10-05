import { auth } from "@/auth";
import { UserRole, UserStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { ApiResponse } from "@/lib/api/response";

export async function getAuthSession() {
  try {
    return await auth();
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

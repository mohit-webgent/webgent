import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { recordAuditLog } from "@/lib/services/audit-log";
import { UserRole, UserStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["ADMIN", "EDITOR", "USER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  password: z.string().min(8).optional().or(z.literal("")),
});

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    if (authGuard.session.user.role !== "ADMIN") {
      return ApiResponse.forbidden("Only system administrators can inspect user accounts.");
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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

    if (!user) {
      return ApiResponse.notFound("User not found.");
    }

    return ApiResponse.success(user);
  } catch (error) {
    logger.error("[Admin Users API] Error fetching user", { error, id: params.id });
    return ApiResponse.internalError("Failed to retrieve user details.");
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    if (authGuard.session.user.role !== "ADMIN") {
      return ApiResponse.forbidden("Only system administrators can modify user accounts.");
    }

    const body = await req.json().catch(() => ({}));
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid user modification parameters.",
        validation.error.flatten().fieldErrors,
      );
    }

    const { name, role, status, password } = validation.data;
    const currentAdminId = authGuard.session.user.id;

    // Security Rule 1: Never allow an admin to remove their own administrative access
    if (params.id === currentAdminId) {
      if (role && role !== "ADMIN") {
        return ApiResponse.badRequest(
          "You cannot remove your own administrative role. Have another admin change your permissions if needed.",
        );
      }
      if (status && status !== "ACTIVE") {
        return ApiResponse.badRequest(
          "You cannot deactivate or suspend your own active administrator account.",
        );
      }
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return ApiResponse.notFound("User account not found.");
    }

    // Security Rule 2: Never allow removing or deactivating the last administrative account
    if (
      targetUser.role === "ADMIN" &&
      targetUser.status === "ACTIVE" &&
      ((role && role !== "ADMIN") || (status && status !== "ACTIVE"))
    ) {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          status: "ACTIVE",
        },
      });

      if (activeAdminCount <= 1) {
        return ApiResponse.badRequest(
          "Cannot demote or deactivate the system's last remaining active administrator.",
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    if (name) updateData.name = name.trim();
    if (role) updateData.role = role as UserRole;
    if (status) updateData.status = status as UserStatus;
    if (password && password.trim().length >= 8) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    await recordAuditLog("USER_UPDATED", {
      actorId: currentAdminId,
      actorEmail: authGuard.session.user.email,
      targetUserId: updated.id,
      targetUserEmail: updated.email,
      changes: {
        nameChanged: !!name,
        newRole: role || targetUser.role,
        newStatus: status || targetUser.status,
        passwordChanged: !!password,
      },
    });

    return ApiResponse.success(updated, 200, {
      message: "User account updated successfully.",
    });
  } catch (error) {
    logger.error("[Admin Users API] Error updating user", { error, id: params.id });
    return ApiResponse.internalError("Failed to update user account.");
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    if (authGuard.session.user.role !== "ADMIN") {
      return ApiResponse.forbidden("Only system administrators can delete user accounts.");
    }

    const currentAdminId = authGuard.session.user.id;

    // Security Rule 1: Never allow self-deletion
    if (params.id === currentAdminId) {
      return ApiResponse.badRequest("You cannot delete your own active administrator account.");
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return ApiResponse.notFound("User account not found.");
    }

    // Security Rule 2: Cannot delete the last active administrator
    if (targetUser.role === "ADMIN" && targetUser.status === "ACTIVE") {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          status: "ACTIVE",
        },
      });

      if (activeAdminCount <= 1) {
        return ApiResponse.badRequest(
          "Cannot delete the system's last remaining active administrator.",
        );
      }
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    await recordAuditLog("USER_DELETED", {
      actorId: currentAdminId,
      actorEmail: authGuard.session.user.email,
      deletedUserId: targetUser.id,
      deletedUserEmail: targetUser.email,
      deletedRole: targetUser.role,
    });

    return ApiResponse.success({
      message: `User account "${targetUser.email}" deleted successfully.`,
    });
  } catch (error) {
    logger.error("[Admin Users API] Error deleting user", { error, id: params.id });
    return ApiResponse.internalError("Failed to delete user account.");
  }
}

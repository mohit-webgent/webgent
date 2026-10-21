import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export async function GET() {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const user = await prisma.user.findUnique({
      where: { id: authGuard.session.user.id },
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
    logger.error("Failed to fetch admin profile", { error });
    return ApiResponse.internalError("Failed to retrieve profile.");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const body = await req.json().catch(() => ({}));
    const validated = updateProfileSchema.safeParse(body);
    if (!validated.success) {
      return ApiResponse.validationError(
        "Invalid profile update parameters.",
        validated.error.flatten().fieldErrors,
      );
    }

    const { name, avatarUrl } = validated.data;

    const updatedUser = await prisma.user.update({
      where: { id: authGuard.session.user.id },
      data: {
        name: name.trim(),
        avatarUrl: avatarUrl ? avatarUrl.trim() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return ApiResponse.success(updatedUser, 200, {
      message: "Profile updated successfully.",
    });
  } catch (error) {
    logger.error("Failed to update admin profile", { error });
    return ApiResponse.internalError("Failed to save profile changes.");
  }
}

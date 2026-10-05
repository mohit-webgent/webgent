import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { changePasswordSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const userId = authGuard.session.user.id;

    const rateLimit = await checkRateLimit(`change-pw:${userId}`, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return ApiResponse.tooManyRequests(
        "Too many password change attempts. Please try again later.",
      );
    }

    const body = await req.json().catch(() => ({}));
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid password update parameters.",
        validation.error.flatten().fieldErrors,
      );
    }

    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return ApiResponse.notFound("User account not found.");
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordCorrect) {
      return ApiResponse.badRequest(
        "The current password you provided is incorrect.",
        "INVALID_CURRENT_PASSWORD",
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    logger.info("Admin password updated successfully", { userId });

    return ApiResponse.success({
      message: "Password changed successfully.",
    });
  } catch (error) {
    logger.error("Error changing password", { error: String(error) });
    return ApiResponse.internalError("Failed to update password due to a server error.");
  }
}

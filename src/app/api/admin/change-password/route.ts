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
    // 1. Verify Admin authentication & permissions
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const userId = authGuard.session.user.id;

    // 2. Rate limiting check (max 5 password changes per 15 mins per user)
    const rateLimit = await checkRateLimit(`change-pw:${userId}`, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return ApiResponse.tooManyRequests(
        "Too many password change attempts. Please try again later."
      );
    }

    // 3. Validate input body against Zod schema
    const body = await req.json().catch(() => ({}));
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid password update parameters.",
        validation.error.flatten().fieldErrors
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // 4. Fetch user record from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return ApiResponse.notFound("User account not found.");
    }

    // 5. Verify current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordCorrect) {
      return ApiResponse.badRequest(
        "The current password you provided is incorrect.",
        "INVALID_CURRENT_PASSWORD"
      );
    }

    // 6. Hash new password securely
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // 7. Update user record in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    logger.info("Admin password updated successfully", { userId });

    // 8. Return success response (never expose passwordHash)
    return ApiResponse.success({
      message: "Password changed successfully.",
    });
  } catch (error) {
    logger.error("Error changing password", { error: String(error) });
    return ApiResponse.internalError("Failed to update password due to a server error.");
  }
}

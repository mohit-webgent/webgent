import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { projectReorderSchema } from "@/lib/validations/project";
import { logger } from "@/lib/logger";

export async function PATCH(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const body = await req.json().catch(() => ({}));
    const validation = projectReorderSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid reorder payload format",
        validation.error.flatten().fieldErrors,
      );
    }

    const { items } = validation.data;

    await prisma.$transaction(
      items.map((item) =>
        prisma.project.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    logger.info("Successfully reordered projects batch", {
      count: items.length,
    });

    return ApiResponse.success({ message: "Projects reordered successfully." });
  } catch (error) {
    logger.error("Error reordering projects", { error: String(error) });
    return ApiResponse.internalError("Failed to reorder projects.");
  }
}

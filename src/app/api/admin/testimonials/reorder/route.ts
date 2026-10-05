import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { testimonialReorderSchema } from "@/lib/validations/testimonial";
import { logger } from "@/lib/logger";

export async function PATCH(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const body = await req.json().catch(() => ({}));
    const validation = testimonialReorderSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid reorder payload format",
        validation.error.flatten().fieldErrors,
      );
    }

    const { items } = validation.data;

    await prisma.$transaction(
      items.map((item) =>
        prisma.testimonial.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    logger.info("Testimonials successfully reordered", { count: items.length });

    return ApiResponse.success({
      message: "Testimonials reordered successfully.",
    });
  } catch (error) {
    logger.error("Error reordering testimonials", { error: String(error) });
    return ApiResponse.internalError("Failed to reorder testimonials.");
  }
}

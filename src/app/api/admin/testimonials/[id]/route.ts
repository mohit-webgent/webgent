import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { testimonialSchema, testimonialUpdateSchema } from "@/lib/validations/testimonial";
import { storageService } from "@/lib/services/storage";
import { logger } from "@/lib/logger";

/**
 * Admin Single Testimonial API
 * GET /api/admin/testimonials/:id
 * PUT /api/admin/testimonials/:id
 * PATCH /api/admin/testimonials/:id
 * DELETE /api/admin/testimonials/:id
 */

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return ApiResponse.notFound("Testimonial not found.");
    }

    return ApiResponse.success({
      ...testimonial,
      designation: testimonial.clientTitle,
      quote: testimonial.content,
      photoUrl: testimonial.avatarUrl,
    });
  } catch (error) {
    logger.error("Error fetching single testimonial", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch testimonial.");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;

    const existing = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.notFound("Testimonial not found.");
    }

    const body = await req.json().catch(() => ({}));
    const validation = testimonialSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid testimonial update data",
        validation.error.flatten().fieldErrors
      );
    }

    const data = validation.data;

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        clientName: data.clientName,
        clientTitle: data.clientTitle,
        company: data.company,
        content: data.content,
        avatarUrl: data.avatarUrl,
        rating: data.rating,
        featured: data.featured,
        status: data.status,
        order: data.order,
      },
    });

    logger.info("Updated testimonial via PUT", { testimonialId: id });

    return ApiResponse.success({
      ...updated,
      designation: updated.clientTitle,
      quote: updated.content,
      photoUrl: updated.avatarUrl,
    });
  } catch (error) {
    logger.error("Error updating testimonial via PUT", { error: String(error) });
    return ApiResponse.internalError("Failed to update testimonial.");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;

    const existing = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.notFound("Testimonial not found.");
    }

    const body = await req.json().catch(() => ({}));
    const validation = testimonialUpdateSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid testimonial patch data",
        validation.error.flatten().fieldErrors
      );
    }

    const data = validation.data;

    const updated = await prisma.testimonial.update({
      where: { id },
      data,
    });

    logger.info("Patched testimonial record", { testimonialId: id, changes: Object.keys(data) });

    return ApiResponse.success({
      ...updated,
      designation: updated.clientTitle,
      quote: updated.content,
      photoUrl: updated.avatarUrl,
    });
  } catch (error) {
    logger.error("Error patching testimonial", { error: String(error) });
    return ApiResponse.internalError("Failed to patch testimonial.");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const isPermanent = searchParams.get("permanent") === "true";

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return ApiResponse.notFound("Testimonial not found.");
    }

    if (isPermanent) {
      // Safe cleanup of any stored photo in R2/S3
      if (testimonial.avatarUrl) {
        await storageService.deleteFile(testimonial.avatarUrl);
      }

      await prisma.testimonial.delete({
        where: { id },
      });

      logger.info("Permanently deleted testimonial", { testimonialId: id });
      return ApiResponse.success({ message: "Testimonial permanently deleted." });
    }

    // Default Safe Deletion: Soft delete
    const softDeleted = await prisma.testimonial.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    logger.info("Soft-deleted testimonial", { testimonialId: id });

    return ApiResponse.success({
      message: "Testimonial safely soft-deleted.",
      testimonial: softDeleted,
    });
  } catch (error) {
    logger.error("Error deleting testimonial", { error: String(error) });
    return ApiResponse.internalError("Failed to delete testimonial.");
  }
}

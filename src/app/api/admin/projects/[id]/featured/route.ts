import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { logger } from "@/lib/logger";

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

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return ApiResponse.notFound("Project not found.");
    }

    const body = await req.json().catch(() => ({}));
    const nextFeatured =
      typeof body.featured === "boolean" ? body.featured : !project.featured;

    // Enforce Max 3 Featured Projects Limit
    if (nextFeatured && !project.featured) {
      const featuredCount = await prisma.project.count({
        where: { featured: true, NOT: { id } },
      });
      if (featuredCount >= 3) {
        return ApiResponse.badRequest(
          "Maximum limit of 3 featured projects reached. Unfeature another project first.",
          "FEATURED_LIMIT_EXCEEDED"
        );
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { featured: nextFeatured },
    });

    logger.info("Updated project featured status", {
      projectId: id,
      featured: updatedProject.featured,
    });

    return ApiResponse.success(updatedProject);
  } catch (error) {
    logger.error("Error toggling project featured status", { error: String(error) });
    return ApiResponse.internalError("Failed to update featured status.");
  }
}

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
    const nextPublished =
      typeof body.published === "boolean" ? body.published : !project.published;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { published: nextPublished },
    });

    logger.info("Updated project publication status", {
      projectId: id,
      published: updatedProject.published,
    });

    return ApiResponse.success(updatedProject);
  } catch (error) {
    logger.error("Error toggling project publish status", { error: String(error) });
    return ApiResponse.internalError("Failed to update publication status.");
  }
}

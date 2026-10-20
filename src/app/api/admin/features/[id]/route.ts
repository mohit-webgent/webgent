import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { updateFeature, deleteFeature } from "@/lib/services/cms-services";
import { ApiResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/**
 * PUT /api/admin/features/[id]
 * Updates feature attributes and linked services.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return ApiResponse.badRequest("Request body must be valid JSON.");
    }

    const updated = await updateFeature(params.id, body);
    return ApiResponse.success(updated, 200, { message: "Feature updated successfully." });
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.badRequest(
        "Validation failed: Please check feature inputs.",
        "VALIDATION_ERROR",
        error.flatten().fieldErrors,
      );
    }

    const message = error instanceof Error ? error.message : "Failed to update feature.";
    if (message.includes("not found")) {
      return ApiResponse.notFound(message);
    }

    logger.error("[Admin Features API] Error updating feature", { id: params.id, error });
    return ApiResponse.internalError("Failed to update feature.");
  }
}

/**
 * DELETE /api/admin/features/[id]
 * Deletes feature and cascades its service-feature links.
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    await deleteFeature(params.id);
    return ApiResponse.success(null, 200, { message: "Feature deleted successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete feature.";
    if (message.includes("not found")) {
      return ApiResponse.notFound(message);
    }

    logger.error("[Admin Features API] Error deleting feature", { id: params.id, error });
    return ApiResponse.internalError("Failed to delete feature.");
  }
}

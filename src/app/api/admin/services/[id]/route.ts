import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { getAdminServiceById, updateService, deleteService } from "@/lib/services/cms-services";
import { ApiResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/admin/services/[id]
 * Retrieves single service by ID with attached features.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    const service = await getAdminServiceById(params.id);
    if (!service) {
      return ApiResponse.notFound(`Service with ID "${params.id}" not found.`);
    }

    return ApiResponse.success(service);
  } catch (error) {
    logger.error("[Admin Services API] Failed to fetch service by ID", { id: params.id, error });
    return ApiResponse.internalError("Failed to load service.");
  }
}

/**
 * PUT /api/admin/services/[id]
 * Updates service details and feature associations.
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

    const updated = await updateService(params.id, body);
    return ApiResponse.success(updated, 200, { message: "Service updated successfully." });
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.badRequest(
        "Validation failed: Please check service inputs.",
        "VALIDATION_ERROR",
        error.flatten().fieldErrors,
      );
    }

    const message = error instanceof Error ? error.message : "Failed to update service.";
    if (message.includes("not found")) {
      return ApiResponse.notFound(message);
    }
    if (message.includes("already exists")) {
      return ApiResponse.conflict(message);
    }

    logger.error("[Admin Services API] Error updating service", { id: params.id, error });
    return ApiResponse.internalError("Failed to update service.");
  }
}

/**
 * DELETE /api/admin/services/[id]
 * Deletes service and cascades its service-feature links.
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    await deleteService(params.id);
    return ApiResponse.success(null, 200, { message: "Service deleted successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete service.";
    if (message.includes("not found")) {
      return ApiResponse.notFound(message);
    }

    logger.error("[Admin Services API] Error deleting service", { id: params.id, error });
    return ApiResponse.internalError("Failed to delete service.");
  }
}

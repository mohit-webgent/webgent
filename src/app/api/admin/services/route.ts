import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { getAdminServices, createService, seedDefaultServicesIfEmpty } from "@/lib/services/cms-services";
import { ApiResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/services
 * Returns all services (published and draft) for admin management.
 * Protected: Requires active ADMIN or EDITOR session.
 */
export async function GET() {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    // If database has no services, seed initial default services
    await seedDefaultServicesIfEmpty();

    const services = await getAdminServices();
    return ApiResponse.success(services);
  } catch (error) {
    logger.error("[Admin Services API] Failed to fetch services", { error });
    return ApiResponse.internalError("Failed to load services.");
  }
}

/**
 * POST /api/admin/services
 * Creates a new service and optionally links feature IDs.
 * Protected: Requires active ADMIN or EDITOR session.
 */
export async function POST(req: NextRequest) {
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

    const created = await createService(body);
    return ApiResponse.success(created, 201, { message: "Service created successfully." });
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.badRequest(
        "Validation failed: Please check service inputs.",
        "VALIDATION_ERROR",
        error.flatten().fieldErrors,
      );
    }

    const message = error instanceof Error ? error.message : "Failed to create service.";
    if (message.includes("already exists")) {
      return ApiResponse.conflict(message);
    }

    logger.error("[Admin Services API] Error creating service", { error });
    return ApiResponse.internalError("Failed to create service.");
  }
}

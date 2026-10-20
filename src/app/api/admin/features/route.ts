import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { getAdminFeatures, createFeature } from "@/lib/services/cms-services";
import { ApiResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/features
 * Returns all normalized features with service counts.
 */
export async function GET() {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    const features = await getAdminFeatures();
    return ApiResponse.success(features);
  } catch (error) {
    logger.error("[Admin Features API] Failed to fetch features", { error });
    return ApiResponse.internalError("Failed to load features.");
  }
}

/**
 * POST /api/admin/features
 * Creates a new normalized feature and optionally links to services.
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

    const created = await createFeature(body);
    return ApiResponse.success(created, 201, { message: "Feature created successfully." });
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.badRequest(
        "Validation failed: Please check feature inputs.",
        "VALIDATION_ERROR",
        error.flatten().fieldErrors,
      );
    }

    logger.error("[Admin Features API] Error creating feature", { error });
    return ApiResponse.internalError("Failed to create feature.");
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { getSiteSeoSettings, saveSiteSeoSettings } from "@/lib/services/cms";
import { ApiResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/seo
 * Reads global SEO configuration and per-page route overrides.
 * Protected: Requires active ADMIN or EDITOR session.
 */
export async function GET() {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    const data = await getSiteSeoSettings();
    return ApiResponse.success(data);
  } catch (error) {
    logger.error("[Admin SEO API] Failed to fetch SEO configuration", { error });
    return ApiResponse.internalError("Failed to load SEO configuration.");
  }
}

/**
 * PUT /api/admin/seo
 * Validates, sanitizes, and persists SEO settings to PostgreSQL SiteSetting (key: site_seo_settings),
 * purges Redis cache, and revalidates public ISR paths and root layout.
 * Protected: Requires active ADMIN or EDITOR session.
 */
export async function PUT(req: NextRequest) {
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

    const result = await saveSiteSeoSettings(body);

    return ApiResponse.success(result.data, 200, {
      message: result.message,
      cacheRefreshed: result.meta.cacheRefreshed,
      cacheErrors: result.meta.cacheErrors.length > 0 ? result.meta.cacheErrors : undefined,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.badRequest(
        "Validation failed: Please check SEO inputs.",
        "VALIDATION_ERROR",
        error.flatten().fieldErrors,
      );
    }

    logger.error("[Admin SEO API] Failed to update SEO configuration", { error });
    return ApiResponse.internalError("Failed to persist SEO configuration.");
  }
}

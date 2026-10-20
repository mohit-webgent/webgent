import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import {
  getNavigationMenu,
  getFooterConfig,
  saveNavigationContent,
} from "@/lib/services/cms";
import { ApiResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/navigation
 * Reads full header navigation items and footer configuration including drafts.
 * Protected: Requires active ADMIN or EDITOR session.
 */
export async function GET() {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    const [navigation, footer] = await Promise.all([
      getNavigationMenu({ publishedOnly: false }),
      getFooterConfig({ publishedOnly: false }),
    ]);

    return ApiResponse.success({ navigation, footer });
  } catch (error) {
    logger.error("[Admin Navigation API] Failed to fetch navigation and footer", { error });
    return ApiResponse.internalError("Failed to load navigation configuration.");
  }
}

/**
 * PUT /api/admin/navigation
 * Validates, sanitizes, and atomically persists header navigation and footer settings
 * to PostgreSQL SiteSetting (keys: navigation_menu, footer_links),
 * and purges CMS Redis caches and revalidates public ISR pages and layout.
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

    const result = await saveNavigationContent(body);

    return ApiResponse.success(result.data, 200, {
      message: result.message,
      cacheRefreshed: result.meta.cacheRefreshed,
      cacheErrors: result.meta.cacheErrors.length > 0 ? result.meta.cacheErrors : undefined,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.badRequest(
        "Validation failed: Please check navigation and footer inputs.",
        "VALIDATION_ERROR",
        error.flatten().fieldErrors,
      );
    }

    logger.error("[Admin Navigation API] Error saving navigation and footer", { error });
    return ApiResponse.internalError("Failed to save navigation configuration.");
  }
}

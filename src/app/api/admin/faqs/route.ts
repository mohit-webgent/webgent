import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { getSiteFaqs, saveSiteFaqs } from "@/lib/services/cms";
import { ApiResponse } from "@/lib/api/response";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/faqs
 * Reads all site FAQs including unpublished drafts for the admin management view.
 * Protected: Requires active ADMIN or EDITOR session.
 */
export async function GET() {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    const data = await getSiteFaqs({ publishedOnly: false });
    return ApiResponse.success(data);
  } catch (error) {
    logger.error("[Admin FAQs API] Failed to fetch FAQs", { error });
    return ApiResponse.internalError("Failed to load FAQs configuration.");
  }
}

/**
 * PUT /api/admin/faqs
 * Validates, sanitizes, and persists FAQs to PostgreSQL SiteSetting (key: site_faqs),
 * and purges CMS Redis cache and revalidates public ISR pages.
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

    const result = await saveSiteFaqs(body);

    return ApiResponse.success(result.data, 200, {
      message: result.message,
      cacheRefreshed: result.meta.cacheRefreshed,
      cacheErrors: result.meta.cacheErrors.length > 0 ? result.meta.cacheErrors : undefined,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.badRequest(
        "Validation failed: Please check FAQ inputs.",
        "VALIDATION_ERROR",
        error.flatten().fieldErrors,
      );
    }

    logger.error("[Admin FAQs API] Error saving FAQs", { error });
    return ApiResponse.internalError("Failed to save FAQs configuration.");
  }
}

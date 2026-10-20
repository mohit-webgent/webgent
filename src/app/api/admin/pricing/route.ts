import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import {
  getPricingData,
  savePricingOverrides,
} from "@/lib/services/pricing";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pricing
 * Reads current pricing packages, rates, add-on features, and calculation settings.
 * Protected: Requires active ADMIN or EDITOR session.
 */
export async function GET() {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    const data = await getPricingData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("[Admin Pricing API] Failed to fetch pricing data", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load pricing configuration.",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/pricing
 * Updates pricing tiers, categories, features, and calculation settings.
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
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Request body must be valid JSON.",
          },
        },
        { status: 400 },
      );
    }

    const result = await savePricingOverrides(body);

    return NextResponse.json({
      success: true,
      message: result.meta.cacheRefreshed
        ? "Pricing configuration saved and public caches revalidated."
        : "Pricing configuration saved. Notice: Public cache revalidation encountered warnings.",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed: Please check pricing package and rate inputs.",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    logger.error("[Admin Pricing API] Error saving pricing configuration", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to save pricing configuration. Database write failed.",
        },
      },
      { status: 500 },
    );
  }
}

import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { analyticsService } from "@/lib/services/analytics";
import { adminAnalyticsQuerySchema, ValidPeriod } from "@/lib/validations/analytics";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics
 * Retrieves aggregated analytics for 7, 30, or 90 days.
 *
 * Requirements:
 * - Admin authentication required
 * - Supports 7 days, 30 days, 90 days
 * - Real DB data (no fake analytics data)
 * - Returns total page views, top pages, event counts, conversion funnel, device split, country distribution
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Enforce Admin API Access
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    // 2. Parse & validate query parameters
    const url = new URL(req.url);
    const rawPeriod = url.searchParams.get("period");
    const rawDays = url.searchParams.get("days");
    const rawRange = url.searchParams.get("range");

    const parsedQuery = adminAnalyticsQuerySchema.parse({
      period: rawPeriod || undefined,
      days: rawDays || undefined,
      range: rawRange || undefined,
    });

    const activePeriod: ValidPeriod =
      parsedQuery.range || parsedQuery.days || (parsedQuery.period as ValidPeriod) || "30d";

    // 3. Compute analytics metrics from database
    const metrics = await analyticsService.getAdminAnalytics(activePeriod);

    return ApiResponse.success(metrics);
  } catch (error) {
    logger.error("Failed to retrieve admin analytics", { error });
    return ApiResponse.internalError("Failed to fetch analytics metrics.");
  }
}

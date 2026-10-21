import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { getAuditLogs } from "@/lib/services/audit-log";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    // Only full ADMIN role can view security audit logs
    if (authGuard.session.user.role !== "ADMIN") {
      return ApiResponse.forbidden("Only system administrators can access audit logs.");
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const action = searchParams.get("action") || undefined;
    const search = searchParams.get("search") || undefined;

    const data = await getAuditLogs({
      page,
      limit,
      action,
      search,
    });

    return ApiResponse.success(data.logs, 200, {
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      },
    });
  } catch (error) {
    logger.error("[Admin Audit Logs API] Error fetching audit logs", { error });
    return ApiResponse.internalError("Failed to retrieve audit logs.");
  }
}

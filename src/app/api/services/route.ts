import { NextRequest } from "next/server";
import { getPublicServices } from "@/lib/services/cms-services";
import { ApiResponse } from "@/lib/api/response";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/services
 * Public endpoint returning published services and their enabled public features.
 * Supports query params: ?homeOnly=true, ?featuredOnly=true, ?limit=N
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const homeOnly = searchParams.get("homeOnly") === "true";
    const featuredOnly = searchParams.get("featuredOnly") === "true";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const services = await getPublicServices({
      homeOnly,
      featuredOnly,
      limit: Number.isInteger(limit) && limit! > 0 ? limit : undefined,
    });

    return ApiResponse.success(services);
  } catch (error) {
    logger.error("[Public Services API] Error fetching services", { error });
    return ApiResponse.internalError("Failed to load services.");
  }
}

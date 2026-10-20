import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { storageService, mediaDb } from "@/lib/services/storage";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;
    const media = await mediaDb.findUnique({
      where: { id },
    });

    if (!media) {
      return ApiResponse.notFound("Media asset not found.");
    }

    const references = await storageService.checkReferences(media.storageKey);

    return ApiResponse.success({
      mediaId: id,
      storageKey: media.storageKey,
      url: media.url,
      referencesCount: references.length,
      references,
    });
  } catch (error) {
    logger.error("Error fetching media references", {
      error: error instanceof Error ? error.message : String(error),
      id: params.id,
    });
    return ApiResponse.internalError("Failed to fetch media references.");
  }
}

import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { storageService, mediaDb, AllowedFolder } from "@/lib/services/storage";
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
      ...media,
      referencesCount: references.length,
      references,
    });
  } catch (error) {
    logger.error("Error fetching media item", {
      error: error instanceof Error ? error.message : String(error),
      id: params.id,
    });
    return ApiResponse.internalError("Failed to fetch media item.");
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const existing = await mediaDb.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.notFound("Media asset not found.");
    }

    const updateData: Record<string, unknown> = {};

    if (typeof body.altText === "string") {
      updateData.altText = body.altText.trim();
    }

    if (typeof body.folder === "string") {
      const validFolders: AllowedFolder[] = ["projects", "blog", "testimonials", "general"];
      if (!validFolders.includes(body.folder as AllowedFolder)) {
        return ApiResponse.badRequest(
          `Invalid folder "${body.folder}". Allowed: ${validFolders.join(", ")}`,
        );
      }
      updateData.folder = body.folder;
    }

    const updated = await mediaDb.update({
      where: { id },
      data: updateData,
    });

    return ApiResponse.success(updated);
  } catch (error) {
    logger.error("Error updating media item", {
      error: error instanceof Error ? error.message : String(error),
      id: params.id,
    });
    return ApiResponse.internalError("Failed to update media item.");
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const media = await mediaDb.findUnique({
      where: { id },
    });

    if (!media) {
      return ApiResponse.notFound("Media asset not found.");
    }

    try {
      await storageService.deleteFile(media.storageKey, force);
      return ApiResponse.success({
        message: "Media asset deleted successfully.",
        id,
      });
    } catch (deleteErr: unknown) {
      const msg = deleteErr instanceof Error ? deleteErr.message : String(deleteErr);
      if (msg.includes("Cannot delete asset")) {
        return ApiResponse.conflict(msg, "REFERENCED_ASSET");
      }
      throw deleteErr;
    }
  } catch (error) {
    logger.error("Error deleting media item", {
      error: error instanceof Error ? error.message : String(error),
      id: params.id,
    });
    return ApiResponse.internalError("Failed to delete media item.");
  }
}

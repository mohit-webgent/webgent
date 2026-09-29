import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import {
  storageService,
  detectImageMimeType,
  MAX_FILE_SIZE,
  AllowedFolder,
  ALLOWED_MIME_TYPES,
} from "@/lib/services/storage";
import { logger } from "@/lib/logger";

/**
 * Admin Image Upload Handler
 * POST /api/admin/upload
 * 
 * Requirements:
 * - Admin authentication required
 * - Accepts multipart/form-data
 * - Allows only JPG, PNG, and WEBP
 * - Max file size: 5MB
 * - Strict MIME type & binary magic number verification
 * - Organizes under predictable prefixes (images/projects/, images/blog/, images/testimonials/)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Admin API Access
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    // 2. Parse Multipart Form Data
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return ApiResponse.badRequest("Invalid form data payload. Expected multipart/form-data.");
    }

    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return ApiResponse.badRequest("No image file provided for upload.", "MISSING_FILE");
    }

    const rawFolder = (
      (formData.get("folder") || formData.get("category") || formData.get("prefix") || "projects") as string
    ).toLowerCase();

    // 3. Validate Folder Prefix
    const allowedFolders: AllowedFolder[] = ["projects", "blog", "testimonials"];
    if (!allowedFolders.includes(rawFolder as AllowedFolder)) {
      return ApiResponse.badRequest(
        `Invalid folder destination "${rawFolder}". Allowed destination folders: ${allowedFolders.join(", ")}`,
        "INVALID_FOLDER"
      );
    }
    const folder = rawFolder as AllowedFolder;

    // 4. Validate File Size (Max 5MB)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return ApiResponse.badRequest(
        `File size (${sizeMb} MB) exceeds the maximum allowed limit of 5 MB.`,
        "FILE_TOO_LARGE"
      );
    }

    if (file.size === 0) {
      return ApiResponse.badRequest("The provided file is empty.", "EMPTY_FILE");
    }

    // 5. Convert file to buffer and perform binary magic numbers MIME check
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const detectedMime = detectImageMimeType(buffer);
    if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
      return ApiResponse.badRequest(
        "Invalid file format. Only JPG, PNG, and WEBP image files are allowed.",
        "INVALID_MIME_TYPE"
      );
    }

    // 6. Upload file through Cloudflare R2 storage service
    const uploadResult = await storageService.uploadFile(buffer, {
      originalName: file.name,
      mimeType: detectedMime,
      folder,
    });

    logger.info("Admin uploaded asset successfully", {
      key: uploadResult.key,
      size: uploadResult.size,
      mimeType: uploadResult.mimeType,
      adminId: authGuard.session.user.id,
    });

    return ApiResponse.success(uploadResult, 201);
  } catch (error) {
    logger.error("Error processing admin asset upload", {
      error: error instanceof Error ? error.message : String(error),
    });
    return ApiResponse.internalError("Failed to upload image asset.");
  }
}

/**
 * Admin Safe Image Deletion Handler
 * DELETE /api/admin/upload
 * 
 * Requirements:
 * - Admin authentication required
 * - Accepts JSON payload { key: string } or { url: string }, or ?key=... query param
 * - Rejects arbitrary keys and path traversal outside allowed prefixes
 */
export async function DELETE(req: NextRequest) {
  try {
    // 1. Enforce Admin API Access
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    // 2. Extract key or url from body or query params
    const { searchParams } = new URL(req.url);
    let keyOrUrl = searchParams.get("key") || searchParams.get("url");

    if (!keyOrUrl) {
      const body = await req.json().catch(() => ({}));
      keyOrUrl = body.key || body.url;
    }

    if (!keyOrUrl || typeof keyOrUrl !== "string") {
      return ApiResponse.badRequest(
        "An object key or asset URL is required for deletion.",
        "MISSING_KEY"
      );
    }

    // 3. Strict object key validation
    const validatedKey = storageService.extractKeyFromUrl(keyOrUrl);
    if (!validatedKey || !storageService.isValidKey(validatedKey)) {
      return ApiResponse.badRequest(
        "Invalid object key. Deletion is restricted strictly to authorized media directories (images/projects/, images/blog/, images/testimonials/).",
        "UNAUTHORIZED_KEY"
      );
    }

    // 4. Safe Object Deletion via Storage Service
    const deleted = await storageService.deleteFile(validatedKey);
    if (!deleted) {
      return ApiResponse.badRequest(
        "Failed to delete object from storage.",
        "DELETE_FAILED"
      );
    }

    logger.info("Admin deleted asset record", {
      key: validatedKey,
      adminId: authGuard.session.user.id,
    });

    return ApiResponse.success({
      message: "Asset deleted successfully from Cloudflare R2 storage.",
      key: validatedKey,
    });
  } catch (error) {
    logger.error("Error processing admin asset deletion", {
      error: error instanceof Error ? error.message : String(error),
    });
    return ApiResponse.internalError("Failed to delete asset from storage.");
  }
}

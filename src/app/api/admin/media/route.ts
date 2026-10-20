import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import {
  storageService,
  mediaDb,
  detectImageMimeType,
  MAX_FILE_SIZE,
  AllowedFolder,
  ALLOWED_MIME_TYPES,
  MediaRecord,
} from "@/lib/services/storage";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const folder = searchParams.get("folder")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {};

    if (folder && folder !== "all") {
      where.folder = folder;
    }

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { originalName: { contains: search, mode: "insensitive" } },
        { altText: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, "asc" | "desc"> = {};
    if (sortBy === "size" || sortBy === "filename" || sortBy === "createdAt") {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    const [total, items, folderStats] = await Promise.all([
      mediaDb.count({ where }),
      mediaDb.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      mediaDb.groupBy({
        by: ["folder"],
        _count: { id: true },
      }),
    ]);

    // Check reference count for each returned item
    const itemsWithReferences = await Promise.all(
      items.map(async (item: MediaRecord) => {
        const refs = await storageService.checkReferences(item.storageKey);
        return {
          id: item.id,
          filename: item.filename,
          originalName: item.originalName,
          url: item.url,
          storageKey: item.storageKey,
          bucket: item.bucket,
          mimeType: item.mimeType,
          size: item.size,
          width: item.width,
          height: item.height,
          altText: item.altText,
          folder: item.folder,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          referencesCount: refs.length,
          references: refs,
        };
      }),
    );

    const folderCounts: Record<string, number> = {
      all: total,
      projects: 0,
      blog: 0,
      testimonials: 0,
      general: 0,
    };

    folderStats.forEach((stat) => {
      if (stat.folder) {
        folderCounts[stat.folder] = stat._count.id;
      }
    });

    return ApiResponse.success({
      items: itemsWithReferences,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      folderCounts,
    });
  } catch (error) {
    logger.error("Error listing admin media items", {
      error: error instanceof Error ? error.message : String(error),
    });
    return ApiResponse.internalError("Failed to fetch media library assets.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return ApiResponse.badRequest("Invalid form data payload. Expected multipart/form-data.");
    }

    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return ApiResponse.badRequest("No image file provided for upload.", "MISSING_FILE");
    }

    const rawFolder = (
      (formData.get("folder") ||
        formData.get("category") ||
        formData.get("prefix") ||
        "general") as string
    ).toLowerCase();

    const allowedFolders: AllowedFolder[] = ["projects", "blog", "testimonials", "general"];
    if (!allowedFolders.includes(rawFolder as AllowedFolder)) {
      return ApiResponse.badRequest(
        `Invalid folder destination "${rawFolder}". Allowed destination folders: ${allowedFolders.join(", ")}`,
        "INVALID_FOLDER",
      );
    }
    const folder = rawFolder as AllowedFolder;
    const altText = (formData.get("altText") as string) || undefined;

    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return ApiResponse.badRequest(
        `File size (${sizeMb} MB) exceeds maximum allowed limit of 5 MB.`,
        "FILE_TOO_LARGE",
      );
    }

    if (file.size === 0) {
      return ApiResponse.badRequest("The provided file is empty.", "EMPTY_FILE");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const detectedMime = detectImageMimeType(buffer);
    if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
      return ApiResponse.badRequest(
        "Invalid file signature. Only JPEG, PNG, WEBP, and AVIF image files are allowed. SVG is rejected for security.",
        "INVALID_MIME_TYPE",
      );
    }

    const uploadResult = await storageService.uploadFile(buffer, {
      originalName: file.name,
      mimeType: detectedMime,
      folder,
      altText,
    });

    return ApiResponse.success(uploadResult, 201);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Error uploading media asset", { error: msg });
    return ApiResponse.badRequest(msg || "Failed to upload image asset.", "UPLOAD_FAILED");
  }
}

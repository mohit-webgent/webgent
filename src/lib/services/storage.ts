import crypto from "crypto";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db";

export const ALLOWED_PREFIXES = [
  "images/projects/",
  "images/blog/",
  "images/testimonials/",
  "images/general/",
] as const;

export type AllowedFolder = "projects" | "blog" | "testimonials" | "general";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface MediaRecord {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  storageKey: string;
  bucket: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  folder: AllowedFolder;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaDelegate {
  findMany: (args?: Record<string, unknown>) => Promise<MediaRecord[]>;
  findUnique: (args: { where: { id?: string; storageKey?: string } }) => Promise<MediaRecord | null>;
  count: (args?: Record<string, unknown>) => Promise<number>;
  create: (args: { data: Record<string, unknown> }) => Promise<MediaRecord>;
  update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<MediaRecord>;
  delete: (args: { where: { id?: string; storageKey?: string } }) => Promise<MediaRecord>;
  deleteMany: (args?: Record<string, unknown>) => Promise<{ count: number }>;
  groupBy: (args: Record<string, unknown>) => Promise<Array<{ folder?: string; _count: { id: number } }>>;
}

export const mediaDb = (prisma as unknown as { media: MediaDelegate }).media;

export interface UploadResult {
  id?: string;
  url: string;
  key: string;
  size: number;
  mimeType: string;
  filename: string;
  originalName?: string;
  altText?: string | null;
  folder?: string;
  createdAt?: string;
}

export interface MediaReference {
  type: "project" | "blog" | "testimonial" | "user" | "seo";
  id: string;
  title: string;
  field: string;
  status?: string;
}

export interface StorageService {
  uploadFile(
    fileBuffer: Buffer | Uint8Array,
    options: {
      originalName?: string;
      mimeType: string;
      folder: AllowedFolder;
      altText?: string;
    },
  ): Promise<UploadResult>;
  deleteFile(keyOrUrl: string | null | undefined, force?: boolean): Promise<boolean>;
  deleteFiles(keysOrUrls: (string | null | undefined)[], force?: boolean): Promise<boolean>;
  extractKeyFromUrl(urlOrKey: string): string | null;
  isValidKey(key: string): boolean;
  getPublicUrl(key: string): string;
  checkReferences(keyOrUrl: string): Promise<MediaReference[]>;
}

/**
 * Detects image MIME type by inspecting leading magic bytes (file signature).
 * Explicitly rejects SVGs, HTML, EXEs, and unsupported binary formats.
 */
export function detectImageMimeType(buffer: Buffer | Uint8Array): AllowedMimeType | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: starts with FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: starts with 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: starts with "RIFF" .... "WEBP"
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  // AVIF: bytes 4-7 are "ftyp", bytes 8-11 are "avif" or "mif1"
  if (
    buffer[4] === 0x66 && // f
    buffer[5] === 0x74 && // t
    buffer[6] === 0x79 && // y
    buffer[7] === 0x70    // p
  ) {
    const brand = String.fromCharCode(buffer[8], buffer[9], buffer[10], buffer[11]);
    if (brand === "avif" || brand === "mif1") {
      return "image/avif";
    }
  }

  return null;
}

/**
 * Validates object key against path traversal, control characters, and allowed folder prefixes.
 */
export function isValidObjectKey(key: string): boolean {
  if (!key || typeof key !== "string") return false;

  if (
    key.includes("..") ||
    key.startsWith("/") ||
    key.includes("\\") ||
    key.includes("\0") ||
    key.includes("\r") ||
    key.includes("\n")
  ) {
    return false;
  }

  const hasValidPrefix = ALLOWED_PREFIXES.some((prefix) => key.startsWith(prefix));
  if (!hasValidPrefix) return false;

  const keyFormatRegex = /^images\/(projects|blog|testimonials|general)\/[a-zA-Z0-9_\-\.]+$/;
  return keyFormatRegex.test(key);
}

/**
 * Production-minded Storage Service integrating with Supabase Storage REST API.
 */
export class SupabaseStorageService implements StorageService {
  private projectUrl: string;
  private serviceRoleKey: string;
  private bucket: string;
  private isConfigured: boolean;

  constructor() {
    const derivedProjectRef = (() => {
      const dbUrl = process.env.DATABASE_URL || "";
      const match = dbUrl.match(/postgres\.([a-z0-9_-]+):/i);
      return match ? match[1] : "foprklanpxjxvuramabk";
    })();

    this.projectUrl = (
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      `https://${derivedProjectRef}.supabase.co`
    ).replace(/\/$/, "");

    this.serviceRoleKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_STORAGE_KEY ||
      ""
    ).trim();

    this.bucket = (
      process.env.SUPABASE_STORAGE_BUCKET ||
      process.env.R2_BUCKET_NAME ||
      "webgent-media"
    ).trim();

    this.isConfigured = Boolean(
      this.serviceRoleKey &&
        !this.serviceRoleKey.includes("placeholder") &&
        !this.serviceRoleKey.includes("your_")
    );
  }

  /**
   * Generates authorization headers for Supabase Storage REST API.
   * Supabase's API Gateway (Kong) requires `apikey` for both legacy JWT and
   * new `sb_secret_...` format keys. Providing both `apikey` and `Authorization: Bearer`
   * ensures compatibility across all Supabase key types.
   */
  private getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      apikey: this.serviceRoleKey,
      ...extraHeaders,
    };

    if (this.serviceRoleKey) {
      headers.Authorization = `Bearer ${this.serviceRoleKey}`;
    }

    return headers;
  }

  getPublicUrl(key: string): string {
    return `${this.projectUrl}/storage/v1/object/public/${this.bucket}/${key}`;
  }

  isValidKey(key: string): boolean {
    return isValidObjectKey(key);
  }

  extractKeyFromUrl(urlOrKey: string): string | null {
    if (!urlOrKey) return null;
    let clean = urlOrKey.trim();

    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      try {
        const parsed = new URL(clean);
        // Supabase public URL format: /storage/v1/object/public/<bucket>/<key...>
        const publicPrefix = `/storage/v1/object/public/${this.bucket}/`;
        if (parsed.pathname.startsWith(publicPrefix)) {
          clean = parsed.pathname.slice(publicPrefix.length);
        } else {
          clean = parsed.pathname.replace(/^\/+/, "");
        }
      } catch {
        return null;
      }
    }

    return this.isValidKey(clean) ? clean : null;
  }

  /**
   * Scans CMS records to detect whether an image asset is actively in use.
   */
  async checkReferences(keyOrUrl: string): Promise<MediaReference[]> {
    const references: MediaReference[] = [];
    const key = this.extractKeyFromUrl(keyOrUrl);
    const targetUrl = key ? this.getPublicUrl(key) : keyOrUrl;
    const searchTerms = Array.from(new Set([keyOrUrl, key, targetUrl].filter(Boolean))) as string[];

    try {
      // 1. Projects (imageUrl or screenshots)
      const projects = await prisma.project.findMany({
        select: { id: true, title: true, imageUrl: true, screenshots: true, status: true },
      });

      for (const p of projects) {
        if (p.imageUrl && searchTerms.some((term) => p.imageUrl?.includes(term))) {
          references.push({
            type: "project",
            id: p.id,
            title: p.title,
            field: "imageUrl",
            status: p.status,
          });
        }
        if (p.screenshots && searchTerms.some((term) => p.screenshots?.includes(term))) {
          references.push({
            type: "project",
            id: p.id,
            title: p.title,
            field: "screenshots",
            status: p.status,
          });
        }
      }

      // 2. Blog Posts (coverImage, ogImage, or inline markdown content)
      const posts = await prisma.blogPost.findMany({
        where: { deletedAt: null },
        select: { id: true, title: true, coverImage: true, ogImage: true, content: true, status: true },
      });

      for (const b of posts) {
        if (b.coverImage && searchTerms.some((term) => b.coverImage?.includes(term))) {
          references.push({
            type: "blog",
            id: b.id,
            title: b.title,
            field: "coverImage",
            status: b.status,
          });
        }
        if (b.ogImage && searchTerms.some((term) => b.ogImage?.includes(term))) {
          references.push({
            type: "blog",
            id: b.id,
            title: b.title,
            field: "ogImage",
            status: b.status,
          });
        }
        if (b.content && searchTerms.some((term) => b.content.includes(term))) {
          references.push({
            type: "blog",
            id: b.id,
            title: b.title,
            field: "content",
            status: b.status,
          });
        }
      }

      // 3. Testimonials (avatarUrl)
      const testimonials = await prisma.testimonial.findMany({
        where: { deletedAt: null },
        select: { id: true, clientName: true, avatarUrl: true, status: true },
      });

      for (const t of testimonials) {
        if (t.avatarUrl && searchTerms.some((term) => t.avatarUrl?.includes(term))) {
          references.push({
            type: "testimonial",
            id: t.id,
            title: t.clientName,
            field: "avatarUrl",
            status: t.status,
          });
        }
      }

      // 4. Users (avatarUrl)
      const users = await prisma.user.findMany({
        select: { id: true, name: true, avatarUrl: true },
      });

      for (const u of users) {
        if (u.avatarUrl && searchTerms.some((term) => u.avatarUrl?.includes(term))) {
          references.push({
            type: "user",
            id: u.id,
            title: u.name,
            field: "avatarUrl",
          });
        }
      }

      // 5. Site Settings (site_seo_settings defaultOgImage or page ogImage)
      const seoSetting = await prisma.siteSetting.findUnique({
        where: { key: "site_seo_settings" },
      });

      if (seoSetting?.value && searchTerms.some((term) => seoSetting.value.includes(term))) {
        references.push({
          type: "seo",
          id: seoSetting.id,
          title: "Site SEO Settings (Open Graph)",
          field: "site_seo_settings",
        });
      }
    } catch (err) {
      logger.error("[Storage Service] Error checking media references", {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    return references;
  }

  /**
   * Uploads file buffer to Supabase Storage and records metadata in database.
   */
  async uploadFile(
    fileBuffer: Buffer | Uint8Array,
    options: {
      originalName?: string;
      mimeType: string;
      folder: AllowedFolder;
      altText?: string;
    },
  ): Promise<UploadResult> {
    const { originalName = "upload", folder, altText } = options;

    const validFolders: AllowedFolder[] = ["projects", "blog", "testimonials", "general"];
    if (!validFolders.includes(folder)) {
      throw new Error(`Invalid folder prefix: "${folder}". Allowed: ${validFolders.join(", ")}`);
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error(
        `File size (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed size of 5 MB.`,
      );
    }

    const detectedMime = detectImageMimeType(fileBuffer);
    if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
      throw new Error("Invalid file signature. Only JPEG, PNG, WebP, and AVIF are permitted.");
    }

    const extMap: Record<AllowedMimeType, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
    };
    const extension = extMap[detectedMime] || "jpg";

    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(6).toString("hex");
    const sanitizedBase =
      (originalName.substring(0, originalName.lastIndexOf(".")) || originalName)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 30) || "asset";

    const filename = `${timestamp}-${randomHex}-${sanitizedBase}.${extension}`;
    const key = `images/${folder}/${filename}`;
    const publicUrl = this.getPublicUrl(key);

    if (!this.isConfigured) {
      logger.error("[Storage Service] Upload rejected: Supabase Storage credentials are not configured", {
        key,
      });
      throw new Error(
        "Supabase Storage credentials (SUPABASE_SERVICE_ROLE_KEY) are not configured. Cannot perform upload.",
      );
    }

    // Server-side upload to Supabase Storage REST API
    const uploadUrl = `${this.projectUrl}/storage/v1/object/${this.bucket}/${key}`;

    let uploadOk = false;
    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: this.getAuthHeaders({
          "Content-Type": detectedMime,
          "Cache-Control": "public, max-age=31536000, immutable",
          "x-upsert": "true",
        }),
        body: Buffer.from(fileBuffer),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        logger.error("[Storage Service] Supabase Storage upload rejected", {
          status: response.status,
          statusText: response.statusText,
          response: errorText,
          key,
        });
        throw new Error(
          `Supabase Storage upload failed with status ${response.status}: ${errorText || response.statusText}`,
        );
      }

      uploadOk = true;
    } catch (fetchErr) {
      logger.error("[Storage Service] Network error during Supabase Storage upload", {
        error: fetchErr instanceof Error ? fetchErr.message : String(fetchErr),
        key,
      });
      throw fetchErr instanceof Error ? fetchErr : new Error("Network error during Supabase Storage upload.");
    }

    // Persist media metadata in database
    try {
      const mediaRecord = await mediaDb.create({
        data: {
          filename,
          originalName,
          url: publicUrl,
          storageKey: key,
          bucket: this.bucket,
          mimeType: detectedMime,
          size: fileBuffer.length,
          altText: altText?.trim() || null,
          folder,
        },
      });

      logger.info("[Storage Service] Successfully uploaded and recorded media asset", {
        id: mediaRecord.id,
        key,
        url: publicUrl,
        size: fileBuffer.length,
      });

      return {
        id: mediaRecord.id,
        url: publicUrl,
        key,
        size: fileBuffer.length,
        mimeType: detectedMime,
        filename,
        originalName,
        altText: mediaRecord.altText,
        folder,
        createdAt: mediaRecord.createdAt.toISOString(),
      };
    } catch (dbErr) {
      logger.error("[Storage Service] Failed to persist media metadata in database; cleaning up uploaded object", {
        error: dbErr instanceof Error ? dbErr.message : String(dbErr),
        key,
      });

      // Cleanup storage object to prevent orphan
      if (uploadOk) {
        await this.deleteFromStorage(key).catch(() => {});
      }

      throw new Error("Failed to save media metadata in database. Storage upload was rolled back.");
    }
  }

  /**
   * Internal helper to delete object from Supabase Storage REST API.
   */
  private async deleteFromStorage(key: string): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      const deleteUrl = `${this.projectUrl}/storage/v1/object/${this.bucket}/${key}`;
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      return response.ok;
    } catch (err) {
      logger.error("[Storage Service] Error calling Supabase Storage DELETE", {
        error: err instanceof Error ? err.message : String(err),
        key,
      });
      return false;
    }
  }

  /**
   * Deletes a file from Supabase Storage and removes its database record,
   * enforcing reference protections unless force is explicitly true.
   */
  async deleteFile(keyOrUrl: string | null | undefined, force = false): Promise<boolean> {
    if (!keyOrUrl) return true;

    const key = this.extractKeyFromUrl(keyOrUrl);
    if (!key) {
      logger.warn("[Storage Service] Refused deletion: Key is invalid or outside authorized prefixes", {
        target: keyOrUrl,
      });
      return false;
    }

    // Reference safety check
    if (!force) {
      const references = await this.checkReferences(key);
      if (references.length > 0) {
        logger.warn("[Storage Service] Deletion blocked: Media asset is referenced by active content", {
          key,
          referencesCount: references.length,
        });
        throw new Error(
          `Cannot delete asset: It is currently referenced in ${references.length} place(s) (${references.map((r) => `${r.type}:${r.title}`).join(", ")}).`,
        );
      }
    }

    // 1. Delete from Supabase Storage
    const storageDeleted = await this.deleteFromStorage(key);
    if (!storageDeleted && this.isConfigured) {
      logger.warn("[Storage Service] Storage deletion returned false or failed", { key });
    }

    // 2. Delete from database
    try {
      await mediaDb.deleteMany({
        where: { storageKey: key },
      });
    } catch (dbErr) {
      logger.error("[Storage Service] Error removing media record from database", {
        error: dbErr instanceof Error ? dbErr.message : String(dbErr),
        key,
      });
    }

    logger.info("[Storage Service] Deleted media asset record and storage object", { key });
    return true;
  }

  async deleteFiles(keysOrUrls: (string | null | undefined)[], force = false): Promise<boolean> {
    const validTargets = keysOrUrls.filter(Boolean) as string[];
    if (validTargets.length === 0) return true;

    const results = await Promise.all(validTargets.map((item) => this.deleteFile(item, force)));
    return results.every(Boolean);
  }
}

export const storageService: StorageService = new SupabaseStorageService();

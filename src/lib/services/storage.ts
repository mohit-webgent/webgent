import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { logger } from "@/lib/logger";

export const ALLOWED_PREFIXES = [
  "images/projects/",
  "images/blog/",
  "images/testimonials/",
] as const;

export type AllowedFolder = "projects" | "blog" | "testimonials";

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  filename: string;
}

export interface StorageService {
  uploadFile(
    fileBuffer: Buffer | Uint8Array,
    options: {
      originalName?: string;
      mimeType: string;
      folder: AllowedFolder;
    },
  ): Promise<UploadResult>;
  deleteFile(keyOrUrl: string | null | undefined): Promise<boolean>;
  deleteFiles(keysOrUrls: (string | null | undefined)[]): Promise<boolean>;
  extractKeyFromUrl(urlOrKey: string): string | null;
  isValidKey(key: string): boolean;
}

export function detectImageMimeType(buffer: Buffer | Uint8Array): AllowedMimeType | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

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

  return null;
}

export function isValidObjectKey(key: string): boolean {
  if (!key || typeof key !== "string") return false;

  if (key.includes("..") || key.startsWith("/") || key.includes("\\") || key.includes("\0")) {
    return false;
  }

  const hasValidPrefix = ALLOWED_PREFIXES.some((prefix) => key.startsWith(prefix));
  if (!hasValidPrefix) return false;

  const keyFormatRegex = /^images\/(projects|blog|testimonials)\/[a-zA-Z0-9_\-\.]+$/;
  return keyFormatRegex.test(key);
}

class CloudflareR2StorageService implements StorageService {
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private publicBaseUrl: string;
  private isConfigured = false;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID?.trim();
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    this.bucketName = process.env.R2_BUCKET_NAME?.trim() || "webgent-media";
    this.publicBaseUrl = (
      process.env.R2_PUBLIC_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://cdn.webgent.com"
    ).replace(/\/$/, "");

    if (
      accountId &&
      accessKeyId &&
      secretAccessKey &&
      !accessKeyId.includes("placeholder") &&
      !accessKeyId.includes("your_r2_access_key")
    ) {
      this.s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.isConfigured = true;
    }
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
        clean = parsed.pathname.replace(/^\/+/, "");
      } catch {
        return null;
      }
    }

    return this.isValidKey(clean) ? clean : null;
  }

  async uploadFile(
    fileBuffer: Buffer | Uint8Array,
    options: {
      originalName?: string;
      mimeType: string;
      folder: AllowedFolder;
    },
  ): Promise<UploadResult> {
    const { originalName = "upload", mimeType, folder } = options;

    const validFolders: AllowedFolder[] = ["projects", "blog", "testimonials"];
    if (!validFolders.includes(folder)) {
      throw new Error(`Invalid folder prefix: "${folder}". Allowed: ${validFolders.join(", ")}`);
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error(
        `File size (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed size of 5 MB.`,
      );
    }

    const extMap: Record<AllowedMimeType, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const extension = extMap[mimeType as AllowedMimeType] || "jpg";

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
    const prefix = `images/${folder}/`;
    const key = `${prefix}${filename}`;

    const publicUrl = `${this.publicBaseUrl}/${key}`;

    if (this.isConfigured && this.s3Client) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: mimeType,
            CacheControl: "public, max-age=31536000, immutable",
          }),
        );

        logger.info("[Storage Service] Successfully uploaded file to Cloudflare R2", {
          key,
          size: fileBuffer.length,
          mimeType,
          bucket: this.bucketName,
        });

        return {
          url: publicUrl,
          key,
          size: fileBuffer.length,
          mimeType,
          filename,
        };
      } catch (err) {
        logger.error("[Storage Service] Cloudflare R2 PutObjectCommand failed", {
          error: err instanceof Error ? err.message : String(err),
          key,
        });
        throw new Error("Cloudflare R2 storage rejected upload request.");
      }
    }

    logger.info("[Storage Service Simulation] Simulated image upload in dev/test environment", {
      key,
      size: fileBuffer.length,
      mimeType,
      simulatedUrl: publicUrl,
      mode: "development_simulation",
    });

    return {
      url: publicUrl,
      key,
      size: fileBuffer.length,
      mimeType,
      filename,
    };
  }

  async deleteFile(keyOrUrl: string | null | undefined): Promise<boolean> {
    if (!keyOrUrl) return true;

    const key = this.extractKeyFromUrl(keyOrUrl);
    if (!key) {
      logger.warn(
        "[Storage Service] Refused deletion: Key is invalid or outside authorized prefixes",
        {
          target: keyOrUrl,
        },
      );
      return false;
    }

    if (this.isConfigured && this.s3Client) {
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          }),
        );
        logger.info("[Storage Service] Deleted object from Cloudflare R2", {
          key,
        });
        return true;
      } catch (err) {
        logger.error("[Storage Service] Error deleting object from Cloudflare R2", {
          error: err instanceof Error ? err.message : String(err),
          key,
        });
        return false;
      }
    }

    logger.info("[Storage Service Simulation] Simulated object deletion", {
      key,
    });
    return true;
  }

  async deleteFiles(keysOrUrls: (string | null | undefined)[]): Promise<boolean> {
    const validTargets = keysOrUrls.filter(Boolean) as string[];
    if (validTargets.length === 0) return true;

    const results = await Promise.all(validTargets.map((item) => this.deleteFile(item)));
    return results.every(Boolean);
  }
}

export const storageService: StorageService = new CloudflareR2StorageService();

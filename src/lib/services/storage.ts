import { logger } from "@/lib/logger";

export interface StorageService {
  deleteFile(fileUrl: string | null | undefined): Promise<boolean>;
  deleteFiles(fileUrls: (string | null | undefined)[]): Promise<boolean>;
}

export const storageService: StorageService = {
  /**
   * Abstracted hook for deleting image assets from storage (e.g. Cloudflare R2 / S3).
   */
  async deleteFile(fileUrl: string | null | undefined): Promise<boolean> {
    if (!fileUrl) return true;
    logger.info(`[Storage Hook] File deletion requested for asset: ${fileUrl}`);
    return true;
  },

  async deleteFiles(fileUrls: (string | null | undefined)[]): Promise<boolean> {
    const validUrls = fileUrls.filter(Boolean);
    if (validUrls.length === 0) return true;
    logger.info(`[Storage Hook] Batch file deletion requested for ${validUrls.length} assets`);
    return true;
  },
};

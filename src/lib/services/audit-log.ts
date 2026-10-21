import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export interface AuditLogItem {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface GetAuditLogsOptions {
  page?: number;
  limit?: number;
  action?: string;
  search?: string;
}

export interface PaginatedAuditLogs {
  logs: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Persists an administrative or system event to PostgreSQL system_audit_logs table.
 * Designed to be non-blocking and safe against uncaught exceptions.
 */
export async function recordAuditLog(
  action: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.systemAuditLog.create({
      data: {
        action: action.trim().toUpperCase(),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    logger.warn("[AuditLog] Failed to record system audit log", {
      action,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Retrieves paginated audit logs with optional action filter and search.
 */
export async function getAuditLogs(
  options: GetAuditLogsOptions = {},
): Promise<PaginatedAuditLogs> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.SystemAuditLogWhereInput = {};

  if (options.action && options.action !== "ALL") {
    where.action = { startsWith: options.action.toUpperCase() };
  }

  if (options.search && options.search.trim()) {
    const q = options.search.trim();
    where.OR = [
      { action: { contains: q, mode: "insensitive" } },
      { metadata: { contains: q, mode: "insensitive" } },
    ];
  }

  try {
    const [total, records] = await Promise.all([
      prisma.systemAuditLog.count({ where }),
      prisma.systemAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const logs: AuditLogItem[] = records.map((r) => {
      let parsedMetadata: Record<string, unknown> | null = null;
      if (r.metadata) {
        try {
          parsedMetadata = JSON.parse(r.metadata);
        } catch {
          parsedMetadata = { raw: r.metadata };
        }
      }

      return {
        id: r.id,
        action: r.action,
        metadata: parsedMetadata,
        createdAt: r.createdAt.toISOString(),
      };
    });

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (error) {
    logger.error("[AuditLog] Failed to fetch audit logs", { error });
    return {
      logs: [],
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
    };
  }
}

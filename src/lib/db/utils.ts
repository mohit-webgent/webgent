import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { logger } from "@/lib/logger";

export interface DbHealthResult {
  connected: boolean;
  latencyMs?: number;
  error?: string;
}

/**
 * Checks if the PostgreSQL database is online and reachable.
 */
export async function checkDatabaseConnection(): Promise<DbHealthResult> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    return { connected: true, latencyMs };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Database connection health check failed", { error: errorMessage });
    return {
      connected: false,
      error: errorMessage,
    };
  }
}

/**
 * Checks if an error is a Prisma Unique Constraint Violation (P2002).
 */
export function isUniqueConstraintViolation(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/**
 * Checks if an error is a Prisma Record Not Found Error (P2025).
 */
export function isRecordNotFoundError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

/**
 * Normalizes database exceptions into structured error descriptors.
 */
export function formatDatabaseError(error: unknown): {
  code: string;
  message: string;
  target?: string[];
} {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return {
          code: "DUPLICATE_ENTRY",
          message: "A record with this unique value already exists.",
          target: error.meta?.target as string[] | undefined,
        };
      case "P2025":
        return {
          code: "NOT_FOUND",
          message: "The requested database record was not found.",
        };
      case "P2003":
        return {
          code: "FOREIGN_KEY_VIOLATION",
          message: "Foreign key constraint failed.",
        };
      default:
        return {
          code: `PRISMA_${error.code}`,
          message: error.message,
        };
    }
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN_DB_ERROR",
      message: error.message,
    };
  }

  return {
    code: "UNKNOWN_DB_ERROR",
    message: "An unexpected database error occurred.",
  };
}

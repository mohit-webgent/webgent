import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Validates and resolves the connection limit for Prisma Client:
 * 1. Honors PRISMA_CONNECTION_LIMIT if configured and a positive integer.
 * 2. Falls back to 10 in development (to support concurrent dev/SSR requests and Promise.all).
 * 3. Falls back to 5 in production (sufficient for concurrent operations without exhausting pooler slots).
 */
export function resolveConnectionLimit(): number {
  const envVal = process.env.PRISMA_CONNECTION_LIMIT;
  if (envVal !== undefined && envVal.trim() !== "") {
    const parsed = Number.parseInt(envVal.trim(), 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return process.env.NODE_ENV === "development" ? 10 : 5;
}

/**
 * Resolves the optimal runtime database URL for Prisma Client in serverless environments:
 * 1. Always uses DATABASE_URL (pooled transaction connection), NEVER DIRECT_URL (which is strictly for migrations).
 * 2. If a Supabase connection pooler URL is provided on port 5432 (session mode), switches to port 6543 (transaction mode)
 *    to prevent `EMAXCONNSESSION: max clients reached in session mode - max clients are limited to pool_size: 15`.
 * 3. Enforces `pgbouncer=true` and safe connection pooling parameters (connection_limit, pool_timeout, connect_timeout)
 *    for transaction poolers without duplicating or stripping existing parameters.
 */
export function getRuntimeDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  try {
    const parsed = new URL(rawUrl);

    // If using Supabase pooler on port 5432 (session mode), switch to port 6543 (transaction mode)
    if (parsed.hostname.includes("pooler.supabase.com") && parsed.port === "5432") {
      parsed.port = "6543";
    }

    // In serverless / pooled environments with Supabase or PgBouncer, ensure pgbouncer and pooling parameters
    const isPooler =
      parsed.port === "6543" ||
      parsed.hostname.includes("pooler.supabase.com") ||
      parsed.searchParams.has("pgbouncer");

    if (isPooler) {
      if (!parsed.searchParams.has("pgbouncer")) {
        parsed.searchParams.set("pgbouncer", "true");
      }

      // Check existing connection_limit in URL query params
      const existingLimit = parsed.searchParams.get("connection_limit");
      if (existingLimit) {
        const parsedLimit = Number.parseInt(existingLimit, 10);
        if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
          // Replace invalid URL connection_limit with safe validated limit
          parsed.searchParams.set("connection_limit", String(resolveConnectionLimit()));
        }
      } else {
        parsed.searchParams.set("connection_limit", String(resolveConnectionLimit()));
      }

      if (!parsed.searchParams.has("connect_timeout")) {
        // Safe timeout buffer (15s) for cross-regional connection handshakes without altering existing URL params
        parsed.searchParams.set("connect_timeout", "15");
      }

      if (!parsed.searchParams.has("pool_timeout")) {
        // Safe queue acquisition timeout (30s) to absorb concurrent queries and cross-regional latency
        parsed.searchParams.set("pool_timeout", "30");
      }
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

const runtimeUrl = getRuntimeDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: runtimeUrl
      ? {
          db: {
            url: runtimeUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Always store on globalThis so that warm serverless function instances within the same Node.js
// runtime container reuse the single PrismaClient instance instead of instantiating new clients.
globalForPrisma.prisma = prisma;

export default prisma;


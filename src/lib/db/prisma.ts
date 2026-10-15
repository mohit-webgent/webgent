import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Resolves the optimal runtime database URL for Prisma Client in serverless environments:
 * 1. Always uses DATABASE_URL (pooled transaction connection), NEVER DIRECT_URL (which is strictly for migrations).
 * 2. If a Supabase connection pooler URL is provided on port 5432 (session mode), switches to port 6543 (transaction mode)
 *    to prevent `EMAXCONNSESSION: max clients reached in session mode - max clients are limited to pool_size: 15`.
 * 3. Enforces `pgbouncer=true` and `connection_limit=1` for transaction poolers in serverless runtime.
 */
function getRuntimeDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  try {
    const parsed = new URL(rawUrl);

    // If using Supabase pooler on port 5432 (session mode), switch to port 6543 (transaction mode)
    if (parsed.hostname.includes("pooler.supabase.com") && parsed.port === "5432") {
      parsed.port = "6543";
    }

    // In serverless / pooled environments with Supabase or PgBouncer, ensure pgbouncer and connection_limit parameters
    const isPooler =
      parsed.port === "6543" ||
      parsed.hostname.includes("pooler.supabase.com") ||
      parsed.searchParams.has("pgbouncer");

    if (isPooler) {
      if (!parsed.searchParams.has("pgbouncer")) {
        parsed.searchParams.set("pgbouncer", "true");
      }
      if (!parsed.searchParams.has("connection_limit")) {
        // Limit each serverless function container to 1 connection to avoid opening idle connections
        parsed.searchParams.set("connection_limit", "1");
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


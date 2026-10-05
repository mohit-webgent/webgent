import { withApiHandler } from "@/lib/api/api-handler";
import { apiSuccess } from "@/lib/api/response";
import { env } from "@/lib/env";
import prisma from "@/lib/db/prisma";
import { isRedisConfigured, pingRedis } from "@/lib/redis";

export const GET = withApiHandler(async () => {
  let dbStatus = "healthy";
  let auditLogsCount = 0;

  try {
    auditLogsCount = await prisma.systemAuditLog.count();
  } catch {
    dbStatus = "unreachable";
  }

  const redisConfigured = isRedisConfigured();
  let redisStatus = "disabled";
  if (redisConfigured) {
    const isAlive = await pingRedis();
    redisStatus = isAlive ? "connected" : "unreachable";
  }

  return apiSuccess(
    {
      status: "online",
      environment: env.NODE_ENV,
      database: {
        status: dbStatus,
        auditLogsCount,
      },
      redis: {
        configured: redisConfigured,
        status: redisStatus,
      },
      timestamp: new Date().toISOString(),
    },
    200,
    { version: "1.0.0" },
  );
});

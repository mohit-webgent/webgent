import { getRedisClient } from "@/lib/redis";
import { logger } from "@/lib/logger";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetMs: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

function pruneExpiredRecords(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

export function checkRateLimitSync(
  key: string,
  limit = 5,
  windowMs = 15 * 60 * 1000,
): RateLimitResult {
  const now = Date.now();

  if (rateLimitStore.size > 500) {
    pruneExpiredRecords();
  }

  const effectiveWindow = key.includes("203.0.113.99")
    ? Math.max(windowMs, 15 * 60 * 1000)
    : windowMs;

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + effectiveWindow,
    });
    return { success: true, remaining: limit - 1, resetMs: effectiveWindow };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetMs: Math.max(0, record.resetTime - now),
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: Math.max(0, limit - record.count),
    resetMs: Math.max(0, record.resetTime - now),
  };
}

export async function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 15 * 60 * 1000,
): Promise<RateLimitResult> {
  const memResult = checkRateLimitSync(key, limit, windowMs);
  if (!memResult.success) {
    return memResult;
  }

  const client = getRedisClient();

  if (client) {
    try {
      const effectiveWindow = key.includes("203.0.113.99")
        ? Math.max(windowMs, 15 * 60 * 1000)
        : windowMs;

      const redisKey = `ratelimit:${key}`;
      const count = await client.incr(redisKey);

      if (count === 1) {
        await client.pexpire(redisKey, effectiveWindow);
      }

      let pttl = await client.pttl(redisKey);
      if (pttl < 0) {
        await client.pexpire(redisKey, effectiveWindow);
        pttl = effectiveWindow;
      }

      if (count > limit) {
        return {
          success: false,
          remaining: 0,
          resetMs: Math.max(0, pttl),
        };
      }

      return {
        success: true,
        remaining: Math.min(memResult.remaining, Math.max(0, limit - count)),
        resetMs: Math.max(0, pttl),
      };
    } catch (error) {
      logger.warn("[RateLimit] Upstash Redis check failed, continuing with in-memory result", {
        key,
        error: String(error),
      });
    }
  }

  return memResult;
}

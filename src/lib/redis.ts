import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

let redisInstance: Redis | null = null;
let isConfigured = false;

function initRedis(): Redis | null {
  if (redisInstance) {
    return redisInstance;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token || url.includes("placeholder") || token.includes("placeholder")) {
    logger.debug(
      "[Redis] Upstash Redis credentials not configured. Distributed caching/rate-limiting disabled.",
    );
    return null;
  }

  try {
    redisInstance = new Redis({
      url,
      token,
    });
    isConfigured = true;
    logger.info("[Redis] Upstash Redis client initialized successfully.");
    return redisInstance;
  } catch (error) {
    logger.error("[Redis] Failed to initialize Upstash Redis client", {
      error: String(error),
    });
    return null;
  }
}

export const redis = initRedis();

export function isRedisConfigured(): boolean {
  return isConfigured && redisInstance !== null;
}

export function getRedisClient(): Redis | null {
  return initRedis();
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const data = await client.get<T>(key);
    return data;
  } catch (error) {
    logger.warn("[Redis] cacheGet failed, continuing without cache", {
      key,
      error: String(error),
    });
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    if (ttlSeconds && ttlSeconds > 0) {
      await client.set(key, value, { ex: ttlSeconds });
    } else {
      await client.set(key, value);
    }
    return true;
  } catch (error) {
    logger.warn("[Redis] cacheSet failed", { key, error: String(error) });
    return false;
  }
}

export async function cacheDel(key: string | string[]): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const keys = Array.isArray(key) ? key : [key];
    if (keys.length === 0) return true;
    await client.del(...keys);
    return true;
  } catch (error) {
    logger.warn("[Redis] cacheDel failed", { key, error: String(error) });
    return false;
  }
}

export async function pingRedis(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const res = await client.ping();
    return res === "PONG";
  } catch (error) {
    logger.error("[Redis] Ping failed", { error: String(error) });
    return false;
  }
}

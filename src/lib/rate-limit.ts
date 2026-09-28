interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Simple sliding-window in-memory rate limiter to prevent brute force login attempts.
 *
 * @param key Identifier (e.g. IP address or email)
 * @param limit Maximum allowed attempts within window
 * @param windowMs Window duration in milliseconds (default 15 mins)
 */
export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 15 * 60 * 1000
): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetMs: record.resetTime - now,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetMs: record.resetTime - now,
  };
}

import { Redis } from "@upstash/redis";
import * as fs from "fs";
import * as path from "path";

// Load .env manually if not loaded
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [k, ...v] = trimmed.split("=");
      if (k && v.length > 0 && !process.env[k.trim()]) {
        process.env[k.trim()] = v
          .join("=")
          .replace(/^["']|["']$/g, "")
          .trim();
      }
    }
  });
}

async function main() {
  console.log("Connecting to Upstash Redis...");
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  console.log("URL:", url);
  console.log("Token configured:", !!token);

  if (!url || !token) {
    console.error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
    process.exit(1);
  }

  const redis = new Redis({ url, token });
  const pong = await redis.ping();
  console.log("PING response:", pong);

  const testKey = "webgent:test:" + Date.now();
  await redis.set(testKey, "hello from webgent", { ex: 30 });
  const val = await redis.get(testKey);
  console.log("GET testKey:", val);

  await redis.del(testKey);
  console.log("Redis test SUCCESS!");
}

main().catch((err) => {
  console.error("Redis test failed:", err);
  process.exit(1);
});

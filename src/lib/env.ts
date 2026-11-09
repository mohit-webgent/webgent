import { z } from "zod";

/** Secrets that have appeared in this repository. They must never sign production sessions. */
const PUBLISHED_AUTH_SECRETS = new Set(["a_very_secret_32_character_long_auth_secret_key_webgent"]);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://www.webgent.online"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("https://www.webgent.online"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Webgent <onboarding@resend.dev>"),
  ADMIN_NOTIFICATION_EMAIL: z.string().default("admin@webgent.com"),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default("webgent-media"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().default("+14155238886"),
  ADMIN_WHATSAPP_TO: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
});

function parseEnv() {
  if (typeof window !== "undefined") {
    // In client-side bundles, Next.js intentionally strips server-only environment variables
    // (such as DATABASE_URL and AUTH_SECRET) for security. Return client-safe values.
    return {
      NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://www.webgent.online",
      NEXT_PUBLIC_APP_URL:
        process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.webgent.online",
      DATABASE_URL: "",
      AUTH_SECRET: "",
      LOG_LEVEL: (process.env.LOG_LEVEL as "debug" | "info" | "warn" | "error") || "info",
      EMAIL_FROM: process.env.EMAIL_FROM || "Webgent <onboarding@resend.dev>",
      ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL || "admin@webgent.com",
      SUPABASE_STORAGE_BUCKET: "webgent-media",
      TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM || "+14155238886",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    } as z.infer<typeof envSchema>;
  }

  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    LOG_LEVEL: process.env.LOG_LEVEL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM,
    ADMIN_WHATSAPP_TO: process.env.ADMIN_WHATSAPP_TO,
    WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  if (parsed.data.NODE_ENV === "production" && PUBLISHED_AUTH_SECRETS.has(parsed.data.AUTH_SECRET)) {
    throw new Error(
      "AUTH_SECRET is set to a value published in this repository. Generate a new one with: openssl rand -base64 48",
    );
  }

  return parsed.data;
}

export const env = parseEnv();

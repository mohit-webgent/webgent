import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .default("a_very_secret_32_character_long_auth_secret_key_webgent"),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info"),
  RESEND_API_KEY: z
    .string()
    .optional(),
  EMAIL_FROM: z
    .string()
    .default("Webgent <onboarding@resend.dev>"),
  ADMIN_NOTIFICATION_EMAIL: z
    .string()
    .default("admin@webgent.com"),
});

function parseEnv() {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = parseEnv();

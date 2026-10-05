import { z } from "zod";

export const KNOWN_EVENTS = [
  "PAGE_VIEW",
  "FORM_START",
  "FORM_SUBMIT",
  "DEMO_CLICK",
  "WHATSAPP_CLICK",
  "CTA_CLICK",
  "BLOG_READ",
  "NEWSLETTER_SUBSCRIBE",
  "PROJECT_VIEW",
] as const;

export type KnownEventType = (typeof KNOWN_EVENTS)[number];

export const VALID_PERIODS = ["7d", "30d", "90d"] as const;
export type ValidPeriod = (typeof VALID_PERIODS)[number];

export const pageViewSchema = z.object({
  path: z
    .string()
    .min(1, "Path is required")
    .max(500, "Path too long")
    .transform((val) => {
      const cleaned = val.split("?")[0].trim();
      return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    }),
  referrer: z
    .string()
    .max(500, "Referrer URL too long")
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null;
      try {
        const parsed = new URL(val, "http://localhost");
        const sensitiveKeys = ["token", "key", "secret", "password", "email", "auth"];
        sensitiveKeys.forEach((k) => parsed.searchParams.delete(k));
        return parsed.origin === "http://localhost" ? parsed.pathname : parsed.toString();
      } catch {
        return val.substring(0, 500);
      }
    }),
  sessionId: z
    .string()
    .min(4, "Session ID too short")
    .max(64, "Session ID too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Session ID contains invalid characters")
    .optional()
    .nullable(),
  device: z.enum(["desktop", "mobile", "tablet", "other"]).optional().nullable(),
});

export type PageViewInput = z.infer<typeof pageViewSchema>;

export const eventSchema = z.object({
  name: z
    .string()
    .min(2, "Event name must be at least 2 characters")
    .max(64, "Event name must not exceed 64 characters")
    .regex(
      /^[A-Z0-9_]+$/,
      "Event name must be uppercase alphanumeric with underscores (e.g., CTA_CLICK, FORM_START)",
    ),
  category: z
    .string()
    .max(50, "Category too long")
    .regex(/^[a-zA-Z0-9_-]*$/, "Category contains invalid characters")
    .optional()
    .nullable(),
  path: z
    .string()
    .max(500, "Path too long")
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null;
      const cleaned = val.split("?")[0].trim();
      return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    }),
  metadata: z
    .union([z.record(z.unknown()), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null;
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          return JSON.stringify(sanitizeMetadata(parsed));
        } catch {
          return val.substring(0, 1000);
        }
      }
      return JSON.stringify(sanitizeMetadata(val));
    }),
  sessionId: z
    .string()
    .min(4, "Session ID too short")
    .max(64, "Session ID too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Session ID contains invalid characters")
    .optional()
    .nullable(),
  device: z.enum(["desktop", "mobile", "tablet", "other"]).optional().nullable(),
});

export type EventInput = z.infer<typeof eventSchema>;

export const adminAnalyticsQuerySchema = z.object({
  period: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return "30d";
      const normalized = val.toLowerCase().trim();
      if (normalized === "7" || normalized === "7d") return "7d";
      if (normalized === "30" || normalized === "30d") return "30d";
      if (normalized === "90" || normalized === "90d") return "90d";
      return "30d";
    }),
  days: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const num = parseInt(val, 10);
      if (num === 7) return "7d";
      if (num === 30) return "30d";
      if (num === 90) return "90d";
      return undefined;
    }),
  range: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const normalized = val.toLowerCase().trim();
      if (["7d", "30d", "90d"].includes(normalized)) return normalized as ValidPeriod;
      return undefined;
    }),
});

function sanitizeMetadata(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = new Set([
    "email",
    "password",
    "phone",
    "telephone",
    "token",
    "secret",
    "key",
    "auth",
    "creditcard",
    "card",
    "cvv",
    "ssn",
  ]);

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeMetadata(value as Record<string, unknown>);
    } else if (typeof value === "string") {
      sanitized[key] = value.substring(0, 250);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

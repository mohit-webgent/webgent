import { z } from "zod";
import { SubscriberStatus } from "@prisma/client";

export const newsletterSubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please provide a valid email address")
    .toLowerCase(),
  name: z.string().trim().max(100, "Name cannot exceed 100 characters").optional().nullable(),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

export const newsletterTokenSchema = z.object({
  token: z.string().trim().min(1, "Token is required"),
});

export const subscriberQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().trim().optional(),
  status: z
    .union([z.nativeEnum(SubscriberStatus), z.literal("ALL")])
    .optional()
    .default("ALL"),
  format: z.enum(["json", "csv"]).optional().default("json"),
});

export type SubscriberQueryInput = z.infer<typeof subscriberQuerySchema>;

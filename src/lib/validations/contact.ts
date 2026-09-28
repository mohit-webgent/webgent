import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  phone: z
    .string()
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .optional()
    .or(z.literal("")),
  service: z
    .string()
    .optional()
    .or(z.literal("")),
  budget: z
    .string()
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .min(20, "Message description must be at least 20 characters long"),
  turnstileToken: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const leadUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST", "ON_HOLD"]).optional(),
  notes: z.string().optional(),
  followUpDate: z.string().datetime({ offset: true }).nullable().optional().or(z.string().nullable().optional()),
});

export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

import { z } from "zod";
import { TestimonialStatus } from "@prisma/client";

export const testimonialSchema = z
  .object({
    clientName: z
      .string()
      .min(2, "Client name must be at least 2 characters long")
      .max(100, "Client name cannot exceed 100 characters"),
    clientTitle: z.string().max(100).optional().nullable(),
    designation: z.string().max(100).optional().nullable(),
    company: z.string().max(100).optional().nullable(),
    content: z.string().optional().nullable(),
    quote: z.string().optional().nullable(),
    avatarUrl: z.string().url("Invalid avatar URL format").optional().nullable().or(z.literal("")),
    photoUrl: z.string().url("Invalid photo URL format").optional().nullable().or(z.literal("")),
    rating: z
      .number()
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5")
      .default(5),
    featured: z.boolean().default(false),
    status: z
      .nativeEnum(TestimonialStatus)
      .optional()
      .default(TestimonialStatus.APPROVED),
    isApproved: z.boolean().optional(),
    order: z.number().int().default(0),
  })
  .refine(
    (data) => {
      const text = data.content || data.quote;
      return typeof text === "string" && text.trim().length >= 5;
    },
    {
      message: "Quote or content must be at least 5 characters long",
      path: ["content"],
    }
  )
  .transform((data) => {
    // Normalize aliases: designation -> clientTitle, quote -> content, photoUrl -> avatarUrl
    const clientTitle = data.designation?.trim() || data.clientTitle?.trim() || null;
    const content = (data.content?.trim() || data.quote?.trim()) as string;
    const avatarUrl = data.photoUrl?.trim() || data.avatarUrl?.trim() || null;
    
    // Status can also be derived from isApproved boolean if provided
    let status = data.status;
    if (typeof data.isApproved === "boolean") {
      status = data.isApproved ? TestimonialStatus.APPROVED : TestimonialStatus.REJECTED;
    }

    return {
      clientName: data.clientName.trim(),
      clientTitle,
      company: data.company?.trim() || null,
      content,
      avatarUrl,
      rating: data.rating,
      featured: data.featured,
      status,
      order: data.order,
    };
  });

export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const testimonialUpdateSchema = z
  .object({
    clientName: z.string().min(2).max(100).optional(),
    clientTitle: z.string().max(100).optional().nullable(),
    designation: z.string().max(100).optional().nullable(),
    company: z.string().max(100).optional().nullable(),
    content: z.string().min(5).optional().nullable(),
    quote: z.string().min(5).optional().nullable(),
    avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
    photoUrl: z.string().url().optional().nullable().or(z.literal("")),
    rating: z.number().int().min(1).max(5).optional(),
    featured: z.boolean().optional(),
    status: z.nativeEnum(TestimonialStatus).optional(),
    isApproved: z.boolean().optional(),
    order: z.number().int().optional(),
  })
  .transform((data) => {
    const output: {
      clientName?: string;
      clientTitle?: string | null;
      company?: string | null;
      content?: string;
      avatarUrl?: string | null;
      rating?: number;
      featured?: boolean;
      status?: TestimonialStatus;
      order?: number;
    } = {};

    if (data.clientName !== undefined) output.clientName = data.clientName.trim();
    if (data.designation !== undefined || data.clientTitle !== undefined) {
      output.clientTitle = data.designation?.trim() || data.clientTitle?.trim() || null;
    }
    if (data.company !== undefined) output.company = data.company?.trim() || null;
    if (data.content !== undefined || data.quote !== undefined) {
      const text = data.content?.trim() || data.quote?.trim();
      if (text) output.content = text;
    }
    if (data.photoUrl !== undefined || data.avatarUrl !== undefined) {
      output.avatarUrl = data.photoUrl?.trim() || data.avatarUrl?.trim() || null;
    }
    if (data.rating !== undefined) output.rating = data.rating;
    if (data.featured !== undefined) output.featured = data.featured;
    if (data.order !== undefined) output.order = data.order;

    if (data.status !== undefined) {
      output.status = data.status;
    } else if (typeof data.isApproved === "boolean") {
      output.status = data.isApproved ? TestimonialStatus.APPROVED : TestimonialStatus.REJECTED;
    }

    return output;
  });

export type TestimonialUpdateInput = z.infer<typeof testimonialUpdateSchema>;

export const testimonialReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1, "Testimonial ID is required"),
        order: z.number().int("Order must be an integer"),
      })
    )
    .min(1, "At least one item must be provided for reordering"),
});

export type TestimonialReorderInput = z.infer<typeof testimonialReorderSchema>;

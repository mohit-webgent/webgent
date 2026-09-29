import { z } from "zod";

export const postStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const blogPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title must not exceed 200 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  excerpt: z
    .string()
    .max(500, "Excerpt must not exceed 500 characters")
    .optional(),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters long"),
  coverImage: z
    .string()
    .url("Cover image must be a valid URL")
    .optional()
    .or(z.literal("")),
  ogImage: z
    .string()
    .url("OG image must be a valid URL")
    .optional()
    .or(z.literal("")),
  category: z
    .string()
    .max(50, "Category must not exceed 50 characters")
    .optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional(),
  status: postStatusSchema.default("DRAFT"),
  featured: z.boolean().default(false),
  seoTitle: z
    .string()
    .max(150, "SEO title must not exceed 150 characters")
    .optional(),
  seoDescription: z
    .string()
    .max(300, "SEO description must not exceed 300 characters")
    .optional(),
});

export const blogQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  tag: z.string().optional(),
  category: z.string().optional(),
  status: postStatusSchema.optional(),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type BlogQueryInput = z.infer<typeof blogQuerySchema>;

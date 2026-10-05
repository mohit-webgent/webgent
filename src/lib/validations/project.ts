import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(2, "Project title must be at least 2 characters long"),
  slug: z.string().optional().or(z.literal("")),
  description: z.string().min(5, "Short description must be at least 5 characters long"),
  content: z.string().optional().or(z.literal("")),
  clientName: z.string().optional().or(z.literal("")),
  category: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  screenshots: z.union([z.string(), z.array(z.string())]).optional(),
  demoUrl: z.string().optional().or(z.literal("")),
  githubUrl: z.string().optional().or(z.literal("")),
  technologies: z.union([z.string(), z.array(z.string())]).optional(),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
  seoTitle: z.string().optional().or(z.literal("")),
  seoDescription: z.string().optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const projectReorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1, "ID is required"),
      order: z.number().int(),
    }),
  ),
});

export type ProjectReorderInput = z.infer<typeof projectReorderSchema>;

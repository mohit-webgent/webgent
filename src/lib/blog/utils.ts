import { prisma } from "@/lib/db";

/**
 * Converts a title string into a clean URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Ensures slug is unique in the blog_posts database table.
 */
export async function ensureUniqueBlogSlug(
  baseInput: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugify(baseInput) || "untitled-post";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Calculates estimated read time in minutes based on ~200 words per minute.
 */
export function calculateReadTime(content: string): number {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

/**
 * Parses tags input (comma-separated string or array) into normalized string array.
 */
export function parseTags(tagsInput?: string | string[] | null): string[] {
  if (!tagsInput) return [];
  if (Array.isArray(tagsInput)) {
    return tagsInput.map((t) => t.trim().toLowerCase()).filter(Boolean);
  }
  return tagsInput
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Formats tags into a clean comma-separated string for database storage.
 */
export function formatTags(tagsInput?: string | string[] | null): string | null {
  const tags = parseTags(tagsInput);
  return tags.length > 0 ? tags.join(",") : null;
}

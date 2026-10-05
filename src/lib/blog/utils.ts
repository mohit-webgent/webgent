import { prisma } from "@/lib/db";

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function ensureUniqueBlogSlug(baseInput: string, excludeId?: string): Promise<string> {
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

export function calculateReadTime(content: string): number {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

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

export function formatTags(tagsInput?: string | string[] | null): string | null {
  const tags = parseTags(tagsInput);
  return tags.length > 0 ? tags.join(",") : null;
}

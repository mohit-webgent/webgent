import { prisma } from "@/lib/db";

/**
 * Converts a raw string into a clean, lowercased, URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W_]+|-+/g, "-") // Replace spaces and non-alphanumeric with single hyphen
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

/**
 * Generates a guaranteed unique slug for a project title or proposed slug.
 */
export async function ensureUniqueSlug(
  rawInput: string,
  currentProjectId?: string
): Promise<string> {
  const baseSlug = slugify(rawInput) || "project";
  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.project.findUnique({
      where: { slug: candidateSlug },
    });

    if (!existing || existing.id === currentProjectId) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${counter}`;
    counter++;
  }
}

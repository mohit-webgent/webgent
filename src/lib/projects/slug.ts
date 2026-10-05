import { prisma } from "@/lib/db";

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W_]+|-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function ensureUniqueSlug(
  rawInput: string,
  currentProjectId?: string,
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

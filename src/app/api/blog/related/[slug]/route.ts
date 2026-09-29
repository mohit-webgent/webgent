import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { parseTags } from "@/lib/blog/utils";
import { logger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const currentPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, category: true, tags: true },
    });

    if (!currentPost) {
      return ApiResponse.notFound("Blog post not found.");
    }

    const currentTags = parseTags(currentPost.tags);

    // Find related posts by matching category or matching tags
    const OR_conditions: Array<{ category?: { equals: string; mode: "insensitive" }; tags?: { contains: string; mode: "insensitive" } }> = [];

    if (currentPost.category) {
      OR_conditions.push({ category: { equals: currentPost.category, mode: "insensitive" } });
    }

    currentTags.forEach((t) => {
      OR_conditions.push({ tags: { contains: t, mode: "insensitive" } });
    });

    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        NOT: { id: currentPost.id },
        ...(OR_conditions.length > 0 ? { OR: OR_conditions } : {}),
      },
      take: 3,
      orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return ApiResponse.success(relatedPosts);
  } catch (error) {
    logger.error("Error fetching related blog posts", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch related blog posts.");
  }
}

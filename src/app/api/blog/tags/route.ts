import { ApiResponse } from "@/lib/api/response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        publishedAt: { lte: new Date() },
      },
      select: {
        tags: true,
      },
    });

    const tagCounts: Record<string, number> = {};

    posts.forEach((post) => {
      if (post.tags) {
        const tagList = post.tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);

        tagList.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const tagsArray = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return ApiResponse.success(tagsArray);
  } catch (error) {
    logger.error("Error fetching blog tags", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch blog tags.");
  }
}

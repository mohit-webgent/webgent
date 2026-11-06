import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest, { params: routeParams }: { params: Promise<{ slug: string }> }) {
  const params = await routeParams;
  try {
    const { slug } = params;

    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        deletedAt: null,
      },
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

    if (!post) {
      return ApiResponse.notFound("Blog post not found.");
    }

    return ApiResponse.success(post);
  } catch (error) {
    logger.error("Error fetching blog post by slug", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch blog post.");
  }
}

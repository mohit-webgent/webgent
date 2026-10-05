import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
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

    const updatedPost = await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
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

    return ApiResponse.success(updatedPost);
  } catch (error) {
    logger.error("Error fetching blog post by slug", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch blog post.");
  }
}

import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { logger } from "@/lib/logger";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return ApiResponse.notFound("Blog post not found.");
    }

    const body = await req.json().catch(() => ({}));
    const requestedStatus = body.status;

    let nextStatus: "PUBLISHED" | "DRAFT" = "DRAFT";
    if (requestedStatus === "PUBLISHED" || requestedStatus === "DRAFT") {
      nextStatus = requestedStatus;
    } else {
      nextStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    }

    let publishedAt = post.publishedAt;
    if (nextStatus === "PUBLISHED" && !publishedAt) {
      publishedAt = new Date();
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        status: nextStatus,
        publishedAt,
      },
    });

    logger.info("Updated blog post publication status", {
      postId: id,
      status: updatedPost.status,
    });

    return ApiResponse.success(updatedPost);
  } catch (error) {
    logger.error("Error toggling blog post publish status", { error: String(error) });
    return ApiResponse.internalError("Failed to update publication status.");
  }
}

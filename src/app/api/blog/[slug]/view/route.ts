import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { getClientIp } from "@/lib/client-ip";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

const VIEW_WINDOW_MS = 6 * 60 * 60 * 1000;

/**
 * Counts one read per visitor per post in a six-hour window. It is called from the browser, because
 * blog pages are cached and a count made while rendering only tracks page regenerations.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const limit = await checkRateLimit(`blog_view:${getClientIp(req.headers)}:${slug}`, 1, VIEW_WINDOW_MS);

    if (!limit.success) {
      return ApiResponse.success({ counted: false });
    }

    const { count } = await prisma.blogPost.updateMany({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      data: { views: { increment: 1 } },
    });

    return count > 0 ? ApiResponse.success({ counted: true }) : ApiResponse.notFound("Blog post not found.");
  } catch (error) {
    logger.error("Error recording blog view", { error: String(error) });
    return ApiResponse.internalError("Failed to record view.");
  }
}

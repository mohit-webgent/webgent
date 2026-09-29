import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { TestimonialStatus, Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

/**
 * Public Testimonials API
 * GET /api/testimonials
 * 
 * Rules:
 * - Only APPROVED testimonials are returned.
 * - Soft-deleted records (deletedAt != null) are excluded.
 * - Ordered by `order` ascending, then `createdAt` descending.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get("featured") === "true";
    const minRating = searchParams.get("rating") ? parseInt(searchParams.get("rating")!, 10) : undefined;
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;

    const where: Prisma.TestimonialWhereInput = {
      status: TestimonialStatus.APPROVED,
      deletedAt: null,
    };

    if (featuredOnly) {
      where.featured = true;
    }

    if (minRating && !isNaN(minRating)) {
      where.rating = { gte: minRating };
    }

    const [total, testimonials] = await Promise.all([
      prisma.testimonial.count({ where }),
      prisma.testimonial.findMany({
        where,
        orderBy: [
          { order: "asc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
    ]);

    // Format fields with friendly aliases (designation, quote, photoUrl) for API consumers
    const formatted = testimonials.map((t) => ({
      id: t.id,
      clientName: t.clientName,
      clientTitle: t.clientTitle,
      designation: t.clientTitle,
      company: t.company,
      content: t.content,
      quote: t.content,
      avatarUrl: t.avatarUrl,
      photoUrl: t.avatarUrl,
      rating: t.rating,
      featured: t.featured,
      order: t.order,
      createdAt: t.createdAt,
    }));

    return ApiResponse.success(formatted, 200, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error retrieving public testimonials", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch testimonials.");
  }
}

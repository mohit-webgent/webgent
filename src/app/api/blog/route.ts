import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { blogQuerySchema } from "@/lib/validations/blog";
import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryResult = blogQuerySchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      search: searchParams.get("search") || undefined,
      tag: searchParams.get("tag") || undefined,
      category: searchParams.get("category") || undefined,
    });

    if (!queryResult.success) {
      return ApiResponse.validationError(
        "Invalid query parameters",
        queryResult.error.flatten().fieldErrors
      );
    }

    const { page, limit, search, tag, category } = queryResult.data;

    const where: Prisma.BlogPostWhereInput = {
      status: "PUBLISHED",
      deletedAt: null,
      publishedAt: { lte: new Date() },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category.toLowerCase() !== "all") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (tag) {
      where.tags = { contains: tag.toLowerCase(), mode: "insensitive" };
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return ApiResponse.success({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    logger.error("Error fetching public blog posts", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch blog posts.");
  }
}

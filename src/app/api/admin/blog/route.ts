import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { blogPostSchema, blogQuerySchema } from "@/lib/validations/blog";
import { ensureUniqueBlogSlug, calculateReadTime, formatTags } from "@/lib/blog/utils";
import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { searchParams } = new URL(req.url);
    const queryResult = blogQuerySchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      search: searchParams.get("search") || undefined,
      tag: searchParams.get("tag") || undefined,
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
    });

    if (!queryResult.success) {
      return ApiResponse.validationError(
        "Invalid query parameters",
        queryResult.error.flatten().fieldErrors
      );
    }

    const { page, limit, search, tag, category, status } = queryResult.data;

    const where: Prisma.BlogPostWhereInput = {};

    if (status) {
      where.status = status;
    }

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
        orderBy: [{ createdAt: "desc" }],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
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
    logger.error("Error fetching admin blog posts", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch blog posts.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const body = await req.json().catch(() => ({}));
    const validation = blogPostSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid blog post input data",
        validation.error.flatten().fieldErrors
      );
    }

    const {
      title,
      slug: proposedSlug,
      excerpt,
      content,
      coverImage,
      ogImage,
      category,
      tags,
      status,
      featured,
      seoTitle,
      seoDescription,
    } = validation.data;

    const slug = await ensureUniqueBlogSlug(proposedSlug || title);
    const readTime = calculateReadTime(content);
    const formattedTagString = formatTags(tags);

    const isPublished = status === "PUBLISHED";
    const publishedAt = isPublished ? new Date() : null;

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        ogImage: ogImage || coverImage || null,
        category: category || null,
        tags: formattedTagString,
        readTime,
        status,
        featured,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        publishedAt,
        authorId: authGuard.session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info("Created new blog post", { postId: post.id, slug: post.slug });

    return ApiResponse.success(post, 201);
  } catch (error) {
    logger.error("Error creating blog post", { error: String(error) });
    return ApiResponse.internalError("Failed to create blog post.");
  }
}

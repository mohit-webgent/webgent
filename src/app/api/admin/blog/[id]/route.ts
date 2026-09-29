import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { blogPostSchema } from "@/lib/validations/blog";
import { ensureUniqueBlogSlug, calculateReadTime, formatTags } from "@/lib/blog/utils";
import { storageService } from "@/lib/services/storage";
import { logger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
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
    });

    if (!post) {
      return ApiResponse.notFound("Blog post not found.");
    }

    return ApiResponse.success(post);
  } catch (error) {
    logger.error("Error fetching admin blog post details", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch blog post.");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return ApiResponse.notFound("Blog post not found.");
    }

    const body = await req.json().catch(() => ({}));
    const validation = blogPostSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid blog post update parameters",
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

    // Handle slug update & uniqueness
    const slug = proposedSlug
      ? await ensureUniqueBlogSlug(proposedSlug, id)
      : existingPost.title !== title
      ? await ensureUniqueBlogSlug(title, id)
      : existingPost.slug;

    const readTime = calculateReadTime(content);
    const formattedTagString = formatTags(tags);

    // Handle publishedAt timestamp
    let publishedAt = existingPost.publishedAt;
    if (status === "PUBLISHED" && !publishedAt) {
      publishedAt = new Date();
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
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

    logger.info("Updated blog post record", { postId: id, slug: updatedPost.slug });

    return ApiResponse.success(updatedPost);
  } catch (error) {
    logger.error("Error updating blog post", { error: String(error) });
    return ApiResponse.internalError("Failed to update blog post.");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const isPermanent = searchParams.get("permanent") === "true";

    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return ApiResponse.notFound("Blog post not found.");
    }

    if (isPermanent) {
      // Prepared Cloudflare R2 storage deletion integration
      if (post.coverImage) {
        await storageService.deleteFile(post.coverImage);
      }
      if (post.ogImage) {
        await storageService.deleteFile(post.ogImage);
      }

      await prisma.blogPost.delete({
        where: { id },
      });

      logger.info("Permanently deleted blog post record", { postId: id });
      return ApiResponse.success({ message: "Blog post permanently deleted." });
    }

    // Default Soft Delete
    const archivedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "ARCHIVED",
      },
    });

    logger.info("Soft-deleted blog post record", { postId: id });

    return ApiResponse.success({
      message: "Blog post soft-deleted and archived successfully.",
      post: archivedPost,
    });
  } catch (error) {
    logger.error("Error deleting blog post", { error: String(error) });
    return ApiResponse.internalError("Failed to delete blog post.");
  }
}

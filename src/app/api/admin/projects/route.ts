import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { projectSchema } from "@/lib/validations/project";
import { ensureUniqueSlug } from "@/lib/projects/slug";
import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim();

    const where: Prisma.ProjectWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { clientName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category.toLowerCase() !== "all") {
      where.category = { equals: category, mode: "insensitive" };
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return ApiResponse.success(projects);
  } catch (error) {
    logger.error("Error fetching admin projects list", {
      error: String(error),
    });
    return ApiResponse.internalError("Failed to fetch projects.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const body = await req.json().catch(() => ({}));
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid project input data",
        validation.error.flatten().fieldErrors,
      );
    }

    const {
      title,
      slug: proposedSlug,
      description,
      content,
      clientName,
      category,
      imageUrl,
      screenshots,
      demoUrl,
      githubUrl,
      technologies,
      featured,
      published,
      order,
      seoTitle,
      seoDescription,
    } = validation.data;

    if (featured) {
      const featuredCount = await prisma.project.count({
        where: { featured: true },
      });
      if (featuredCount >= 3) {
        return ApiResponse.badRequest(
          "Maximum limit of 3 featured projects reached. Unfeature an existing project first.",
          "FEATURED_LIMIT_EXCEEDED",
        );
      }
    }

    const slug = await ensureUniqueSlug(proposedSlug || title);

    const formattedTech = Array.isArray(technologies)
      ? technologies.join(",")
      : technologies || null;

    const formattedScreenshots = Array.isArray(screenshots)
      ? JSON.stringify(screenshots)
      : screenshots || null;

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        content: content || null,
        clientName: clientName || null,
        category: category || null,
        imageUrl: imageUrl || null,
        screenshots: formattedScreenshots,
        demoUrl: demoUrl || null,
        githubUrl: githubUrl || null,
        technologies: formattedTech,
        featured,
        published,
        order,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        authorId: authGuard.session.user.id,
      },
    });

    logger.info("Created new project", {
      projectId: project.id,
      slug: project.slug,
    });

    return ApiResponse.success(project, 201);
  } catch (error) {
    logger.error("Error creating project", { error: String(error) });
    return ApiResponse.internalError("Failed to create project.");
  }
}

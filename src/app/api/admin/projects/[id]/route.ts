import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { projectSchema } from "@/lib/validations/project";
import { ensureUniqueSlug } from "@/lib/projects/slug";
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

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return ApiResponse.notFound("Project not found.");
    }

    return ApiResponse.success(project);
  } catch (error) {
    logger.error("Error fetching single admin project", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch project.");
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

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return ApiResponse.notFound("Project not found.");
    }

    const body = await req.json().catch(() => ({}));
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid project update parameters",
        validation.error.flatten().fieldErrors
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

    // Enforce Max 3 Featured Projects Limit (excluding current project)
    if (featured && !existingProject.featured) {
      const featuredCount = await prisma.project.count({
        where: { featured: true, NOT: { id } },
      });
      if (featuredCount >= 3) {
        return ApiResponse.badRequest(
          "Maximum limit of 3 featured projects reached. Unfeature another project first.",
          "FEATURED_LIMIT_EXCEEDED"
        );
      }
    }

    // Slug management
    const slug = proposedSlug
      ? await ensureUniqueSlug(proposedSlug, id)
      : existingProject.title !== title
      ? await ensureUniqueSlug(title, id)
      : existingProject.slug;

    const formattedTech = Array.isArray(technologies)
      ? technologies.join(",")
      : technologies || null;

    const formattedScreenshots = Array.isArray(screenshots)
      ? JSON.stringify(screenshots)
      : screenshots || null;

    const updatedProject = await prisma.project.update({
      where: { id },
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
      },
    });

    logger.info("Updated project record", { projectId: id, slug: updatedProject.slug });

    return ApiResponse.success(updatedProject);
  } catch (error) {
    logger.error("Error updating project", { error: String(error) });
    return ApiResponse.internalError("Failed to update project.");
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

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return ApiResponse.notFound("Project not found.");
    }

    // Safely invoke storage service to delete attached cover image and screenshots from R2
    if (project.imageUrl) {
      await storageService.deleteFile(project.imageUrl);
    }
    if (project.screenshots) {
      try {
        const screenshotUrls: string[] = JSON.parse(project.screenshots);
        if (Array.isArray(screenshotUrls)) {
          await storageService.deleteFiles(screenshotUrls);
        }
      } catch {
        await storageService.deleteFile(project.screenshots);
      }
    }

    // Delete record from database
    await prisma.project.delete({
      where: { id },
    });

    logger.info("Deleted project record cleanly", { projectId: id });

    return ApiResponse.success({ message: "Project deleted successfully." });
  } catch (error) {
    logger.error("Error deleting project", { error: String(error) });
    return ApiResponse.internalError("Failed to delete project.");
  }
}

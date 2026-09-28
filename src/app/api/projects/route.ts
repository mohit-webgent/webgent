import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category")?.trim();
    const featuredOnly = searchParams.get("featured") === "true";
    const limitParam = searchParams.get("limit");

    const where: Prisma.ProjectWhereInput = {
      published: true,
    };

    if (category && category.toLowerCase() !== "all") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (featuredOnly) {
      where.featured = true;
    }

    const take = limitParam ? Math.min(50, Math.max(1, parseInt(limitParam, 10))) : undefined;

    const projects = await prisma.project.findMany({
      where,
      take,
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return ApiResponse.success(projects);
  } catch (error) {
    logger.error("Error fetching public projects", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch portfolio projects.");
  }
}

import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest, { params: routeParams }: { params: Promise<{ slug: string }> }) {
  const params = await routeParams;
  try {
    const { slug } = params;

    const project = await prisma.project.findUnique({
      where: { slug },
    });

    if (!project || !project.published) {
      return ApiResponse.notFound("Project not found.");
    }

    return ApiResponse.success(project);
  } catch (error) {
    logger.error("Error fetching project by slug", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch project details.");
  }
}

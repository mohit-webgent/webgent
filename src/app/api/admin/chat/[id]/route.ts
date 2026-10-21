import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { ChatStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const updateSessionSchema = z.object({
  status: z.enum(["ACTIVE", "CLOSED", "ARCHIVED"]),
});

function safeParseMetadata(val: string | null): Record<string, unknown> | null {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return { raw: val };
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chatSession) {
      return ApiResponse.notFound("Chat session not found.");
    }

    return ApiResponse.success({
      ...chatSession,
      metadata: safeParseMetadata(chatSession.metadata),
    });
  } catch (error) {
    logger.error("Failed to fetch chat session details", { error, id: params.id });
    return ApiResponse.internalError("Failed to retrieve chat session.");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const body = await req.json().catch(() => ({}));
    const validated = updateSessionSchema.safeParse(body);
    if (!validated.success) {
      return ApiResponse.badRequest(validated.error.errors[0]?.message || "Invalid status");
    }

    const updated = await prisma.chatSession.update({
      where: { id: params.id },
      data: {
        status: validated.data.status as ChatStatus,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return ApiResponse.success(updated);
  } catch (error) {
    logger.error("Failed to update chat session", { error, id: params.id });
    return ApiResponse.internalError("Failed to update chat session status.");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const existing = await prisma.chatSession.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return ApiResponse.notFound("Chat session not found.");
    }

    await prisma.chatSession.delete({
      where: { id: params.id },
    });

    return ApiResponse.success({
      message: "Chat session deleted successfully.",
    });
  } catch (error) {
    logger.error("Failed to delete chat session", { error, id: params.id });
    return ApiResponse.internalError("Failed to delete chat session.");
  }
}

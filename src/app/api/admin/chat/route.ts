import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { ChatStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const createSessionSchema = z.object({
  visitorId: z.string().min(1, "Visitor ID is required"),
  initialMessage: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

function safeParseMetadata(val: string | null): Record<string, unknown> | null {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return { raw: val };
  }
}

export async function GET(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "15", 10)));
    const statusParam = searchParams.get("status") || "ALL";
    const search = searchParams.get("search")?.trim() || "";

    const where: Prisma.ChatSessionWhereInput = {};

    if (statusParam !== "ALL") {
      if (Object.values(ChatStatus).includes(statusParam as ChatStatus)) {
        where.status = statusParam as ChatStatus;
      }
    }

    if (search) {
      where.OR = [
        { visitorId: { contains: search, mode: "insensitive" } },
        {
          messages: {
            some: {
              content: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    const [total, sessions, totalActive, totalClosed, totalArchived] = await Promise.all([
      prisma.chatSession.count({ where }),
      prisma.chatSession.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.chatSession.count({ where: { status: "ACTIVE" } }),
      prisma.chatSession.count({ where: { status: "CLOSED" } }),
      prisma.chatSession.count({ where: { status: "ARCHIVED" } }),
    ]);

    const formattedSessions = sessions.map((s) => ({
      id: s.id,
      visitorId: s.visitorId,
      status: s.status,
      metadata: safeParseMetadata(s.metadata),
      messageCount: s._count.messages,
      lastMessage: s.messages[0]
        ? {
            id: s.messages[0].id,
            sender: s.messages[0].sender,
            content: s.messages[0].content,
            createdAt: s.messages[0].createdAt,
          }
        : null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return ApiResponse.success(formattedSessions, 200, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      counts: {
        all: totalActive + totalClosed + totalArchived,
        active: totalActive,
        closed: totalClosed,
        archived: totalArchived,
      },
    });
  } catch (error) {
    logger.error("Failed to query admin chat sessions", { error });
    return ApiResponse.internalError("Failed to load chat sessions.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const body = await req.json().catch(() => ({}));
    const validated = createSessionSchema.safeParse(body);
    if (!validated.success) {
      return ApiResponse.badRequest(validated.error.errors[0]?.message || "Invalid payload");
    }

    const { visitorId, initialMessage, metadata } = validated.data;

    const chatSession = await prisma.chatSession.create({
      data: {
        visitorId,
        status: "ACTIVE",
        metadata: metadata ? JSON.stringify(metadata) : null,
        messages: initialMessage
          ? {
              create: {
                sender: "visitor",
                content: initialMessage,
              },
            }
          : undefined,
      },
      include: {
        messages: true,
      },
    });

    return ApiResponse.success(chatSession, 201);
  } catch (error) {
    logger.error("Failed to create chat session", { error });
    return ApiResponse.internalError("Failed to create chat session.");
  }
}

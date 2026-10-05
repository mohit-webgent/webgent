import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { ChatStatus, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
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
        { metadata: { contains: search, mode: "insensitive" } },
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
      metadata: s.metadata ? JSON.parse(s.metadata) : null,
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

    return NextResponse.json({
      success: true,
      data: formattedSessions,
      meta: {
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
      },
    });
  } catch (error) {
    logger.error("Failed to query admin chat sessions", { error });
    return NextResponse.json(
      { success: false, error: "Failed to load chat sessions" },
      { status: 500 },
    );
  }
}

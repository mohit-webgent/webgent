import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { ChatStatus } from "@prisma/client";

const updateSessionSchema = z.object({
  status: z.enum(["ACTIVE", "CLOSED", "ARCHIVED"]),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { success: false, error: "Chat session not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...chatSession,
        metadata: chatSession.metadata ? JSON.parse(chatSession.metadata) : null,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch chat session details", { error, id: params.id });
    return NextResponse.json(
      { success: false, error: "Failed to retrieve chat session" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = updateSessionSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message },
        { status: 400 },
      );
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

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error("Failed to update chat session", { error, id: params.id });
    return NextResponse.json(
      { success: false, error: "Failed to update chat session status" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    await prisma.chatSession.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Chat session deleted successfully",
    });
  } catch (error) {
    logger.error("Failed to delete chat session", { error, id: params.id });
    return NextResponse.json(
      { success: false, error: "Failed to delete chat session" },
      { status: 500 },
    );
  }
}

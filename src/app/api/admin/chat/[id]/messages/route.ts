import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";

const sendMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty").max(4000),
  sender: z.string().default("admin"),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = sendMessageSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message },
        { status: 400 },
      );
    }

    const { content, sender } = validated.data;

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: params.id },
    });

    if (!chatSession) {
      return NextResponse.json(
        { success: false, error: "Chat session not found" },
        { status: 404 },
      );
    }

    const [message] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          sessionId: params.id,
          sender: sender || "admin",
          content: content.trim(),
        },
      }),
      prisma.chatSession.update({
        where: { id: params.id },
        data: {
          updatedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    logger.error("Failed to post message to chat session", {
      error,
      id: params.id,
    });
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}

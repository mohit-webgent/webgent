import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { notificationService } from "@/lib/services/notifications";
import {
  callClaudeChat,
  detectPromptAbuse,
  ChatHistoryMessage,
  VisitorInfo,
} from "@/lib/services/claude";
import { z } from "zod";

const postMessageSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  message: z.string().trim().min(1, "Message cannot be empty").max(1000, "Message cannot exceed 1000 characters"),
  visitorInfo: z
    .object({
      name: z.string().trim().max(100).optional(),
      email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json().catch(() => ({}));
    const validated = postMessageSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const { sessionId, message, visitorInfo } = validated.data;

    // Rate limiting: max 25 messages per 2 minutes per IP
    const ipRate = await checkRateLimit(`chat_msg_${ip}`, 25, 2 * 60 * 1000);
    if (!ipRate.success) {
      return NextResponse.json(
        {
          success: false,
          error: "You are sending messages too quickly. Please pause for a moment.",
        },
        { status: 429 }
      );
    }

    // Rate limiting per session
    const sessionRate = await checkRateLimit(`chat_session_${sessionId}`, 30, 2 * 60 * 1000);
    if (!sessionRate.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Session message limit reached. Please wait a moment before sending more messages.",
        },
        { status: 429 }
      );
    }

    // Check prompt abuse / jailbreak attempts
    const abuseCheck = detectPromptAbuse(message);
    if (abuseCheck.isAbusive) {
      logger.warn("[Chat:Message] Prompt abuse attempt detected", {
        sessionId,
        ip,
        reason: abuseCheck.reason,
      });

      return NextResponse.json({
        success: true,
        sessionId,
        message:
          "I am Webgent's AI engineering concierge. I can only assist with web development, cloud architecture, and technical consulting. Please let me know how we can assist with your digital product!",
      });
    }

    // Fetch existing chat session
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 20, // include recent history
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { success: false, error: "Chat session not found. Please start a new session." },
        { status: 404 }
      );
    }

    if (chatSession.status === "CLOSED" || chatSession.status === "ARCHIVED") {
      return NextResponse.json(
        {
          success: false,
          error: "This chat conversation has concluded. Please start a new session to continue chatting.",
        },
        { status: 400 }
      );
    }

    // Parse session metadata
    let currentMetadata: Record<string, unknown> = {};
    try {
      if (chatSession.metadata) {
        currentMetadata = JSON.parse(chatSession.metadata);
      }
    } catch {
      currentMetadata = {};
    }

    // Handle visitor details update if provided
    let hadPriorEmail = Boolean(currentMetadata.email);
    let updatedMetadata = false;

    if (visitorInfo?.name && visitorInfo.name.trim()) {
      currentMetadata.name = visitorInfo.name.trim();
      updatedMetadata = true;
    }

    if (visitorInfo?.email && visitorInfo.email.trim()) {
      currentMetadata.email = visitorInfo.email.trim();
      updatedMetadata = true;
    }

    // If visitor just provided their email, notify admin and create Lead record
    if (!hadPriorEmail && visitorInfo?.email && visitorInfo.email.trim()) {
      const visitorName = (visitorInfo.name || currentMetadata.name || "Webgent Chat Visitor") as string;
      const visitorEmail = visitorInfo.email.trim();

      try {
        await notificationService.sendNewLeadNotification({
          id: `chat_${chatSession.id}`,
          name: visitorName,
          email: visitorEmail,
          service: "AI Chat Inbound Lead",
          message: `Visitor shared contact info during AI chat.\nLatest message: "${message}"`,
        });

        await prisma.lead.create({
          data: {
            name: visitorName,
            email: visitorEmail,
            service: "AI Chat Inbound",
            message: `Captured via AI chat. Latest inquiry: "${message}"`,
            ipAddress: ip,
            status: "NEW",
            score: 60,
          },
        }).catch((err) => {
          logger.warn("[Chat:Message] Could not save lead record", { error: err });
        });
      } catch (notifyErr) {
        logger.error("[Chat:Message] Admin notification error", { error: notifyErr });
      }
    }

    // Store the visitor's incoming message
    const visitorMessage = await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        sender: "visitor",
        content: message.trim(),
      },
    });

    // Update metadata if needed
    if (updatedMetadata) {
      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: {
          metadata: JSON.stringify(currentMetadata),
          updatedAt: new Date(),
        },
      });
    }

    // Prepare conversation history for Claude API
    const history: ChatHistoryMessage[] = chatSession.messages.map((m) => ({
      role: m.sender === "visitor" || m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

    // Add current user message
    history.push({
      role: "user",
      content: message.trim(),
    });

    const parsedVisitorInfo: VisitorInfo = {
      name: (currentMetadata.name as string) || undefined,
      email: (currentMetadata.email as string) || undefined,
    };

    // Execute Claude API call with controlled system prompt & graceful fallback
    const assistantReply = await callClaudeChat({
      messages: history,
      visitorInfo: parsedVisitorInfo,
    });

    // Save assistant reply to database
    await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          sender: "assistant",
          content: assistantReply,
        },
      }),
      prisma.chatSession.update({
        where: { id: chatSession.id },
        data: {
          updatedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      sessionId: chatSession.id,
      message: assistantReply,
      visitorMessageId: visitorMessage.id,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("[Chat:Message] Exception processing message", { error: errorMsg });

    return NextResponse.json(
      {
        success: false,
        error: "We encountered an issue processing your message. Please try again or reach out at /contact.",
      },
      { status: 500 }
    );
  }
}

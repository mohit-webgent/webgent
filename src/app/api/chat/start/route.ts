import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { notificationService } from "@/lib/services/notifications";
import { z } from "zod";
import crypto from "crypto";

const startChatSchema = z.object({
  visitorId: z.string().optional(),
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  initialMessage: z.string().trim().max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateCheck = await checkRateLimit(`chat_start_${ip}`, 15, 10 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many chat sessions created. Please wait a few minutes before starting a new chat.",
        },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const validated = startChatSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: validated.error.errors[0]?.message || "Invalid request payload",
        },
        { status: 400 },
      );
    }

    const { visitorId, name, email, initialMessage, metadata } = validated.data;
    const finalVisitorId = visitorId?.trim() || `visitor_${crypto.randomUUID().slice(0, 12)}`;

    const sessionMetadata: Record<string, unknown> = {
      ...(metadata || {}),
      userAgent: req.headers.get("user-agent") || undefined,
      ipAddress: ip,
      createdAt: new Date().toISOString(),
    };

    if (name?.trim()) {
      sessionMetadata.name = name.trim();
    }
    if (email?.trim()) {
      sessionMetadata.email = email.trim();
    }

    const chatSession = await prisma.chatSession.create({
      data: {
        visitorId: finalVisitorId,
        status: "ACTIVE",
        metadata: JSON.stringify(sessionMetadata),
        messages: initialMessage?.trim()
          ? {
              create: {
                sender: "visitor",
                content: initialMessage.trim(),
              },
            }
          : undefined,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (name?.trim() && email?.trim()) {
      try {
        await notificationService.sendNewLeadNotification({
          id: `chat_${chatSession.id}`,
          name: name.trim(),
          email: email.trim(),
          service: "AI Chat Inbound",
          message:
            initialMessage?.trim() ||
            "Visitor initiated AI chat session and shared contact details.",
        });

        await prisma.lead
          .create({
            data: {
              name: name.trim(),
              email: email.trim(),
              service: "AI Chat Inbound",
              message: initialMessage?.trim() || "Inbound inquiry captured via AI Chat Widget",
              ipAddress: ip,
              userAgent: req.headers.get("user-agent") || undefined,
              status: "NEW",
              score: 50,
            },
          })
          .catch((err) => {
            logger.warn("[Chat:Start] Failed to record lead from chat info", {
              error: err,
            });
          });
      } catch (notifyErr) {
        logger.error("[Chat:Start] Admin notification error on chat start", {
          error: notifyErr,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        sessionId: chatSession.id,
        visitorId: finalVisitorId,
        status: chatSession.status,
        messages: chatSession.messages,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("[Chat:Start] Exception creating chat session", {
      error: errorMsg,
    });
    return NextResponse.json(
      { success: false, error: "Failed to initialize chat session" },
      { status: 500 },
    );
  }
}

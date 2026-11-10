import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { notificationService } from "@/lib/services/notifications";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { syncChatLead } from "@/lib/services/chat-leads";
import { getClientIp } from "@/lib/client-ip";
import { getSiteSwitches } from "@/lib/services/cms";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";
import crypto from "crypto";

const startChatSchema = z.object({
  visitorId: z.string().max(100).optional(),
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  initialMessage: z.string().trim().max(1000).optional(),
  turnstileToken: z.string().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    // Admin → Settings → AI chat. When it is off, nothing new can be started or sent.
    if (!(await getSiteSwitches()).aiChatEnabled) {
      return NextResponse.json(
        { success: false, error: "The AI consultant is turned off right now. Please use the contact page." },
        { status: 503 },
      );
    }

    const ip = getClientIp(req.headers);

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
          error: validated.error.issues[0]?.message || "Invalid request payload",
        },
        { status: 400 },
      );
    }

    const { visitorId, name, email, initialMessage, turnstileToken } = validated.data;

    const turnstileResult = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: turnstileResult.error || "Turnstile security check failed.",
        },
        { status: 400 },
      );
    }

    const finalVisitorId = visitorId?.trim() || `visitor_${crypto.randomUUID().slice(0, 12)}`;

    // Built only from server-side values. Project state and estimates in here feed lead records,
    // so the browser must not be able to set them.
    const sessionMetadata: Record<string, unknown> = {
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
        const userAgent = req.headers.get("user-agent") || undefined;
        const message = initialMessage?.trim() || "Inbound inquiry captured via AI Chat Widget";
        const result = await syncChatLead({
          sessionId: chatSession.id,
          name: name.trim(),
          email: email.trim(),
          service: "AI Chat Inbound",
          message,
          ipAddress: ip,
          userAgent,
          score: 50,
        });

        if (result.outcome === "created") {
          await prisma.chatSession.update({
            where: { id: chatSession.id },
            data: { metadata: JSON.stringify({ ...sessionMetadata, leadId: result.leadId }) },
          });

          waitUntil(
            notificationService
              .sendNewLeadNotification({
                id: result.leadId,
                name: name.trim(),
                email: email.trim(),
                service: "AI Chat Inbound",
                message,
              })
              .catch((error) =>
                logger.error("[Chat:Start] Lead notification failed", { error: String(error) }),
              ),
          );
        }
      } catch (notifyErr) {
        logger.error("[Chat:Start] Could not record chat lead", {
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

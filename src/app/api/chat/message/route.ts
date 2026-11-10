import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { notificationService } from "@/lib/services/notifications";
import {
  processConsultantMessage,
  ChatHistoryMessage,
  VisitorInfo,
  ProjectState,
} from "@/lib/services/ai-consultant/orchestrator";
import { detectPromptAbuse } from "@/lib/services/gemini";
import { syncChatLead } from "@/lib/services/chat-leads";
import { getClientIp } from "@/lib/client-ip";
import { getSiteSwitches } from "@/lib/services/cms";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";

// Gemini's retry chain is capped at about 22 seconds, leaving room for database work.
export const maxDuration = 30;

const HISTORY_LIMIT = 20;

const postMessageSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(1000, "Message cannot exceed 1000 characters"),
  visitorInfo: z
    .object({
      name: z.string().trim().max(100).optional(),
      email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
    })
    .optional(),
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

    const body = await req.json().catch(() => ({}));
    const validated = postMessageSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: validated.error.issues[0]?.message || "Invalid request",
        },
        { status: 400 },
      );
    }

    const { sessionId, message, visitorInfo } = validated.data;

    const ipRate = await checkRateLimit(`chat_msg_${ip}`, 25, 2 * 60 * 1000);
    if (!ipRate.success) {
      return NextResponse.json(
        {
          success: false,
          error: "You are sending messages too quickly. Please pause for a moment.",
        },
        { status: 429 },
      );
    }

    const sessionRate = await checkRateLimit(`chat_session_${sessionId}`, 30, 2 * 60 * 1000);
    if (!sessionRate.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Session message limit reached. Please wait a moment before sending more messages.",
        },
        { status: 429 },
      );
    }

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

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        // Newest first so long chats keep their recent context. Reversed below.
        messages: {
          orderBy: { createdAt: "desc" },
          take: HISTORY_LIMIT,
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        {
          success: false,
          code: "SESSION_NOT_FOUND",
          error: "Chat session not found. Please start a new session.",
        },
        { status: 404 },
      );
    }

    if (chatSession.status === "CLOSED" || chatSession.status === "ARCHIVED") {
      return NextResponse.json(
        {
          success: false,
          code: "SESSION_CLOSED",
          error:
            "This chat conversation has concluded. Please start a new session to continue chatting.",
        },
        { status: 410 },
      );
    }

    let currentMetadata: Record<string, unknown> = {};
    try {
      if (chatSession.metadata) {
        currentMetadata = JSON.parse(chatSession.metadata);
      }
    } catch {
      currentMetadata = {};
    }

    if (visitorInfo?.name && visitorInfo.name.trim()) {
      currentMetadata.name = visitorInfo.name.trim();
    }

    if (visitorInfo?.email && visitorInfo.email.trim()) {
      currentMetadata.email = visitorInfo.email.trim();
    }

    const visitorMessage = await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        sender: "visitor",
        content: message.trim(),
      },
    });

    const history: ChatHistoryMessage[] = [...chatSession.messages].reverse().map((m) => ({
      role:
        m.sender === "visitor" || m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

    history.push({
      role: "user",
      content: message.trim(),
    });

    const parsedVisitorInfo: VisitorInfo = {
      name: (currentMetadata.name as string) || undefined,
      email: (currentMetadata.email as string) || undefined,
    };

    const consultantResult = await processConsultantMessage({
      messages: history,
      visitorInfo: parsedVisitorInfo,
      priorProjectState: currentMetadata.projectState as ProjectState | undefined,
    });

    const assistantReply = consultantResult.messageText;

    if (consultantResult.updatedProjectState) {
      currentMetadata.projectState = consultantResult.updatedProjectState;
    }

    if (consultantResult.estimate) {
      currentMetadata.latestEstimate = consultantResult.estimate;
    }

    // Lead Capture & Quotation Handoff: Sync lead details when email is present
    if (visitorInfo?.email && visitorInfo.email.trim()) {
      const visitorName = (visitorInfo.name ||
        currentMetadata.name ||
        "Webgent Chat Visitor") as string;
      const visitorEmail = visitorInfo.email.trim().toLowerCase();
      const activeEstimate =
        consultantResult.estimate ||
        (currentMetadata.latestEstimate as import("@/lib/services/ai-consultant/calculator").ProjectEstimateResult | undefined);

      const leadService = activeEstimate?.categoryDisplayName
        ? `${activeEstimate.categoryDisplayName} Development`
        : "AI Website Consultant Inquiry";

      const leadBudget = activeEstimate?.budgetAnalysis?.userBudgetINR
        ? `₹${activeEstimate.budgetAnalysis.userBudgetINR.toLocaleString("en-IN")}`
        : activeEstimate?.cost?.oneTimeTotalINR
          ? `₹${activeEstimate.cost.oneTimeTotalINR.toLocaleString("en-IN")} (Estimate)`
          : undefined;

      const leadNotes = activeEstimate
        ? JSON.stringify(
            {
              category: activeEstimate.categoryDisplayName,
              architecture: activeEstimate.architecture,
              timeline: activeEstimate.estimatedTimeline,
              estimatedOneTimeINR: activeEstimate.cost.oneTimeTotalINR,
              estimatedRecurringINR: activeEstimate.cost.recurringMonthlyTotalINR,
              pagesCount: activeEstimate.pages.count,
              pages: activeEstimate.pages.list.map((p) => `${p.name} (${p.slug})`),
              essentialFeatures: activeEstimate.features.essential.map((f) => f.name),
              recommendedFeatures: activeEstimate.features.recommended.map((f) => f.name),
              marketBenchmark: activeEstimate.marketBenchmark
                ? `₹${activeEstimate.marketBenchmark.marketRangeMinINR} - ₹${activeEstimate.marketBenchmark.marketRangeMaxINR} (${activeEstimate.marketBenchmark.sourceName})`
                : "None",
              assumptions: activeEstimate.assumptions,
            },
            null,
            2,
          )
        : undefined;

      try {
        const result = await syncChatLead({
          sessionId: chatSession.id,
          ownedLeadId: currentMetadata.leadId as string | undefined,
          name: visitorName,
          email: visitorEmail,
          service: leadService,
          budget: leadBudget,
          notes: leadNotes,
          message: `Latest chat inquiry: "${message}"`,
          ipAddress: ip,
          score: activeEstimate ? 75 : 60,
        });

        if (result.outcome === "created") {
          currentMetadata.leadId = result.leadId;
          waitUntil(
            notificationService
              .sendNewLeadNotification({
                id: result.leadId,
                name: visitorName,
                email: visitorEmail,
                service: leadService,
                message: `Visitor shared contact info during AI consultation.\nLatest message: "${message}"\nEstimated Total: ${
                  activeEstimate ? `₹${activeEstimate.cost.oneTimeTotalINR.toLocaleString("en-IN")}` : "N/A"
                }`,
              })
              .catch((notifyErr) =>
                logger.error("[Chat:Message] Lead notification failed", { error: String(notifyErr) }),
              ),
          );
        }
      } catch (leadErr) {
        logger.warn("[Chat:Message] Lead sync error", { error: leadErr });
      }
    }

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
          metadata: JSON.stringify(currentMetadata),
          updatedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      sessionId: chatSession.id,
      message: assistantReply,
      visitorMessageId: visitorMessage.id,
      estimate: consultantResult.estimate,
      followUpSuggestions: consultantResult.followUpSuggestions,
      categoryKey: consultantResult.categoryKey,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("[Chat:Message] Exception processing message", {
      error: errorMsg,
    });

    return NextResponse.json(
      {
        success: false,
        error:
          "We encountered an issue processing your message. Please try again or reach out at /contact.",
      },
      { status: 500 },
    );
  }
}

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
import { z } from "zod";

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
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json().catch(() => ({}));
    const validated = postMessageSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: validated.error.errors[0]?.message || "Invalid request",
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
        messages: {
          orderBy: { createdAt: "asc" },
          take: 20,
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        {
          success: false,
          error: "Chat session not found. Please start a new session.",
        },
        { status: 404 },
      );
    }

    if (chatSession.status === "CLOSED" || chatSession.status === "ARCHIVED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This chat conversation has concluded. Please start a new session to continue chatting.",
        },
        { status: 400 },
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

    const hadPriorEmail = Boolean(currentMetadata.email);
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

    const history: ChatHistoryMessage[] = chatSession.messages.map((m) => ({
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
      const visitorEmail = visitorInfo.email.trim();
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
        const existingLead = await prisma.lead.findFirst({
          where: {
            email: visitorEmail,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
          orderBy: { createdAt: "desc" },
        });

        if (existingLead) {
          await prisma.lead.update({
            where: { id: existingLead.id },
            data: {
              name: visitorName || existingLead.name,
              service: leadService,
              budget: leadBudget || existingLead.budget,
              notes: leadNotes || existingLead.notes,
              message: `${existingLead.message}\n---\nLatest Inquiry: "${message}"`,
              updatedAt: new Date(),
            },
          });
        } else {
          await prisma.lead.create({
            data: {
              name: visitorName,
              email: visitorEmail,
              service: leadService,
              budget: leadBudget,
              notes: leadNotes,
              message: `Captured via AI Consultant chat. Latest inquiry: "${message}"`,
              ipAddress: ip,
              status: "NEW",
              score: activeEstimate ? 75 : 60,
            },
          });

          if (!hadPriorEmail) {
            await notificationService.sendNewLeadNotification({
              id: `chat_${chatSession.id}`,
              name: visitorName,
              email: visitorEmail,
              service: leadService,
              message: `Visitor shared contact info during AI consultation.\nLatest message: "${message}"\nEstimated Total: ${
                activeEstimate ? `₹${activeEstimate.cost.oneTimeTotalINR.toLocaleString("en-IN")}` : "N/A"
              }`,
            });
          }
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

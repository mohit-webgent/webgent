import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { contactFormSchema } from "@/lib/validations/contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { calculateLeadScore } from "@/lib/leads/scoring";
import { notificationService } from "@/lib/services/notifications";
import { logger } from "@/lib/logger";

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export async function POST(req: NextRequest) {
  try {
    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    // 1. Enforce Rate Limiting (3 submissions per IP per 1 hour)
    const rateLimit = await checkRateLimit(`contact:${ipAddress}`, 3, 60 * 60 * 1000);
    if (!rateLimit.success) {
      logger.warn("Contact form rate limit exceeded", { ipAddress });
      return ApiResponse.tooManyRequests(
        "Submission limit reached. You can submit a maximum of 3 inquiries per hour."
      );
    }

    // 2. Parse JSON body
    const body = await req.json().catch(() => ({}));

    // 3. Server-side Zod validation
    const validation = contactFormSchema.safeParse(body);
    if (!validation.success) {
      return ApiResponse.validationError(
        "Validation failed for contact submission",
        validation.error.flatten().fieldErrors
      );
    }

    const { name, email, phone, company, service, budget, message, turnstileToken } =
      validation.data;

    // 4. Cloudflare Turnstile token verification
    const turnstileResult = await verifyTurnstileToken(turnstileToken, ipAddress);
    if (!turnstileResult.success) {
      return ApiResponse.badRequest(
        turnstileResult.error || "Turnstile security check failed.",
        "TURNSTILE_FAILED"
      );
    }

    // 5. Calculate lead score
    const score = calculateLeadScore({
      name,
      email,
      phone,
      company,
      service,
      budget,
      message,
    });

    // 6. Save Lead record in PostgreSQL database
    const lead = await prisma.lead.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        company: company || null,
        service: service || null,
        budget: budget || null,
        message,
        status: "NEW",
        score,
        ipAddress,
        userAgent,
      },
    });

    logger.info("New lead created successfully", { leadId: lead.id, score });

    // 7. Invoke notification service: WhatsApp / Slack / Email asynchronously
    notificationService.sendNewLeadNotification(lead).catch((err) => {
      logger.error("Failed to dispatch new lead notification", {
        leadId: lead.id,
        error: err instanceof Error ? err.message : String(err),
      });
    });

    // 8. Return success response
    return ApiResponse.success(
      {
        message: "Thank you for contacting us! We have received your message and will respond promptly.",
        leadId: lead.id,
      },
      201
    );
  } catch (error) {
    logger.error("Error creating contact lead", { error: String(error) });
    return ApiResponse.internalError("Failed to process contact submission due to a server error.");
  }
}

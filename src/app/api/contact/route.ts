import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { contactFormSchema } from "@/lib/validations/contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { calculateLeadScore } from "@/lib/leads/scoring";
import { notificationService } from "@/lib/services/notifications";
import { logger } from "@/lib/logger";
import { waitUntil } from "@vercel/functions";
import { getClientIp } from "@/lib/client-ip";

const CONTACT_LIMIT_PER_EMAIL = 3;
const CONTACT_LIMIT_PER_IP = 10;
const CONTACT_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const ipAddress = getClientIp(req.headers);
    const userAgent = req.headers.get("user-agent") || undefined;

    const body = await req.json().catch(() => ({}));

    const validation = contactFormSchema.safeParse(body);
    if (!validation.success) {
      return ApiResponse.validationError(
        "Validation failed for contact submission",
        validation.error.flatten().fieldErrors,
      );
    }

    const { name, email, phone, company, service, budget, message, turnstileToken } =
      validation.data;

    const turnstileResult = await verifyTurnstileToken(turnstileToken, ipAddress);
    if (!turnstileResult.success) {
      return ApiResponse.badRequest(
        turnstileResult.error || "Turnstile security check failed.",
        "TURNSTILE_FAILED",
      );
    }

    // Limits are checked only after validation and Turnstile, so typos and failed checks don't use
    // up anyone's allowance. Each sender gets 3 enquiries an hour. The per-IP cap is looser because
    // a home Wi-Fi, an office or a mobile network can put many genuine visitors behind one address.
    const senderLimit = await checkRateLimit(
      `contact:email:${email.toLowerCase()}`,
      CONTACT_LIMIT_PER_EMAIL,
      CONTACT_LIMIT_WINDOW_MS,
    );
    if (!senderLimit.success) {
      logger.warn("Contact form limit reached for sender", { ipAddress });
      return ApiResponse.tooManyRequests(
        "You've already sent 3 enquiries in the last hour. Please wait a little before sending another, or message us on WhatsApp.",
      );
    }

    const networkLimit = await checkRateLimit(
      `contact:ip:${ipAddress}`,
      CONTACT_LIMIT_PER_IP,
      CONTACT_LIMIT_WINDOW_MS,
    );
    if (!networkLimit.success) {
      logger.warn("Contact form limit reached for network", { ipAddress });
      return ApiResponse.tooManyRequests(
        "Too many enquiries have come from your network in the last hour. Please try again later, or message us on WhatsApp.",
      );
    }

    const score = calculateLeadScore({
      name,
      email,
      phone,
      company,
      service,
      budget,
      message,
    });

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

    // waitUntil keeps the serverless function alive until alerts finish, without delaying the visitor.
    waitUntil(
      notificationService.sendNewLeadNotification(lead).catch((err) => {
        logger.error("Failed to dispatch new lead notification", {
          leadId: lead.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }),
    );

    return ApiResponse.success(
      {
        message:
          "Thank you for contacting us! We have received your message and will respond promptly.",
        leadId: lead.id,
      },
      201,
    );
  } catch (error) {
    logger.error("Error creating contact lead", { error: String(error) });
    return ApiResponse.internalError("Failed to process contact submission due to a server error.");
  }
}

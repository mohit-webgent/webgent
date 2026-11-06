import { NextRequest } from "next/server";
import { waitUntil } from "@vercel/functions";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { emailService } from "@/lib/services/email";
import { SubscriberStatus } from "@prisma/client";
import { logger } from "@/lib/logger";
import { renderActionPage, renderStatusPage } from "@/lib/newsletter/status-page";

const wantsHtml = (req: NextRequest) => (req.headers.get("accept") || "").includes("text/html");
const readToken = (req: NextRequest) => new URL(req.url).searchParams.get("token")?.trim();

/** Shows a confirmation page. Opening the link changes nothing, because email scanners open links too. */
export async function GET(req: NextRequest) {
  const token = readToken(req);

  if (!token) {
    return renderStatusPage(
      "Missing Token",
      "Unsubscribe token is missing. Please use the link provided in your newsletter email.",
      false,
    );
  }

  return renderActionPage({
    title: "Unsubscribe from Webgent?",
    message: "You will stop receiving the Webgent newsletter. You can subscribe again at any time.",
    action: `/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`,
    buttonLabel: "Unsubscribe",
  });
}

export async function POST(req: NextRequest) {
  const html = wantsHtml(req);

  try {
    const token = readToken(req);

    if (!token) {
      return html
        ? renderStatusPage(
            "Missing Token",
            "Unsubscribe token is missing. Please use the link provided in your newsletter email.",
            false,
          )
        : ApiResponse.badRequest("Unsubscribe token is required.", "MISSING_TOKEN");
    }

    const subscriber = await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } });

    if (!subscriber) {
      return html
        ? renderStatusPage(
            "Invalid Link",
            "We could not find an active subscription associated with this unsubscribe link.",
            false,
          )
        : ApiResponse.notFound("Invalid or expired unsubscribe token.");
    }

    if (subscriber.status === SubscriberStatus.UNSUBSCRIBED) {
      return html
        ? renderStatusPage(
            "Already Unsubscribed",
            "You have already been unsubscribed from our newsletter. No further emails will be sent.",
            true,
          )
        : ApiResponse.success({
            status: "ALREADY_UNSUBSCRIBED",
            message: "You are already unsubscribed from our newsletter.",
          });
    }

    const updated = await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: SubscriberStatus.UNSUBSCRIBED,
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    logger.info("Subscriber unsubscribed successfully", { subscriberId: updated.id });

    waitUntil(emailService.sendNewsletterUnsubscribed({ email: updated.email }).catch(() => {}));

    return html
      ? renderStatusPage(
          "Unsubscribed Successfully",
          `Your email (${updated.email}) has been removed from our mailing list. We're sorry to see you go!`,
          true,
        )
      : ApiResponse.success({
          status: "UNSUBSCRIBED",
          message: "You have been successfully unsubscribed from the Webgent newsletter.",
          email: updated.email,
        });
  } catch (error) {
    logger.error("Error during newsletter unsubscription", { error: String(error) });
    return ApiResponse.internalError("Failed to process unsubscribe request.");
  }
}

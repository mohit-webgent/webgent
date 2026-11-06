import { NextRequest } from "next/server";

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
      "Confirmation token is missing. Please check the link from your confirmation email.",
      false,
    );
  }

  return renderActionPage({
    title: "Confirm your subscription",
    message: "Press the button below to start receiving the Webgent newsletter.",
    action: `/api/newsletter/confirm?token=${encodeURIComponent(token)}`,
    buttonLabel: "Confirm subscription",
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
            "Confirmation token is missing. Please check the link from your confirmation email.",
            false,
          )
        : ApiResponse.badRequest("Confirmation token is required.", "MISSING_TOKEN");
    }

    const subscriber = await prisma.subscriber.findUnique({ where: { confirmationToken: token } });

    if (!subscriber) {
      return html
        ? renderStatusPage(
            "Invalid Link",
            "This confirmation link is invalid or has already been used. If you're not subscribed, please try subscribing again.",
            false,
          )
        : ApiResponse.badRequest("Invalid or already used confirmation token.", "INVALID_TOKEN");
    }

    if (subscriber.tokenExpiresAt && subscriber.tokenExpiresAt < new Date()) {
      return html
        ? renderStatusPage(
            "Link Expired",
            "Your confirmation link has expired (links are valid for 24 hours). Please subscribe again to receive a new link.",
            false,
          )
        : ApiResponse.badRequest("Confirmation token has expired. Please subscribe again.", "TOKEN_EXPIRED");
    }

    const updatedSubscriber = await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: SubscriberStatus.ACTIVE,
        isActive: true,
        subscribedAt: new Date(),
        confirmationToken: null,
        tokenExpiresAt: null,
      },
    });

    await emailService.sendNewsletterWelcome(
      updatedSubscriber.email,
      updatedSubscriber.name,
      updatedSubscriber.unsubscribeToken,
    );

    logger.info("Subscriber confirmed successfully", { subscriberId: updatedSubscriber.id });

    return html
      ? renderStatusPage(
          "Subscription Confirmed!",
          `Welcome aboard${updatedSubscriber.name ? `, ${updatedSubscriber.name}` : ""}! You'll now receive our engineering and product updates.`,
          true,
        )
      : ApiResponse.success({
          status: "CONFIRMED",
          message: "Subscription confirmed successfully! Thank you for subscribing.",
          subscriber: {
            id: updatedSubscriber.id,
            email: updatedSubscriber.email,
            name: updatedSubscriber.name,
            status: updatedSubscriber.status,
            subscribedAt: updatedSubscriber.subscribedAt,
          },
        });
  } catch (error) {
    logger.error("Error during newsletter confirmation", { error: String(error) });
    return ApiResponse.internalError("Failed to confirm subscription.");
  }
}

import { NextRequest } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { newsletterSubscribeSchema } from "@/lib/validations/newsletter";
import { emailService } from "@/lib/services/email";
import { SubscriberStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

const TOKEN_EXPIRY_HOURS = 24;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validation = newsletterSubscribeSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid subscription input",
        validation.error.flatten().fieldErrors,
      );
    }

    const { email, name } = validation.data;

    const existing = await prisma.subscriber.findUnique({
      where: { email },
    });

    const now = new Date();
    const tokenExpiresAt = new Date(now.getTime() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    const confirmationToken = crypto.randomBytes(32).toString("hex");
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");

    if (existing) {
      if (existing.status === SubscriberStatus.ACTIVE) {
        return ApiResponse.success({
          status: "ALREADY_SUBSCRIBED",
          message: "You are already an active subscriber to the Webgent newsletter.",
        });
      }

      if (existing.status === SubscriberStatus.PENDING) {
        await prisma.subscriber.update({
          where: { id: existing.id },
          data: {
            name: name || existing.name,
            confirmationToken,
            tokenExpiresAt,
          },
        });

        await emailService.sendNewsletterConfirmation(
          email,
          confirmationToken,
          name || existing.name,
        );

        logger.info("Re-sent newsletter confirmation email for pending subscriber", {
          subscriberId: existing.id,
          email,
        });

        return ApiResponse.success({
          status: "CONFIRMATION_RESENT",
          message:
            "A fresh confirmation link has been sent to your email. Please check your inbox.",
        });
      }

      if (existing.status === SubscriberStatus.UNSUBSCRIBED) {
        await prisma.subscriber.update({
          where: { id: existing.id },
          data: {
            name: name || existing.name,
            status: SubscriberStatus.PENDING,
            isActive: false,
            confirmationToken,
            tokenExpiresAt,
            unsubscribedAt: null,
          },
        });

        await emailService.sendNewsletterConfirmation(
          email,
          confirmationToken,
          name || existing.name,
        );

        logger.info("Sent re-activation confirmation email to previously unsubscribed user", {
          subscriberId: existing.id,
          email,
        });

        return ApiResponse.success({
          status: "CONFIRMATION_SENT",
          message:
            "Welcome back! A confirmation email has been sent. Please confirm your subscription.",
        });
      }
    }

    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        name: name || null,
        status: SubscriberStatus.PENDING,
        isActive: false,
        confirmationToken,
        tokenExpiresAt,
        unsubscribeToken,
      },
    });

    await emailService.sendNewsletterConfirmation(email, confirmationToken, name);

    logger.info("New subscriber registered in PENDING state", {
      subscriberId: subscriber.id,
      email,
    });

    return ApiResponse.success(
      {
        status: "PENDING_CONFIRMATION",
        message: "Thank you for subscribing! Please check your email to confirm your subscription.",
      },
      201,
    );
  } catch (error) {
    logger.error("Error processing newsletter subscription", {
      error: String(error),
    });
    return ApiResponse.internalError("Failed to process subscription. Please try again later.");
  }
}

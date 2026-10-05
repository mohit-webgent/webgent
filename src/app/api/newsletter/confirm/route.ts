import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { emailService } from "@/lib/services/email";
import { SubscriberStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token")?.trim();
    const acceptHeader = req.headers.get("accept") || "";
    const isHtmlRequest = acceptHeader.includes("text/html");

    if (!token) {
      if (isHtmlRequest) {
        return renderHtmlStatusPage({
          title: "Missing Token",
          message:
            "Confirmation token is missing. Please check the link from your confirmation email.",
          isSuccess: false,
        });
      }
      return ApiResponse.badRequest("Confirmation token is required.", "MISSING_TOKEN");
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { confirmationToken: token },
    });

    if (!subscriber) {
      if (isHtmlRequest) {
        return renderHtmlStatusPage({
          title: "Invalid Token",
          message:
            "This confirmation link is invalid or has already been used. If you're not subscribed, please try subscribing again.",
          isSuccess: false,
        });
      }
      return ApiResponse.badRequest("Invalid or already used confirmation token.", "INVALID_TOKEN");
    }

    if (subscriber.tokenExpiresAt && subscriber.tokenExpiresAt < new Date()) {
      if (isHtmlRequest) {
        return renderHtmlStatusPage({
          title: "Token Expired",
          message:
            "Your confirmation link has expired (links are valid for 24 hours). Please subscribe again to receive a new link.",
          isSuccess: false,
        });
      }
      return ApiResponse.badRequest(
        "Confirmation token has expired. Please subscribe again.",
        "TOKEN_EXPIRED",
      );
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

    logger.info("Subscriber confirmed successfully", {
      subscriberId: updatedSubscriber.id,
      email: updatedSubscriber.email,
    });

    if (isHtmlRequest) {
      return renderHtmlStatusPage({
        title: "Subscription Confirmed!",
        message: `Welcome aboard${updatedSubscriber.name ? `, ${updatedSubscriber.name}` : ""}! Your subscription is now verified. You'll receive our best engineering and product updates.`,
        isSuccess: true,
      });
    }

    return ApiResponse.success({
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
    logger.error("Error during newsletter confirmation", {
      error: String(error),
    });
    return ApiResponse.internalError("Failed to confirm subscription.");
  }
}

function renderHtmlStatusPage({
  title,
  message,
  isSuccess,
}: {
  title: string;
  message: string;
  isSuccess: boolean;
}) {
  const iconSvg = isSuccess
    ? `<svg class="w-16 h-16 text-emerald-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
    : `<svg class="w-16 h-16 text-rose-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title} — Webgent</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
        <div class="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
          <div class="mb-6 p-4 ${isSuccess ? "bg-emerald-500/10" : "bg-rose-500/10"} rounded-2xl w-24 h-24 mx-auto flex items-center justify-center border ${isSuccess ? "border-emerald-500/20" : "border-rose-500/20"}">
            ${iconSvg}
          </div>
          <h1 class="text-2xl font-extrabold text-white mb-3 tracking-tight">${title}</h1>
          <p class="text-slate-400 text-sm leading-relaxed mb-8">${message}</p>
          <a href="/" class="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30">
            Return to Homepage
          </a>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    status: isSuccess ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

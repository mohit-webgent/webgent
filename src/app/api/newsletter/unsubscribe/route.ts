import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { emailService } from "@/lib/services/email";
import { SubscriberStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

/**
 * Public Newsletter Unsubscribe Endpoint
 * GET /api/newsletter/unsubscribe?token=xxx
 * 
 * Safely unsubscribes the user using a secure token.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token")?.trim();
    const acceptHeader = req.headers.get("accept") || "";
    const isHtmlRequest = acceptHeader.includes("text/html");

    if (!token) {
      if (isHtmlRequest) {
        return renderUnsubscribeHtml({
          title: "Missing Token",
          message: "Unsubscribe token is missing. Please use the link provided in your newsletter email.",
          isSuccess: false,
        });
      }
      return ApiResponse.badRequest("Unsubscribe token is required.", "MISSING_TOKEN");
    }

    // Locate subscriber by unsubscribe token or confirmation token
    const subscriber = await prisma.subscriber.findFirst({
      where: {
        OR: [
          { unsubscribeToken: token },
          { confirmationToken: token },
        ],
      },
    });

    if (!subscriber) {
      if (isHtmlRequest) {
        return renderUnsubscribeHtml({
          title: "Invalid Token",
          message: "We could not find an active subscription associated with this unsubscribe link.",
          isSuccess: false,
        });
      }
      return ApiResponse.notFound("Invalid or expired unsubscribe token.");
    }

    // If already unsubscribed
    if (subscriber.status === SubscriberStatus.UNSUBSCRIBED) {
      if (isHtmlRequest) {
        return renderUnsubscribeHtml({
          title: "Already Unsubscribed",
          message: "You have already been unsubscribed from our newsletter. No further emails will be sent.",
          isSuccess: true,
        });
      }
      return ApiResponse.success({
        status: "ALREADY_UNSUBSCRIBED",
        message: "You are already unsubscribed from our newsletter.",
      });
    }

    // Mark as unsubscribed
    const updated = await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: SubscriberStatus.UNSUBSCRIBED,
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    logger.info("Subscriber unsubscribed successfully", {
      subscriberId: updated.id,
      email: updated.email,
    });

    // Asynchronously dispatch farewell email (safely caught)
    emailService.sendNewsletterUnsubscribed({ email: updated.email }).catch(() => {});

    if (isHtmlRequest) {
      return renderUnsubscribeHtml({
        title: "Unsubscribed Successfully",
        message: `Your email (${updated.email}) has been removed from our active mailing list. We're sorry to see you go!`,
        isSuccess: true,
      });
    }

    return ApiResponse.success({
      status: "UNSUBSCRIBED",
      message: "You have been successfully unsubscribed from the Webgent newsletter.",
      email: updated.email,
    });
  } catch (error) {
    logger.error("Error during newsletter unsubscription", { error: String(error) });
    return ApiResponse.internalError("Failed to process unsubscribe request.");
  }
}

function renderUnsubscribeHtml({
  title,
  message,
  isSuccess,
}: {
  title: string;
  message: string;
  isSuccess: boolean;
}) {
  const iconSvg = isSuccess
    ? `<svg class="w-16 h-16 text-indigo-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    : `<svg class="w-16 h-16 text-rose-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;

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
          <div class="mb-6 p-4 ${isSuccess ? "bg-indigo-500/10" : "bg-rose-500/10"} rounded-2xl w-24 h-24 mx-auto flex items-center justify-center border ${isSuccess ? "border-indigo-500/20" : "border-rose-500/20"}">
            ${iconSvg}
          </div>
          <h1 class="text-2xl font-extrabold text-white mb-3 tracking-tight">${title}</h1>
          <p class="text-slate-400 text-sm leading-relaxed mb-8">${message}</p>
          <a href="/" class="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700">
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

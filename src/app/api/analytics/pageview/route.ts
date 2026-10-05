import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analytics";
import { pageViewSchema } from "@/lib/validations/analytics";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/analytics/pageview
 * Public endpoint to track page views
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Abuse protection: Rate limit per IP
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const rateCheck = await checkRateLimit(`pageview_${clientIp}`, 120, 60 * 1000);

    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: { message: "Too many requests. Please slow down." } },
        { status: 429 }
      );
    }

    // 2. Validate payload
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: { message: "Invalid request payload." } },
        { status: 400 }
      );
    }

    const validation = pageViewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Validation failed",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // 3. Record pageview
    const { pageView, context } = await analyticsService.recordPageView(req, validation.data);

    // 4. Return response and ensure session cookie is present
    const response = NextResponse.json(
      {
        success: true,
        data: {
          id: pageView.id,
          sessionId: context.sessionId,
          path: pageView.path,
        },
      },
      { status: 201 }
    );

    // Set secure anonymous session cookie if client doesn't already have one
    if (context.isNewSession || !req.cookies.get("webgent_sid")) {
      response.cookies.set("webgent_sid", context.sessionId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    logger.error("Failed to record pageview", { error });
    return NextResponse.json(
      { success: false, error: { message: "Failed to process pageview." } },
      { status: 500 }
    );
  }
}

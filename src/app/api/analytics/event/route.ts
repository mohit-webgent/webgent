import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analytics";
import { eventSchema } from "@/lib/validations/analytics";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/analytics/event
 * Public endpoint to track custom user events (FORM_START, CTA_CLICK, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Abuse protection: Rate limit per IP
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const rateCheck = await checkRateLimit(`event_${clientIp}`, 120, 60 * 1000);

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

    const validation = eventSchema.safeParse(body);
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

    // 3. Record event
    const { event, context } = await analyticsService.recordEvent(req, validation.data);

    // 4. Return response and ensure session cookie is set
    const response = NextResponse.json(
      {
        success: true,
        data: {
          id: event.id,
          name: event.name,
          sessionId: context.sessionId,
        },
      },
      { status: 201 }
    );

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
    logger.error("Failed to record analytics event", { error });
    return NextResponse.json(
      { success: false, error: { message: "Failed to process analytics event." } },
      { status: 500 }
    );
  }
}

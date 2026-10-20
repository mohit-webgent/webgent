import { NextResponse } from "next/server";
import { getSiteFaqs } from "@/lib/services/cms";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/faqs
 * Public endpoint delivering sanitized and published FAQs for client-side components and integrations.
 */
export async function GET() {
  try {
    const data = await getSiteFaqs({ publishedOnly: true });
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("[Public FAQs API] Failed to fetch public FAQs", { error });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve public FAQs.",
      },
      { status: 500 },
    );
  }
}

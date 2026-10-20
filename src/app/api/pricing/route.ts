import { NextRequest, NextResponse } from "next/server";
import { getPricingData, savePricingOverrides } from "@/lib/services/pricing";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPricingData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to fetch pricing data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve pricing data." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    const body = await req.json();
    const result = await savePricingOverrides(body);
    return NextResponse.json({ success: true, updated: true, data: result.data, meta: result.meta });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed: Invalid pricing data.", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error("Failed to update pricing overrides:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save pricing overrides." },
      { status: 500 },
    );
  }
}

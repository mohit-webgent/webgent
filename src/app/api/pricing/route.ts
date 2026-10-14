import { NextRequest, NextResponse } from "next/server";
import { getPricingData } from "@/lib/services/pricing";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPricingData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to fetch pricing data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve pricing data." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin privileges required to update pricing rates." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    // Upsert pricing_overrides in site_settings
    const setting = await prisma.siteSetting.upsert({
      where: { key: "pricing_overrides" },
      update: {
        value: JSON.stringify(body),
        updatedAt: new Date(),
      },
      create: {
        key: "pricing_overrides",
        value: JSON.stringify(body),
        description: "Custom pricing rates and configurator catalog overrides",
        isPublic: true,
      },
    });

    return NextResponse.json({ success: true, updated: true, setting });
  } catch (error) {
    console.error("Failed to update pricing overrides:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save pricing overrides." },
      { status: 500 }
    );
  }
}

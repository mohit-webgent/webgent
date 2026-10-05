import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";

const updateSettingsSchema = z.record(z.string());

const DEFAULT_SETTINGS: Record<string, { value: string; description: string; isPublic: boolean }> =
  {
    site_name: {
      value: "Webgent",
      description: "Official Site Name",
      isPublic: true,
    },
    site_tagline: {
      value: "Next-Gen Web Solutions & Engineering",
      description: "Hero Tagline",
      isPublic: true,
    },
    logo_url: { value: "", description: "Brand Logo URL", isPublic: true },
    contact_email: {
      value: "hello@webgent.com",
      description: "Primary Inbound Contact Email",
      isPublic: true,
    },
    contact_phone: {
      value: "+1 (800) 555-WEBGENT",
      description: "Support Phone Number",
      isPublic: true,
    },
    office_address: {
      value: "548 Market St, Suite 342, San Francisco, CA 94104",
      description: "Physical Headquarters Address",
      isPublic: true,
    },
    business_hours: {
      value: "Mon - Fri: 9:00 AM - 6:00 PM PST",
      description: "Operating Hours",
      isPublic: true,
    },
    github_url: {
      value: "https://github.com/mohit-webgent/webgent",
      description: "Official GitHub Repository / Organization",
      isPublic: true,
    },
    twitter_url: {
      value: "https://twitter.com/webgent",
      description: "Twitter / X Profile",
      isPublic: true,
    },
    linkedin_url: {
      value: "https://linkedin.com/company/webgent",
      description: "LinkedIn Company Profile",
      isPublic: true,
    },
    discord_url: {
      value: "https://discord.gg/webgent",
      description: "Community Discord Server",
      isPublic: true,
    },
    enable_ai_chat: {
      value: "true",
      description: "Enable visitor AI assistant and live chat widget",
      isPublic: true,
    },
    enable_newsletter_double_optin: {
      value: "true",
      description: "Require email token confirmation for newsletter subscriptions",
      isPublic: false,
    },
    maintenance_mode: {
      value: "false",
      description: "Render maintenance banner on public routes",
      isPublic: true,
    },
    analytics_tracking: {
      value: "true",
      description: "Collect client-side page views and interaction telemetry",
      isPublic: true,
    },
    default_meta_title: {
      value: "Webgent — Elite Web Engineering & Digital Transformation",
      description: "Default SEO Title Tag",
      isPublic: true,
    },
    default_meta_description: {
      value:
        "Webgent delivers cutting-edge web applications, architectural consulting, and high-performance digital systems for ambitious brands.",
      description: "Default SEO Meta Description",
      isPublic: true,
    },
    google_analytics_id: {
      value: "G-XXXXXXXXXX",
      description: "Google Analytics 4 Measurement ID",
      isPublic: true,
    },
  };

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const existing = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};

    for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
      settingsMap[key] = def.value;
    }

    for (const item of existing) {
      settingsMap[item.key] = item.value;
    }

    return NextResponse.json({
      success: true,
      data: settingsMap,
    });
  } catch (error) {
    logger.error("Failed to fetch admin site settings", { error });
    return NextResponse.json({ success: false, error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = updateSettingsSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Invalid settings payload" },
        { status: 400 },
      );
    }

    const updates = validated.data;

    await prisma.$transaction(
      Object.entries(updates).map(([key, value]) => {
        const def = DEFAULT_SETTINGS[key] || {
          description: key,
          isPublic: false,
        };
        return prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: {
            key,
            value: String(value),
            description: def.description,
            isPublic: def.isPublic,
          },
        });
      }),
    );

    return NextResponse.json({
      success: true,
      message: "Site settings saved successfully",
    });
  } catch (error) {
    logger.error("Failed to update site settings", { error });
    return NextResponse.json({ success: false, error: "Failed to save settings" }, { status: 500 });
  }
}

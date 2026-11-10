import { NextRequest, NextResponse } from "next/server";
import { verifyStrictAdminApiAccess } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import {
  DEFAULT_HERO_CONTENT,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_NAVIGATION_MENU,
  DEFAULT_FOOTER_CONFIG,
  DEFAULT_SITE_FAQS,
  invalidateCmsCache,
} from "@/lib/services/cms";

const updateSettingsSchema = z.record(z.string(), z.string());

const DEFAULT_SETTINGS: Record<string, { value: string; description: string; isPublic: boolean }> =
  {
    contact_email: {
      value: "mohitvermag75@gmail.com",
      description: "Primary Inbound Contact Email",
      isPublic: true,
    },
    contact_phone: {
      value: "+91 8800241462",
      description: "Support Phone Number",
      isPublic: true,
    },
    office_address: {
      value: "Gurugram / Noida, India",
      description: "Physical Headquarters Address",
      isPublic: true,
    },
    business_hours: {
      value: "Replies by email or WhatsApp",
      description: "Operating Hours",
      isPublic: true,
    },
    github_url: {
      value: "https://github.com/mohitvermag",
      description: "Official GitHub Repository / Organization",
      isPublic: true,
    },
    twitter_url: {
      value: "",
      description: "Twitter / X Profile",
      isPublic: true,
    },
    linkedin_url: {
      value: "https://linkedin.com/in/webmohitverma",
      description: "LinkedIn Company Profile",
      isPublic: true,
    },
    discord_url: {
      value: "",
      description: "Community Discord Server",
      isPublic: true,
    },
    enable_ai_chat: {
      value: "true",
      description: "Show the AI consultant on the website",
      isPublic: true,
    },
    maintenance_mode: {
      value: "false",
      description: "Replace public pages with a maintenance screen (the admin console stays available)",
      isPublic: true,
    },
    home_hero_content: {
      value: JSON.stringify(DEFAULT_HERO_CONTENT),
      description: "Homepage Hero Section Configuration",
      isPublic: true,
    },
    home_sections_config: {
      value: JSON.stringify(DEFAULT_HOME_SECTIONS),
      description: "Homepage Sections Ordering and Visibility",
      isPublic: true,
    },
    navigation_menu: {
      value: JSON.stringify(DEFAULT_NAVIGATION_MENU),
      description: "Main Header Navigation Items",
      isPublic: true,
    },
    footer_links: {
      value: JSON.stringify(DEFAULT_FOOTER_CONFIG),
      description: "Footer Links and Stack Configuration",
      isPublic: true,
    },
    site_faqs: {
      value: JSON.stringify(DEFAULT_SITE_FAQS),
      description: "Site-wide Frequently Asked Questions",
      isPublic: true,
    },
  };

export async function GET() {
  const authGuard = await verifyStrictAdminApiAccess();
  if (authGuard instanceof Response) {
    return authGuard;
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
  const authGuard = await verifyStrictAdminApiAccess();
  if (authGuard instanceof Response) {
    return authGuard;
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

    // Invalidate CMS cache and trigger Next.js ISR path revalidations
    await invalidateCmsCache();
    // The AI chat and maintenance switches change every public page, not only the CMS ones.
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: "Site settings saved successfully",
    });
  } catch (error) {
    logger.error("Failed to update site settings", { error });
    return NextResponse.json({ success: false, error: "Failed to save settings" }, { status: 500 });
  }
}

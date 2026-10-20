import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import {
  getHomepageHeroContent,
  getHomepageSectionsConfig,
  invalidateCmsCache,
  homePageContentUpdateSchema,
  sanitizeText,
  type HomeHeroContent,
  type HomeSectionItem,
  type HomeSectionId,
} from "@/lib/services/cms";

// ============================================================================
// API ENDPOINTS
// ============================================================================

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/pages
 * Returns current homepage hero content and section ordering
 */
export async function GET() {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    const [hero, sectionsConfig] = await Promise.all([
      getHomepageHeroContent(),
      getHomepageSectionsConfig(),
    ]);

    return ApiResponse.success({
      hero,
      sections: sectionsConfig.sections,
    });
  } catch (error) {
    logger.error("[Admin Pages API] Failed to fetch homepage CMS settings", { error });
    return ApiResponse.internalError("Failed to load homepage content configuration.");
  }
}

/**
 * PUT /api/admin/pages
 * Validates, sanitizes, and persists homepage CMS settings to PostgreSQL SiteSetting
 * and triggers automated Redis cache purge & Next.js ISR revalidation.
 */
export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminApiAccess();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    const rawBody = await req.json();
    const validation = homePageContentUpdateSchema.safeParse(rawBody);

    if (!validation.success) {
      const formattedErrors = validation.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return ApiResponse.badRequest("Validation failed for homepage content", "VALIDATION_ERROR", formattedErrors);
    }

    const { hero, sections } = validation.data;

    // Sanitize text inputs
    const sanitizedHero: HomeHeroContent = {
      eyebrow: sanitizeText(hero.eyebrow),
      headlineLine1: sanitizeText(hero.headlineLine1),
      headlineLine2: sanitizeText(hero.headlineLine2),
      headlineLine3: sanitizeText(hero.headlineLine3),
      subheadline: sanitizeText(hero.subheadline),
      primaryCtaText: sanitizeText(hero.primaryCtaText),
      primaryCtaLink: hero.primaryCtaLink.trim(),
      secondaryCtaText: sanitizeText(hero.secondaryCtaText),
      secondaryCtaLink: hero.secondaryCtaLink.trim(),
    };

    // Sort and ensure sequential order of sections
    const sortedSections: HomeSectionItem[] = [...sections]
      .sort((a, b) => a.order - b.order)
      .map((sec, idx) => ({
        id: sec.id as HomeSectionId,
        enabled: sec.enabled,
        order: idx + 1,
      }));

    // Atomically persist to SiteSetting
    await prisma.$transaction([
      prisma.siteSetting.upsert({
        where: { key: "home_hero_content" },
        update: {
          value: JSON.stringify(sanitizedHero),
          isPublic: true,
          description: "Homepage Hero Section Configuration",
        },
        create: {
          key: "home_hero_content",
          value: JSON.stringify(sanitizedHero),
          isPublic: true,
          description: "Homepage Hero Section Configuration",
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: "home_sections_config" },
        update: {
          value: JSON.stringify({ sections: sortedSections }),
          isPublic: true,
          description: "Homepage Sections Ordering and Visibility",
        },
        create: {
          key: "home_sections_config",
          value: JSON.stringify({ sections: sortedSections }),
          isPublic: true,
          description: "Homepage Sections Ordering and Visibility",
        },
      }),
    ]);

    // Purge CMS Redis cache and revalidate homepage
    const cacheResult = await invalidateCmsCache({
      keys: ["HERO", "HOME_SECTIONS"],
      paths: ["/"],
    });

    const cacheRefreshed = cacheResult.errors.length === 0;

    logger.info("[Admin Pages API] Successfully saved homepage content", {
      invalidatedKeys: cacheResult.invalidatedKeys,
      revalidatedPaths: cacheResult.revalidatedPaths,
      cacheRefreshed,
      cacheErrors: cacheResult.errors,
    });

    const statusMessage = cacheRefreshed
      ? "Homepage content updated and public cache revalidated successfully"
      : "Homepage content saved to database. Public cache revalidation encountered warnings; changes will propagate momentarily.";

    return ApiResponse.success(
      {
        hero: sanitizedHero,
        sections: sortedSections,
      },
      200,
      {
        message: statusMessage,
        cacheRefreshed,
        cacheErrors: cacheResult.errors.length > 0 ? cacheResult.errors : undefined,
      },
    );
  } catch (error) {
    logger.error("[Admin Pages API] Error saving homepage content", { error });
    return ApiResponse.internalError("Failed to save homepage content updates.");
  }
}

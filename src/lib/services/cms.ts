import { prisma } from "@/lib/db";
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

import {
  HomeHeroContent,
  HomeSectionId,
  HomeSectionItem,
  HomeSectionsConfig,
  NavItem,
  NavigationMenuConfig,
  FooterLinkItem,
  FooterConfig,
  ContactInfo,
  SiteFaqItem,
  SiteFaqsConfig,
  DEFAULT_HERO_CONTENT,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_NAVIGATION_MENU,
  DEFAULT_FOOTER_CONFIG,
  DEFAULT_CONTACT_INFO,
  DEFAULT_SITE_FAQS,
  CMS_CACHE_KEYS,
  CMS_CACHE_TTL_SECONDS,
} from "./cms-shared";

export * from "./cms-shared";

// ============================================================================
// 4. SERVER-SIDE READERS WITH SAFE FALLBACKS
// ============================================================================

/**
 * Reads homepage hero content from cache or SiteSetting (key: home_hero_content)
 */
export async function getHomepageHeroContent(): Promise<HomeHeroContent> {
  try {
    const cached = await cacheGet<HomeHeroContent>(CMS_CACHE_KEYS.HERO);
    if (cached && typeof cached === "object" && cached.headlineLine1) {
      return cached;
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { key: "home_hero_content" },
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (parsed && typeof parsed === "object") {
          const normalized: HomeHeroContent = {
            eyebrow:
              typeof parsed.eyebrow === "string" && parsed.eyebrow.trim()
                ? parsed.eyebrow.trim()
                : DEFAULT_HERO_CONTENT.eyebrow,
            headlineLine1:
              typeof parsed.headlineLine1 === "string" && parsed.headlineLine1.trim()
                ? parsed.headlineLine1.trim()
                : DEFAULT_HERO_CONTENT.headlineLine1,
            headlineLine2:
              typeof parsed.headlineLine2 === "string" && parsed.headlineLine2.trim()
                ? parsed.headlineLine2.trim()
                : DEFAULT_HERO_CONTENT.headlineLine2,
            headlineLine3:
              typeof parsed.headlineLine3 === "string" && parsed.headlineLine3.trim()
                ? parsed.headlineLine3.trim()
                : DEFAULT_HERO_CONTENT.headlineLine3,
            subheadline:
              typeof parsed.subheadline === "string" && parsed.subheadline.trim()
                ? parsed.subheadline.trim()
                : DEFAULT_HERO_CONTENT.subheadline,
            primaryCtaText:
              typeof parsed.primaryCtaText === "string" && parsed.primaryCtaText.trim()
                ? parsed.primaryCtaText.trim()
                : DEFAULT_HERO_CONTENT.primaryCtaText,
            primaryCtaLink:
              typeof parsed.primaryCtaLink === "string" && parsed.primaryCtaLink.trim()
                ? parsed.primaryCtaLink.trim()
                : DEFAULT_HERO_CONTENT.primaryCtaLink,
            secondaryCtaText:
              typeof parsed.secondaryCtaText === "string" && parsed.secondaryCtaText.trim()
                ? parsed.secondaryCtaText.trim()
                : DEFAULT_HERO_CONTENT.secondaryCtaText,
            secondaryCtaLink:
              typeof parsed.secondaryCtaLink === "string" && parsed.secondaryCtaLink.trim()
                ? parsed.secondaryCtaLink.trim()
                : DEFAULT_HERO_CONTENT.secondaryCtaLink,
          };

          await cacheSet(CMS_CACHE_KEYS.HERO, normalized, CMS_CACHE_TTL_SECONDS);
          return normalized;
        }
      } catch (jsonErr) {
        logger.warn("[CMS] Invalid JSON in home_hero_content setting, falling back to default", {
          error: String(jsonErr),
        });
      }
    }

    await cacheSet(CMS_CACHE_KEYS.HERO, DEFAULT_HERO_CONTENT, CMS_CACHE_TTL_SECONDS);
    return DEFAULT_HERO_CONTENT;
  } catch (error) {
    logger.warn("[CMS] Failed to load home_hero_content, using fallback default", {
      error: String(error),
    });
    return DEFAULT_HERO_CONTENT;
  }
}

const VALID_SECTION_IDS: HomeSectionId[] = [
  "hero",
  "capabilities",
  "howWeBuild",
  "showcase",
  "testimonials",
  "blog",
  "cta",
];

/**
 * Reads homepage sections configuration from cache or SiteSetting (key: home_sections_config)
 */
export async function getHomepageSectionsConfig(): Promise<HomeSectionsConfig> {
  try {
    const cached = await cacheGet<HomeSectionsConfig>(CMS_CACHE_KEYS.HOME_SECTIONS);
    if (cached?.sections && Array.isArray(cached.sections)) {
      return cached;
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { key: "home_sections_config" },
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        const rawList = Array.isArray(parsed) ? parsed : parsed?.sections;

        if (Array.isArray(rawList) && rawList.length > 0) {
          const normalizedSections: HomeSectionItem[] = [];
          const seenIds = new Set<string>();

          for (const item of rawList) {
            if (
              item &&
              typeof item === "object" &&
              VALID_SECTION_IDS.includes(item.id as HomeSectionId) &&
              !seenIds.has(item.id)
            ) {
              seenIds.add(item.id);
              normalizedSections.push({
                id: item.id as HomeSectionId,
                enabled: typeof item.enabled === "boolean" ? item.enabled : true,
                order: typeof item.order === "number" ? item.order : normalizedSections.length + 1,
              });
            }
          }

          // Ensure any missing sections from standard config are appended
          for (const defSection of DEFAULT_HOME_SECTIONS.sections) {
            if (!seenIds.has(defSection.id)) {
              normalizedSections.push({ ...defSection });
            }
          }

          normalizedSections.sort((a, b) => a.order - b.order);
          const result: HomeSectionsConfig = { sections: normalizedSections };
          await cacheSet(CMS_CACHE_KEYS.HOME_SECTIONS, result, CMS_CACHE_TTL_SECONDS);
          return result;
        }
      } catch (jsonErr) {
        logger.warn("[CMS] Invalid JSON in home_sections_config setting, falling back to default", {
          error: String(jsonErr),
        });
      }
    }

    await cacheSet(CMS_CACHE_KEYS.HOME_SECTIONS, DEFAULT_HOME_SECTIONS, CMS_CACHE_TTL_SECONDS);
    return DEFAULT_HOME_SECTIONS;
  } catch (error) {
    logger.warn("[CMS] Failed to load home_sections_config, using fallback default", {
      error: String(error),
    });
    return DEFAULT_HOME_SECTIONS;
  }
}

/**
 * Reads navigation menu items from cache or SiteSetting (key: navigation_menu)
 */
export async function getNavigationMenu(): Promise<NavigationMenuConfig> {
  try {
    const cached = await cacheGet<NavigationMenuConfig>(CMS_CACHE_KEYS.NAVIGATION);
    if (cached?.items && Array.isArray(cached.items)) {
      return cached;
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { key: "navigation_menu" },
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        const rawList = Array.isArray(parsed) ? parsed : parsed?.items;

        if (Array.isArray(rawList) && rawList.length > 0) {
          const items: NavItem[] = rawList
            .filter(
              (item) =>
                item &&
                typeof item === "object" &&
                typeof item.title === "string" &&
                typeof item.href === "string" &&
                item.title.trim() &&
                item.href.trim(),
            )
            .map((item, index) => ({
              title: item.title.trim(),
              href: item.href.trim(),
              order: typeof item.order === "number" ? item.order : index + 1,
              isExternal: Boolean(item.isExternal),
            }))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          if (items.length > 0) {
            const config: NavigationMenuConfig = { items };
            await cacheSet(CMS_CACHE_KEYS.NAVIGATION, config, CMS_CACHE_TTL_SECONDS);
            return config;
          }
        }
      } catch (jsonErr) {
        logger.warn("[CMS] Invalid JSON in navigation_menu setting, falling back to default", {
          error: String(jsonErr),
        });
      }
    }

    await cacheSet(CMS_CACHE_KEYS.NAVIGATION, DEFAULT_NAVIGATION_MENU, CMS_CACHE_TTL_SECONDS);
    return DEFAULT_NAVIGATION_MENU;
  } catch (error) {
    logger.warn("[CMS] Failed to load navigation_menu, using fallback default", {
      error: String(error),
    });
    return DEFAULT_NAVIGATION_MENU;
  }
}

/**
 * Reads footer configuration from cache or SiteSetting (key: footer_links)
 */
export async function getFooterConfig(): Promise<FooterConfig> {
  try {
    const cached = await cacheGet<FooterConfig>(CMS_CACHE_KEYS.FOOTER);
    if (cached?.systemsLinks && Array.isArray(cached.systemsLinks)) {
      return cached;
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { key: "footer_links" },
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (parsed && typeof parsed === "object") {
          const systemsLinks: FooterLinkItem[] = Array.isArray(parsed.systemsLinks)
            ? (parsed.systemsLinks as unknown[])
                .filter(
                  (item): item is { title: string; href: string; isExternal?: boolean } =>
                    Boolean(
                      item &&
                        typeof item === "object" &&
                        "title" in item &&
                        typeof item.title === "string" &&
                        "href" in item &&
                        typeof item.href === "string",
                    ),
                )
                .map((item) => ({
                  title: item.title.trim(),
                  href: item.href.trim(),
                  isExternal: Boolean(item.isExternal),
                }))
            : DEFAULT_FOOTER_CONFIG.systemsLinks;

          const coreStack: string[] = Array.isArray(parsed.coreStack)
            ? (parsed.coreStack as unknown[])
                .filter((s): s is string => typeof s === "string" && Boolean(s.trim()))
                .map((s) => s.trim())
            : DEFAULT_FOOTER_CONFIG.coreStack;

          const connectLinks: FooterLinkItem[] = Array.isArray(parsed.connectLinks)
            ? (parsed.connectLinks as unknown[])
                .filter(
                  (item): item is { title: string; href: string; isExternal?: boolean } =>
                    Boolean(
                      item &&
                        typeof item === "object" &&
                        "title" in item &&
                        typeof item.title === "string" &&
                        "href" in item &&
                        typeof item.href === "string",
                    ),
                )
                .map((item) => ({
                  title: item.title.trim(),
                  href: item.href.trim(),
                  isExternal: Boolean(item.isExternal),
                }))
            : DEFAULT_FOOTER_CONFIG.connectLinks;

          const config: FooterConfig = {
            brandTagline:
              typeof parsed.brandTagline === "string" && parsed.brandTagline.trim()
                ? parsed.brandTagline.trim()
                : DEFAULT_FOOTER_CONFIG.brandTagline,
            systemsLinks: systemsLinks.length > 0 ? systemsLinks : DEFAULT_FOOTER_CONFIG.systemsLinks,
            coreStack: coreStack.length > 0 ? coreStack : DEFAULT_FOOTER_CONFIG.coreStack,
            connectLinks: connectLinks.length > 0 ? connectLinks : DEFAULT_FOOTER_CONFIG.connectLinks,
            copyrightText:
              typeof parsed.copyrightText === "string" && parsed.copyrightText.trim()
                ? parsed.copyrightText.trim()
                : DEFAULT_FOOTER_CONFIG.copyrightText,
          };

          await cacheSet(CMS_CACHE_KEYS.FOOTER, config, CMS_CACHE_TTL_SECONDS);
          return config;
        }
      } catch (jsonErr) {
        logger.warn("[CMS] Invalid JSON in footer_links setting, falling back to default", {
          error: String(jsonErr),
        });
      }
    }

    await cacheSet(CMS_CACHE_KEYS.FOOTER, DEFAULT_FOOTER_CONFIG, CMS_CACHE_TTL_SECONDS);
    return DEFAULT_FOOTER_CONFIG;
  } catch (error) {
    logger.warn("[CMS] Failed to load footer_links, using fallback default", {
      error: String(error),
    });
    return DEFAULT_FOOTER_CONFIG;
  }
}

/**
 * Reads public contact and company information from cache or individual SiteSetting keys
 */
export async function getContactInfo(): Promise<ContactInfo> {
  try {
    const cached = await cacheGet<ContactInfo>(CMS_CACHE_KEYS.CONTACT_INFO);
    if (cached && typeof cached === "object" && cached.email) {
      return cached;
    }

    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "contact_email",
            "contact_phone",
            "office_address",
            "business_hours",
            "github_url",
            "twitter_url",
            "linkedin_url",
            "discord_url",
          ],
        },
      },
    });

    const settingsMap = new Map<string, string>();
    for (const s of settings) {
      settingsMap.set(s.key, s.value);
    }

    const contactInfo: ContactInfo = {
      email: settingsMap.get("contact_email")?.trim() || DEFAULT_CONTACT_INFO.email,
      phone: settingsMap.get("contact_phone")?.trim() || DEFAULT_CONTACT_INFO.phone,
      officeAddress: settingsMap.get("office_address")?.trim() || DEFAULT_CONTACT_INFO.officeAddress,
      businessHours: settingsMap.get("business_hours")?.trim() || DEFAULT_CONTACT_INFO.businessHours,
      githubUrl: settingsMap.get("github_url")?.trim() || DEFAULT_CONTACT_INFO.githubUrl,
      twitterUrl: settingsMap.get("twitter_url")?.trim() || DEFAULT_CONTACT_INFO.twitterUrl,
      linkedinUrl: settingsMap.get("linkedin_url")?.trim() || DEFAULT_CONTACT_INFO.linkedinUrl,
      discordUrl: settingsMap.get("discord_url")?.trim() || DEFAULT_CONTACT_INFO.discordUrl,
    };

    await cacheSet(CMS_CACHE_KEYS.CONTACT_INFO, contactInfo, CMS_CACHE_TTL_SECONDS);
    return contactInfo;
  } catch (error) {
    logger.warn("[CMS] Failed to load contact information, using fallback default", {
      error: String(error),
    });
    return DEFAULT_CONTACT_INFO;
  }
}

/**
 * Reads site FAQs from cache or SiteSetting (key: site_faqs)
 */
export async function getSiteFaqs(): Promise<SiteFaqsConfig> {
  try {
    const cached = await cacheGet<SiteFaqsConfig>(CMS_CACHE_KEYS.FAQS);
    if (cached?.faqs && Array.isArray(cached.faqs)) {
      return cached;
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { key: "site_faqs" },
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        const rawList = Array.isArray(parsed) ? parsed : parsed?.faqs;

        if (Array.isArray(rawList) && rawList.length > 0) {
          const faqs: SiteFaqItem[] = rawList
            .filter(
              (item) =>
                item &&
                typeof item === "object" &&
                typeof item.question === "string" &&
                typeof item.answer === "string" &&
                item.question.trim() &&
                item.answer.trim(),
            )
            .map((item, index) => ({
              id: item.id || `faq-${index + 1}`,
              question: item.question.trim(),
              answer: item.answer.trim(),
              category: typeof item.category === "string" ? item.category.trim() : undefined,
              order: typeof item.order === "number" ? item.order : index + 1,
            }))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          if (faqs.length > 0) {
            const config: SiteFaqsConfig = { faqs };
            await cacheSet(CMS_CACHE_KEYS.FAQS, config, CMS_CACHE_TTL_SECONDS);
            return config;
          }
        }
      } catch (jsonErr) {
        logger.warn("[CMS] Invalid JSON in site_faqs setting, falling back to default", {
          error: String(jsonErr),
        });
      }
    }

    await cacheSet(CMS_CACHE_KEYS.FAQS, DEFAULT_SITE_FAQS, CMS_CACHE_TTL_SECONDS);
    return DEFAULT_SITE_FAQS;
  } catch (error) {
    logger.warn("[CMS] Failed to load site_faqs, using fallback default", {
      error: String(error),
    });
    return DEFAULT_SITE_FAQS;
  }
}

// ============================================================================
// 5. CACHE INVALIDATION & REVALIDATION HELPER
// ============================================================================

export interface InvalidateCmsCacheOptions {
  keys?: Array<keyof typeof CMS_CACHE_KEYS | string>;
  paths?: string[];
}

export interface InvalidationResult {
  success: boolean;
  invalidatedKeys: string[];
  revalidatedPaths: string[];
  errors: string[];
}

/**
 * Centralized helper for purging CMS cache keys in Redis and triggering Next.js path revalidation
 */
export async function invalidateCmsCache(
  options: InvalidateCmsCacheOptions = {},
): Promise<InvalidationResult> {
  const allCacheKeys = Object.values(CMS_CACHE_KEYS) as string[];
  const targetKeys: string[] = options.keys
    ? options.keys.map((k) => (CMS_CACHE_KEYS[k as keyof typeof CMS_CACHE_KEYS] || k) as string)
    : allCacheKeys;

  const defaultPaths = ["/", "/contact", "/pricing", "/work", "/blog", "/about"];
  const targetPaths = options.paths && options.paths.length > 0 ? options.paths : defaultPaths;

  const invalidatedKeys: string[] = [];
  const revalidatedPaths: string[] = [];
  const errors: string[] = [];

  // 1. Purge Redis cache
  try {
    const deleted = await cacheDel(targetKeys);
    if (deleted) {
      invalidatedKeys.push(...targetKeys);
      logger.info("[CMS] Successfully invalidated Redis cache keys", { keys: targetKeys });
    } else {
      logger.warn("[CMS] Redis cache deletion returned false (possibly non-critical or offline)", {
        keys: targetKeys,
      });
      invalidatedKeys.push(...targetKeys);
    }
  } catch (redisError) {
    const errMsg = `Failed to delete Redis keys: ${String(redisError)}`;
    logger.error("[CMS] Cache invalidation failed", { error: errMsg });
    errors.push(errMsg);
  }

  // 2. Trigger Next.js on-demand ISR path revalidation
  for (const path of targetPaths) {
    try {
      revalidatePath(path);
      revalidatedPaths.push(path);
    } catch (revalError) {
      const errMsg = `Failed to revalidate path ${path}: ${String(revalError)}`;
      logger.warn("[CMS] revalidatePath warning", { path, error: errMsg });
      errors.push(errMsg);
    }
  }

  return {
    success: errors.length === 0,
    invalidatedKeys,
    revalidatedPaths,
    errors,
  };
}

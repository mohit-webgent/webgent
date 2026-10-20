import { prisma } from "@/lib/db";
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

import type { Metadata } from "next";
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
  GlobalSeoConfig,
  PageSeoOverride,
  SiteSeoSettings,
  DEFAULT_HERO_CONTENT,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_NAVIGATION_MENU,
  DEFAULT_FOOTER_CONFIG,
  DEFAULT_CONTACT_INFO,
  DEFAULT_SITE_FAQS,
  DEFAULT_GLOBAL_SEO,
  DEFAULT_PAGE_SEO_OVERRIDES,
  DEFAULT_SITE_SEO_SETTINGS,
  CMS_CACHE_KEYS,
  CMS_CACHE_TTL_SECONDS,
  isValidSafeUrl,
  isValidCanonicalBaseUrl,
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
 * Reads navigation menu items from cache or SiteSetting (key: navigation_menu).
 * By default (publishedOnly = true), returns only published items for public consumers.
 */
export async function getNavigationMenu(
  options: { publishedOnly?: boolean } = { publishedOnly: true },
): Promise<NavigationMenuConfig> {
  const publishedOnly = options?.publishedOnly !== false;
  try {
    const cached = await cacheGet<NavigationMenuConfig>(CMS_CACHE_KEYS.NAVIGATION);
    if (cached?.items && Array.isArray(cached.items)) {
      return {
        items: publishedOnly ? cached.items.filter((item) => item.published !== false) : cached.items,
      };
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
              id: item.id || `nav-${index + 1}`,
              title: item.title.trim(),
              href: item.href.trim(),
              order: typeof item.order === "number" ? item.order : index + 1,
              isExternal: Boolean(item.isExternal),
              published: typeof item.published === "boolean" ? item.published : true,
            }))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          if (items.length > 0) {
            const config: NavigationMenuConfig = { items };
            await cacheSet(CMS_CACHE_KEYS.NAVIGATION, config, CMS_CACHE_TTL_SECONDS);
            return {
              items: publishedOnly ? items.filter((item) => item.published !== false) : items,
            };
          }
        }
      } catch (jsonErr) {
        logger.warn("[CMS] Invalid JSON in navigation_menu setting, falling back to default", {
          error: String(jsonErr),
        });
      }
    }

    await cacheSet(CMS_CACHE_KEYS.NAVIGATION, DEFAULT_NAVIGATION_MENU, CMS_CACHE_TTL_SECONDS);
    return {
      items: publishedOnly
        ? DEFAULT_NAVIGATION_MENU.items.filter((item) => item.published !== false)
        : DEFAULT_NAVIGATION_MENU.items,
    };
  } catch (error) {
    logger.warn("[CMS] Failed to load navigation_menu, using fallback default", {
      error: String(error),
    });
    return {
      items: publishedOnly
        ? DEFAULT_NAVIGATION_MENU.items.filter((item) => item.published !== false)
        : DEFAULT_NAVIGATION_MENU.items,
    };
  }
}

/**
 * Reads footer configuration from cache or SiteSetting (key: footer_links).
 * By default (publishedOnly = true), returns only published systems and connect links for public consumers.
 */
export async function getFooterConfig(
  options: { publishedOnly?: boolean } = { publishedOnly: true },
): Promise<FooterConfig> {
  const publishedOnly = options?.publishedOnly !== false;
  try {
    const cached = await cacheGet<FooterConfig>(CMS_CACHE_KEYS.FOOTER);
    if (cached?.systemsLinks && Array.isArray(cached.systemsLinks)) {
      return {
        ...cached,
        systemsLinks: publishedOnly
          ? cached.systemsLinks.filter((link) => link.published !== false)
          : cached.systemsLinks,
        connectLinks: publishedOnly
          ? cached.connectLinks.filter((link) => link.published !== false)
          : cached.connectLinks,
      };
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
                  (item): item is { title: string; href: string; id?: string; isExternal?: boolean; published?: boolean } =>
                    Boolean(
                      item &&
                        typeof item === "object" &&
                        "title" in item &&
                        typeof item.title === "string" &&
                        "href" in item &&
                        typeof item.href === "string",
                    ),
                )
                .map((item, index) => ({
                  id: item.id || `footer-sys-${index + 1}`,
                  title: item.title.trim(),
                  href: item.href.trim(),
                  isExternal: Boolean(item.isExternal),
                  published: typeof item.published === "boolean" ? item.published : true,
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
                  (item): item is { title: string; href: string; id?: string; isExternal?: boolean; published?: boolean } =>
                    Boolean(
                      item &&
                        typeof item === "object" &&
                        "title" in item &&
                        typeof item.title === "string" &&
                        "href" in item &&
                        typeof item.href === "string",
                    ),
                )
                .map((item, index) => ({
                  id: item.id || `footer-conn-${index + 1}`,
                  title: item.title.trim(),
                  href: item.href.trim(),
                  isExternal: Boolean(item.isExternal),
                  published: typeof item.published === "boolean" ? item.published : true,
                }))
            : DEFAULT_FOOTER_CONFIG.connectLinks;

          const fullConfig: FooterConfig = {
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

          await cacheSet(CMS_CACHE_KEYS.FOOTER, fullConfig, CMS_CACHE_TTL_SECONDS);
          return {
            ...fullConfig,
            systemsLinks: publishedOnly
              ? fullConfig.systemsLinks.filter((link) => link.published !== false)
              : fullConfig.systemsLinks,
            connectLinks: publishedOnly
              ? fullConfig.connectLinks.filter((link) => link.published !== false)
              : fullConfig.connectLinks,
          };
        }
      } catch (jsonErr) {
        logger.warn("[CMS] Invalid JSON in footer_links setting, falling back to default", {
          error: String(jsonErr),
        });
      }
    }

    await cacheSet(CMS_CACHE_KEYS.FOOTER, DEFAULT_FOOTER_CONFIG, CMS_CACHE_TTL_SECONDS);
    return {
      ...DEFAULT_FOOTER_CONFIG,
      systemsLinks: publishedOnly
        ? DEFAULT_FOOTER_CONFIG.systemsLinks.filter((link) => link.published !== false)
        : DEFAULT_FOOTER_CONFIG.systemsLinks,
      connectLinks: publishedOnly
        ? DEFAULT_FOOTER_CONFIG.connectLinks.filter((link) => link.published !== false)
        : DEFAULT_FOOTER_CONFIG.connectLinks,
    };
  } catch (error) {
    logger.warn("[CMS] Failed to load footer_links, using fallback default", {
      error: String(error),
    });
    return {
      ...DEFAULT_FOOTER_CONFIG,
      systemsLinks: publishedOnly
        ? DEFAULT_FOOTER_CONFIG.systemsLinks.filter((link) => link.published !== false)
        : DEFAULT_FOOTER_CONFIG.systemsLinks,
      connectLinks: publishedOnly
        ? DEFAULT_FOOTER_CONFIG.connectLinks.filter((link) => link.published !== false)
        : DEFAULT_FOOTER_CONFIG.connectLinks,
    };
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
 * Reads site FAQs from cache or SiteSetting (key: site_faqs).
 * By default (publishedOnly = true), filters out unpublished/draft entries for public consumers.
 */
export async function getSiteFaqs(
  options: { publishedOnly?: boolean } = { publishedOnly: true },
): Promise<SiteFaqsConfig> {
  const publishedOnly = options?.publishedOnly !== false;
  try {
    const cached = await cacheGet<SiteFaqsConfig>(CMS_CACHE_KEYS.FAQS);
    if (cached?.faqs && Array.isArray(cached.faqs)) {
      return {
        faqs: publishedOnly ? cached.faqs.filter((f) => f.published !== false) : cached.faqs,
      };
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
              category: typeof item.category === "string" ? item.category.trim() : "General",
              order: typeof item.order === "number" ? item.order : index + 1,
              published: typeof item.published === "boolean" ? item.published : true,
            }))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          if (faqs.length > 0) {
            const config: SiteFaqsConfig = { faqs };
            await cacheSet(CMS_CACHE_KEYS.FAQS, config, CMS_CACHE_TTL_SECONDS);
            return {
              faqs: publishedOnly ? faqs.filter((f) => f.published !== false) : faqs,
            };
          }
        }
      } catch (jsonErr) {
        logger.warn("[CMS] Invalid JSON in site_faqs setting, falling back to default", {
          error: String(jsonErr),
        });
      }
    }

    await cacheSet(CMS_CACHE_KEYS.FAQS, DEFAULT_SITE_FAQS, CMS_CACHE_TTL_SECONDS);
    return {
      faqs: publishedOnly
        ? DEFAULT_SITE_FAQS.faqs.filter((f) => f.published !== false)
        : DEFAULT_SITE_FAQS.faqs,
    };
  } catch (error) {
    logger.warn("[CMS] Failed to load site_faqs, using fallback default", {
      error: String(error),
    });
    return {
      faqs: publishedOnly
        ? DEFAULT_SITE_FAQS.faqs.filter((f) => f.published !== false)
        : DEFAULT_SITE_FAQS.faqs,
    };
  }
}

/**
 * Reads global SEO settings and per-page overrides from cache or SiteSetting (key: site_seo_settings).
 * Gracefully falls back to safe production defaults if missing, malformed, or DB is unavailable.
 */
export async function getSiteSeoSettings(): Promise<SiteSeoSettings> {
  try {
    const cached = await cacheGet<SiteSeoSettings>(CMS_CACHE_KEYS.SEO);
    if (cached?.global?.siteName && cached?.pages) {
      return cached;
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { key: "site_seo_settings" },
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (parsed && typeof parsed === "object") {
          const rawGlobal = parsed.global || {};
          const normalizedGlobal: GlobalSeoConfig = {
            siteName:
              typeof rawGlobal.siteName === "string" && rawGlobal.siteName.trim()
                ? rawGlobal.siteName.trim()
                : DEFAULT_GLOBAL_SEO.siteName,
            defaultTitle:
              typeof rawGlobal.defaultTitle === "string" && rawGlobal.defaultTitle.trim()
                ? rawGlobal.defaultTitle.trim()
                : DEFAULT_GLOBAL_SEO.defaultTitle,
            titleTemplate:
              typeof rawGlobal.titleTemplate === "string" && rawGlobal.titleTemplate.includes("%s")
                ? rawGlobal.titleTemplate.trim()
                : DEFAULT_GLOBAL_SEO.titleTemplate,
            defaultDescription:
              typeof rawGlobal.defaultDescription === "string" && rawGlobal.defaultDescription.trim()
                ? rawGlobal.defaultDescription.trim()
                : DEFAULT_GLOBAL_SEO.defaultDescription,
            canonicalBaseUrl:
              typeof rawGlobal.canonicalBaseUrl === "string" && isValidCanonicalBaseUrl(rawGlobal.canonicalBaseUrl)
                ? rawGlobal.canonicalBaseUrl.trim()
                : DEFAULT_GLOBAL_SEO.canonicalBaseUrl,
            defaultOgImage:
              typeof rawGlobal.defaultOgImage === "string" && isValidSafeUrl(rawGlobal.defaultOgImage)
                ? rawGlobal.defaultOgImage.trim()
                : DEFAULT_GLOBAL_SEO.defaultOgImage,
            twitterCard:
              rawGlobal.twitterCard === "summary" || rawGlobal.twitterCard === "summary_large_image"
                ? rawGlobal.twitterCard
                : DEFAULT_GLOBAL_SEO.twitterCard,
            twitterHandle:
              typeof rawGlobal.twitterHandle === "string"
                ? rawGlobal.twitterHandle.trim()
                : DEFAULT_GLOBAL_SEO.twitterHandle,
            defaultRobotsIndex:
              typeof rawGlobal.defaultRobotsIndex === "boolean"
                ? rawGlobal.defaultRobotsIndex
                : DEFAULT_GLOBAL_SEO.defaultRobotsIndex,
            defaultRobotsFollow:
              typeof rawGlobal.defaultRobotsFollow === "boolean"
                ? rawGlobal.defaultRobotsFollow
                : DEFAULT_GLOBAL_SEO.defaultRobotsFollow,
          };

          const rawPages = (parsed.pages && typeof parsed.pages === "object") ? parsed.pages : {};
          const normalizedPages: Record<string, PageSeoOverride> = { ...DEFAULT_PAGE_SEO_OVERRIDES };

          for (const [route, pageData] of Object.entries(rawPages)) {
            if (pageData && typeof pageData === "object" && typeof route === "string" && route.startsWith("/")) {
              const p = pageData as Record<string, unknown>;
              normalizedPages[route] = {
                route,
                title: typeof p.title === "string" && p.title.trim() ? p.title.trim() : undefined,
                description: typeof p.description === "string" && p.description.trim() ? p.description.trim() : undefined,
                canonicalUrl:
                  typeof p.canonicalUrl === "string" && isValidSafeUrl(p.canonicalUrl)
                    ? p.canonicalUrl.trim()
                    : undefined,
                noIndex: typeof p.noIndex === "boolean" ? p.noIndex : undefined,
                ogTitle: typeof p.ogTitle === "string" && p.ogTitle.trim() ? p.ogTitle.trim() : undefined,
                ogDescription:
                  typeof p.ogDescription === "string" && p.ogDescription.trim() ? p.ogDescription.trim() : undefined,
                ogImage:
                  typeof p.ogImage === "string" && isValidSafeUrl(p.ogImage)
                    ? p.ogImage.trim()
                    : undefined,
              };
            }
          }

          const completeSettings: SiteSeoSettings = {
            global: normalizedGlobal,
            pages: normalizedPages,
          };

          await cacheSet(CMS_CACHE_KEYS.SEO, completeSettings, CMS_CACHE_TTL_SECONDS);
          return completeSettings;
        }
      } catch (jsonErr) {
        logger.warn("[CMS] Invalid JSON in site_seo_settings setting, falling back to default", {
          error: String(jsonErr),
        });
      }
    }

    await cacheSet(CMS_CACHE_KEYS.SEO, DEFAULT_SITE_SEO_SETTINGS, CMS_CACHE_TTL_SECONDS);
    return DEFAULT_SITE_SEO_SETTINGS;
  } catch (error) {
    logger.warn("[CMS] Failed to load site_seo_settings, using fallback default", {
      error: String(error),
    });
    return DEFAULT_SITE_SEO_SETTINGS;
  }
}

// ============================================================================
// 5. ATOMIC PERSISTENCE & MUTATION SERVICES
// ============================================================================

export interface SaveFaqsResult {
  success: boolean;
  message: string;
  data: SiteFaqsConfig;
  meta: {
    cacheRefreshed: boolean;
    cacheErrors: string[];
    invalidatedKeys: string[];
    revalidatedPaths: string[];
  };
}

/**
 * Validates, sanitizes, and atomically persists FAQs to SiteSetting (key: site_faqs)
 * and purges relevant Redis cache keys and ISR pages.
 */
export async function saveSiteFaqs(body: unknown): Promise<SaveFaqsResult> {
  const { siteFaqsUpdateSchema } = await import("./cms-shared");
  const validation = siteFaqsUpdateSchema.safeParse(body);
  if (!validation.success) {
    throw validation.error;
  }

  const { faqs } = validation.data;

  // Sanitize text inputs and assign sequential order
  const sanitizedFaqs: SiteFaqItem[] = [...faqs]
    .sort((a, b) => (a.order ?? 1) - (b.order ?? 1))
    .map((item, index) => ({
      id: item.id.trim(),
      question: item.question.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim(),
      answer: item.answer.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim(),
      category: item.category
        ? item.category.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim()
        : "General",
      order: index + 1,
      published: item.published ?? true,
    }));

  const payload: SiteFaqsConfig = { faqs: sanitizedFaqs };

  await prisma.siteSetting.upsert({
    where: { key: "site_faqs" },
    update: {
      value: JSON.stringify(payload),
      isPublic: true,
      description: "Site-wide Frequently Asked Questions",
    },
    create: {
      key: "site_faqs",
      value: JSON.stringify(payload),
      isPublic: true,
      description: "Site-wide Frequently Asked Questions",
    },
  });

  const cacheResult = await invalidateCmsCache({
    keys: ["FAQS"],
    paths: ["/", "/pricing", "/contact"],
  });

  const cacheRefreshed = cacheResult.errors.length === 0;

  logger.info("[CMS] Successfully saved site FAQs", {
    faqCount: sanitizedFaqs.length,
    cacheRefreshed,
    cacheErrors: cacheResult.errors,
  });

  return {
    success: true,
    message: cacheRefreshed
      ? "Frequently Asked Questions saved and public cache revalidated successfully."
      : "Frequently Asked Questions saved to database. Notice: Public cache revalidation encountered warnings.",
    data: payload,
    meta: {
      cacheRefreshed,
      cacheErrors: cacheResult.errors,
      invalidatedKeys: cacheResult.invalidatedKeys,
      revalidatedPaths: cacheResult.revalidatedPaths,
    },
  };
}

export interface SaveNavigationContentResult {
  success: boolean;
  message: string;
  data: {
    navigation: NavigationMenuConfig;
    footer: FooterConfig;
  };
  meta: {
    cacheRefreshed: boolean;
    cacheErrors: string[];
    invalidatedKeys: string[];
    revalidatedPaths: string[];
  };
}

/**
 * Validates, sanitizes, and atomically persists Header Navigation and Footer configuration
 * to SiteSetting (keys: navigation_menu, footer_links) and purges Redis caches.
 */
export async function saveNavigationContent(body: unknown): Promise<SaveNavigationContentResult> {
  const { navigationContentUpdateSchema } = await import("./cms-shared");
  const validation = navigationContentUpdateSchema.safeParse(body);
  if (!validation.success) {
    throw validation.error;
  }

  const { navigation, footer } = validation.data;

  // Sanitize navigation items
  const sanitizedNavItems: NavItem[] = [...navigation.items]
    .sort((a, b) => (a.order ?? 1) - (b.order ?? 1))
    .map((item, index) => ({
      id: item.id?.trim() || `nav-${index + 1}`,
      title: item.title.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim(),
      href: item.href.trim(),
      order: index + 1,
      isExternal: Boolean(item.isExternal),
      published: item.published ?? true,
    }));

  // Sanitize footer systems links
  const sanitizedSystemsLinks: FooterLinkItem[] = footer.systemsLinks.map((item, index) => ({
    id: item.id?.trim() || `footer-sys-${index + 1}`,
    title: item.title.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim(),
    href: item.href.trim(),
    isExternal: Boolean(item.isExternal),
    published: item.published ?? true,
  }));

  // Sanitize footer connect links
  const sanitizedConnectLinks: FooterLinkItem[] = footer.connectLinks.map((item, index) => ({
    id: item.id?.trim() || `footer-conn-${index + 1}`,
    title: item.title.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim(),
    href: item.href.trim(),
    isExternal: Boolean(item.isExternal),
    published: item.published ?? true,
  }));

  // Sanitize core stack tags
  const sanitizedCoreStack: string[] = footer.coreStack
    .map((s) => s.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim())
    .filter(Boolean);

  const sanitizedNavigationConfig: NavigationMenuConfig = { items: sanitizedNavItems };
  const sanitizedFooterConfig: FooterConfig = {
    brandTagline: footer.brandTagline.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim(),
    systemsLinks: sanitizedSystemsLinks,
    coreStack: sanitizedCoreStack,
    connectLinks: sanitizedConnectLinks,
    copyrightText: footer.copyrightText
      ? footer.copyrightText.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim()
      : "All rights reserved.",
  };

  // Atomically persist both settings together in a database transaction
  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: "navigation_menu" },
      update: {
        value: JSON.stringify(sanitizedNavigationConfig),
        isPublic: true,
        description: "Main Header Navigation Items",
      },
      create: {
        key: "navigation_menu",
        value: JSON.stringify(sanitizedNavigationConfig),
        isPublic: true,
        description: "Main Header Navigation Items",
      },
    }),
    prisma.siteSetting.upsert({
      where: { key: "footer_links" },
      update: {
        value: JSON.stringify(sanitizedFooterConfig),
        isPublic: true,
        description: "Footer Links and Stack Configuration",
      },
      create: {
        key: "footer_links",
        value: JSON.stringify(sanitizedFooterConfig),
        isPublic: true,
        description: "Footer Links and Stack Configuration",
      },
    }),
  ]);

  const cacheResult = await invalidateCmsCache({
    keys: ["NAVIGATION", "FOOTER"],
    paths: ["/", "/work", "/about", "/blog", "/pricing", "/contact"],
  });

  const cacheRefreshed = cacheResult.errors.length === 0;

  logger.info("[CMS] Successfully saved navigation and footer configuration", {
    navItemCount: sanitizedNavItems.length,
    systemsLinkCount: sanitizedSystemsLinks.length,
    connectLinkCount: sanitizedConnectLinks.length,
    cacheRefreshed,
    cacheErrors: cacheResult.errors,
  });

  return {
    success: true,
    message: cacheRefreshed
      ? "Navigation and footer configuration updated and public cache revalidated successfully."
      : "Navigation and footer saved to database. Notice: Public cache revalidation encountered warnings.",
    data: {
      navigation: sanitizedNavigationConfig,
      footer: sanitizedFooterConfig,
    },
    meta: {
      cacheRefreshed,
      cacheErrors: cacheResult.errors,
      invalidatedKeys: cacheResult.invalidatedKeys,
      revalidatedPaths: cacheResult.revalidatedPaths,
    },
  };
}

export interface SaveSeoResult {
  success: boolean;
  message: string;
  data: SiteSeoSettings;
  meta: {
    cacheRefreshed: boolean;
    cacheErrors: string[];
    invalidatedKeys: string[];
    revalidatedPaths: string[];
  };
}

/**
 * Validates, sanitizes, and atomically persists global and per-page SEO settings
 * to SiteSetting (key: site_seo_settings), purges Redis cache, and revalidates public ISR paths.
 */
export async function saveSiteSeoSettings(body: unknown): Promise<SaveSeoResult> {
  const { siteSeoSettingsUpdateSchema, sanitizeText } = await import("./cms-shared");
  const validation = siteSeoSettingsUpdateSchema.safeParse(body);
  if (!validation.success) {
    throw validation.error;
  }

  const { global, pages } = validation.data;

  // Sanitize global
  const sanitizedGlobal: GlobalSeoConfig = {
    siteName: sanitizeText(global.siteName),
    defaultTitle: sanitizeText(global.defaultTitle),
    titleTemplate: sanitizeText(global.titleTemplate),
    defaultDescription: sanitizeText(global.defaultDescription),
    canonicalBaseUrl: global.canonicalBaseUrl.trim().replace(/\/+$/, ""),
    defaultOgImage: global.defaultOgImage.trim(),
    twitterCard: global.twitterCard,
    twitterHandle: sanitizeText(global.twitterHandle),
    defaultRobotsIndex: global.defaultRobotsIndex,
    defaultRobotsFollow: global.defaultRobotsFollow,
  };

  // Sanitize pages
  const sanitizedPages: Record<string, PageSeoOverride> = {};
  for (const [route, override] of Object.entries(pages)) {
    sanitizedPages[route] = {
      route: route.trim(),
      title: override.title ? sanitizeText(override.title) : undefined,
      description: override.description ? sanitizeText(override.description) : undefined,
      canonicalUrl: override.canonicalUrl?.trim() || undefined,
      noIndex: typeof override.noIndex === "boolean" ? override.noIndex : undefined,
      ogTitle: override.ogTitle ? sanitizeText(override.ogTitle) : undefined,
      ogDescription: override.ogDescription ? sanitizeText(override.ogDescription) : undefined,
      ogImage: override.ogImage?.trim() || undefined,
    };
  }

  const completeSettings: SiteSeoSettings = {
    global: sanitizedGlobal,
    pages: sanitizedPages,
  };

  // Persist to SiteSetting
  await prisma.siteSetting.upsert({
    where: { key: "site_seo_settings" },
    update: {
      value: JSON.stringify(completeSettings),
      updatedAt: new Date(),
    },
    create: {
      key: "site_seo_settings",
      value: JSON.stringify(completeSettings),
    },
  });

  // Invalidate Redis cache and revalidate all public paths and layout
  const cacheResult = await invalidateCmsCache({
    keys: [CMS_CACHE_KEYS.SEO],
    paths: ["/", "/about", "/work", "/pricing", "/blog", "/contact", "/testimonials", "/robots.txt", "/sitemap.xml"],
  });

  try {
    revalidatePath("/", "layout");
  } catch (layoutErr) {
    logger.warn("[CMS] Failed to revalidate root layout", { error: String(layoutErr) });
  }

  const cacheRefreshed = cacheResult.success;

  return {
    success: true,
    message: cacheRefreshed
      ? "SEO and metadata configuration updated and public cache revalidated successfully."
      : "SEO configuration saved to database. Notice: Public cache revalidation encountered warnings.",
    data: completeSettings,
    meta: {
      cacheRefreshed,
      cacheErrors: cacheResult.errors,
      invalidatedKeys: cacheResult.invalidatedKeys,
      revalidatedPaths: cacheResult.revalidatedPaths,
    },
  };
}

/**
 * Resolves metadata for a specific public route by combining global SEO settings,
 * route-level overrides, and route-specific fallbacks.
 * Ensures:
 * 1. Safe fallbacks if database is down
 * 2. Every route receives its own distinct canonical URL (never duplicate identical canonicals across different routes)
 * 3. Correct robots directives (noindex if configured on page or globally)
 * 4. Safe image and social sharing metadata
 */
export async function resolveRouteMetadata(
  route: string,
  baseFallback: Metadata,
): Promise<Metadata> {
  try {
    const seo = await getSiteSeoSettings();
    const override = seo.pages[route];
    const baseUrl = (seo.global.canonicalBaseUrl || "https://webgent.vercel.app").replace(/\/+$/, "");

    // 1. Resolve title
    let resolvedTitle = baseFallback.title;
    if (override?.title?.trim()) {
      resolvedTitle = override.title.trim();
    } else if (!resolvedTitle) {
      resolvedTitle = seo.global.defaultTitle;
    }

    // 2. Resolve description
    let resolvedDescription = baseFallback.description;
    if (override?.description?.trim()) {
      resolvedDescription = override.description.trim();
    } else if (!resolvedDescription) {
      resolvedDescription = seo.global.defaultDescription;
    }

    // 3. Resolve canonical URL: route-specific canonical path
    let canonicalUrl: string;
    if (override?.canonicalUrl?.trim()) {
      const c = override.canonicalUrl.trim();
      canonicalUrl = c.startsWith("http") ? c : `${baseUrl}${c.startsWith("/") ? "" : "/"}${c}`;
    } else {
      canonicalUrl = `${baseUrl}${route.startsWith("/") ? "" : "/"}${route === "/" ? "" : route.replace(/^\//, "")}`;
    }

    // 4. Resolve robots: if page has explicit noIndex, use it; otherwise use global default
    const isNoIndex = override?.noIndex !== undefined ? override.noIndex : !seo.global.defaultRobotsIndex;
    const resolvedRobots = isNoIndex
      ? { index: false, follow: false }
      : {
          index: seo.global.defaultRobotsIndex,
          follow: seo.global.defaultRobotsFollow,
          googleBot: {
            index: seo.global.defaultRobotsIndex,
            follow: seo.global.defaultRobotsFollow,
            "max-video-preview": -1,
            "max-image-preview": "large" as const,
            "max-snippet": -1,
          },
        };

    // 5. Resolve OpenGraph and Twitter
    const fallbackOg = (baseFallback.openGraph || {}) as Record<string, unknown>;
    const ogTitle =
      override?.ogTitle?.trim() ||
      (typeof resolvedTitle === "string" ? resolvedTitle : seo.global.defaultTitle);
    const ogDesc =
      override?.ogDescription?.trim() ||
      (typeof resolvedDescription === "string" ? resolvedDescription : seo.global.defaultDescription);
    const ogImg = override?.ogImage?.trim() || seo.global.defaultOgImage;

    return {
      ...baseFallback,
      title: resolvedTitle,
      description: resolvedDescription,
      alternates: {
        ...(baseFallback.alternates || {}),
        canonical: canonicalUrl,
      },
      robots: resolvedRobots,
      openGraph: {
        type: "website",
        locale: "en_US",
        siteName: seo.global.siteName,
        images: [
          {
            url: ogImg,
            width: 1200,
            height: 630,
            alt: typeof resolvedTitle === "string" ? resolvedTitle : seo.global.siteName,
          },
        ],
        ...fallbackOg,
        title: ogTitle,
        description: ogDesc,
        url: canonicalUrl,
      },
      twitter: {
        ...(baseFallback.twitter || {}),
        card: seo.global.twitterCard,
        title: ogTitle,
        description: ogDesc,
        images: [ogImg],
        creator: seo.global.twitterHandle,
        site: seo.global.twitterHandle,
      },
    };
  } catch (error) {
    logger.warn(`[CMS] Error resolving route metadata for ${route}, using base fallback`, {
      error: String(error),
    });
    return baseFallback;
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

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import {
  CMS_SERVICES_CACHE_KEYS,
  CMS_SERVICES_CACHE_TTL_SECONDS,
  CmsService,
  CmsFeature,
  serviceCreateSchema,
  serviceUpdateSchema,
  featureCreateSchema,
  featureUpdateSchema,
  DEFAULT_FALLBACK_SERVICES,
} from "./cms-services-shared";

export * from "./cms-services-shared";

// ============================================================================
// 1. PUBLIC READERS WITH REDIS CACHING & SAFE FALLBACKS
// ============================================================================

export interface PublicServicesOptions {
  homeOnly?: boolean;
  featuredOnly?: boolean;
  limit?: number;
}

/**
 * Retrieves published services and their enabled public features.
 * Caches results in Redis with graceful fallback to default services on DB error.
 */
export async function getPublicServices(
  options: PublicServicesOptions = {},
): Promise<CmsService[]> {
  const { homeOnly = false, featuredOnly = false, limit } = options;
  const cacheKey = `${CMS_SERVICES_CACHE_KEYS.ALL_SERVICES}:${homeOnly ? "home" : "all"}:${
    featuredOnly ? "feat" : "all"
  }:${limit ?? "none"}`;

  try {
    const cached = await cacheGet<CmsService[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
  } catch (err) {
    logger.warn("[CMS Services] Redis cache read failed, continuing to database", {
      error: String(err),
    });
  }

  try {
    const where: Prisma.ServiceWhereInput = { published: true };
    if (homeOnly) where.showOnHome = true;
    if (featuredOnly) where.featured = true;

    const dbServices = await prisma.service.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        serviceFeatures: {
          include: {
            feature: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (dbServices && dbServices.length > 0) {
      const mapped: CmsService[] = dbServices.map((svc) => ({
        id: svc.id,
        name: svc.name,
        slug: svc.slug,
        shortDescription: svc.shortDescription,
        description: svc.description,
        icon: svc.icon,
        coverImage: svc.coverImage,
        startingPrice: svc.startingPrice,
        priceLabel: svc.priceLabel,
        displayOrder: svc.displayOrder,
        featured: svc.featured,
        showOnHome: svc.showOnHome,
        published: svc.published,
        seoTitle: svc.seoTitle,
        seoDescription: svc.seoDescription,
        ogImage: svc.ogImage,
        features: svc.serviceFeatures
          .filter((sf) => sf.feature.enabled && sf.feature.showOnPublic)
          .map((sf) => ({
            id: sf.feature.id,
            title: sf.feature.title,
            description: sf.feature.description,
            icon: sf.feature.icon,
            category: sf.feature.category,
            displayOrder: sf.feature.displayOrder,
            enabled: sf.feature.enabled,
            showOnPublic: sf.feature.showOnPublic,
            orderInService: sf.order,
          })),
        createdAt: svc.createdAt.toISOString(),
        updatedAt: svc.updatedAt.toISOString(),
      }));

      try {
        await cacheSet(cacheKey, mapped, CMS_SERVICES_CACHE_TTL_SECONDS);
      } catch (err) {
        logger.warn("[CMS Services] Failed to populate Redis cache", { error: String(err) });
      }

      return mapped;
    }
  } catch (dbErr) {
    logger.warn("[CMS Services] Database fetch failed, falling back to default services", {
      error: String(dbErr),
    });
  }

  // Fallback defaults
  let fallback = DEFAULT_FALLBACK_SERVICES.filter((s) => s.published);
  if (homeOnly) fallback = fallback.filter((s) => s.showOnHome);
  if (featuredOnly) fallback = fallback.filter((s) => s.featured);
  if (limit) fallback = fallback.slice(0, limit);

  return fallback;
}

/**
 * Retrieves a single published service by its URL slug.
 */
export async function getPublicServiceBySlug(slug: string): Promise<CmsService | null> {
  const cacheKey = `${CMS_SERVICES_CACHE_KEYS.SERVICE_SLUG_PREFIX}${slug}`;

  try {
    const cached = await cacheGet<CmsService>(cacheKey);
    if (cached && typeof cached === "object" && cached.slug === slug) {
      return cached;
    }
  } catch (err) {
    logger.warn("[CMS Services] Redis slug cache read failed", { slug, error: String(err) });
  }

  try {
    const svc = await prisma.service.findFirst({
      where: { slug, published: true },
      include: {
        serviceFeatures: {
          include: {
            feature: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (svc) {
      const mapped: CmsService = {
        id: svc.id,
        name: svc.name,
        slug: svc.slug,
        shortDescription: svc.shortDescription,
        description: svc.description,
        icon: svc.icon,
        coverImage: svc.coverImage,
        startingPrice: svc.startingPrice,
        priceLabel: svc.priceLabel,
        displayOrder: svc.displayOrder,
        featured: svc.featured,
        showOnHome: svc.showOnHome,
        published: svc.published,
        seoTitle: svc.seoTitle,
        seoDescription: svc.seoDescription,
        ogImage: svc.ogImage,
        features: svc.serviceFeatures
          .filter((sf) => sf.feature.enabled && sf.feature.showOnPublic)
          .map((sf) => ({
            id: sf.feature.id,
            title: sf.feature.title,
            description: sf.feature.description,
            icon: sf.feature.icon,
            category: sf.feature.category,
            displayOrder: sf.feature.displayOrder,
            enabled: sf.feature.enabled,
            showOnPublic: sf.feature.showOnPublic,
            orderInService: sf.order,
          })),
        createdAt: svc.createdAt.toISOString(),
        updatedAt: svc.updatedAt.toISOString(),
      };

      try {
        await cacheSet(cacheKey, mapped, CMS_SERVICES_CACHE_TTL_SECONDS);
      } catch (err) {
        logger.warn("[CMS Services] Failed to cache service by slug", { slug, error: String(err) });
      }

      return mapped;
    }
  } catch (dbErr) {
    logger.warn("[CMS Services] DB lookup by slug failed", { slug, error: String(dbErr) });
  }

  const fallback = DEFAULT_FALLBACK_SERVICES.find((s) => s.slug === slug && s.published);
  return fallback || null;
}

// ============================================================================
// 2. ADMIN SERVICES OPERATIONS (PROTECTED)
// ============================================================================

export async function getAdminServices(): Promise<CmsService[]> {
  const dbServices = await prisma.service.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    include: {
      serviceFeatures: {
        include: {
          feature: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return dbServices.map((svc) => ({
    id: svc.id,
    name: svc.name,
    slug: svc.slug,
    shortDescription: svc.shortDescription,
    description: svc.description,
    icon: svc.icon,
    coverImage: svc.coverImage,
    startingPrice: svc.startingPrice,
    priceLabel: svc.priceLabel,
    displayOrder: svc.displayOrder,
    featured: svc.featured,
    showOnHome: svc.showOnHome,
    published: svc.published,
    seoTitle: svc.seoTitle,
    seoDescription: svc.seoDescription,
    ogImage: svc.ogImage,
    features: svc.serviceFeatures.map((sf) => ({
      id: sf.feature.id,
      title: sf.feature.title,
      description: sf.feature.description,
      icon: sf.feature.icon,
      category: sf.feature.category,
      displayOrder: sf.feature.displayOrder,
      enabled: sf.feature.enabled,
      showOnPublic: sf.feature.showOnPublic,
      orderInService: sf.order,
    })),
    createdAt: svc.createdAt.toISOString(),
    updatedAt: svc.updatedAt.toISOString(),
  }));
}

export async function getAdminServiceById(id: string): Promise<CmsService | null> {
  const svc = await prisma.service.findUnique({
    where: { id },
    include: {
      serviceFeatures: {
        include: {
          feature: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!svc) return null;

  return {
    id: svc.id,
    name: svc.name,
    slug: svc.slug,
    shortDescription: svc.shortDescription,
    description: svc.description,
    icon: svc.icon,
    coverImage: svc.coverImage,
    startingPrice: svc.startingPrice,
    priceLabel: svc.priceLabel,
    displayOrder: svc.displayOrder,
    featured: svc.featured,
    showOnHome: svc.showOnHome,
    published: svc.published,
    seoTitle: svc.seoTitle,
    seoDescription: svc.seoDescription,
    ogImage: svc.ogImage,
    features: svc.serviceFeatures.map((sf) => ({
      id: sf.feature.id,
      title: sf.feature.title,
      description: sf.feature.description,
      icon: sf.feature.icon,
      category: sf.feature.category,
      displayOrder: sf.feature.displayOrder,
      enabled: sf.feature.enabled,
      showOnPublic: sf.feature.showOnPublic,
      orderInService: sf.order,
    })),
    createdAt: svc.createdAt.toISOString(),
    updatedAt: svc.updatedAt.toISOString(),
  };
}

export async function createService(payload: unknown): Promise<CmsService> {
  const data = serviceCreateSchema.parse(payload);

  // Check slug uniqueness
  const existing = await prisma.service.findUnique({ where: { slug: data.slug } });
  if (existing) {
    throw new Error(`A service with the slug "${data.slug}" already exists.`);
  }

  const { featureIds, ...serviceData } = data;

  const service = await prisma.service.create({
    data: serviceData,
  });

  if (featureIds && featureIds.length > 0) {
    await prisma.serviceFeature.createMany({
      data: featureIds.map((featId, idx) => ({
        serviceId: service.id,
        featureId: featId,
        order: idx + 1,
      })),
    });
  }

  await purgeServicesCache();
  revalidatePathsForService(service.slug);

  const full = await getAdminServiceById(service.id);
  return full!;
}

export async function updateService(id: string, payload: unknown): Promise<CmsService> {
  const data = serviceUpdateSchema.parse(payload);

  const current = await prisma.service.findUnique({ where: { id } });
  if (!current) {
    throw new Error(`Service with ID "${id}" was not found.`);
  }

  if (data.slug && data.slug !== current.slug) {
    const existing = await prisma.service.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== id) {
      throw new Error(`A service with the slug "${data.slug}" already exists.`);
    }
  }

  const { featureIds, ...serviceData } = data;

  await prisma.service.update({
    where: { id },
    data: serviceData,
  });

  if (featureIds !== undefined) {
    await prisma.serviceFeature.deleteMany({
      where: { serviceId: id },
    });

    if (featureIds.length > 0) {
      await prisma.serviceFeature.createMany({
        data: featureIds.map((featId, idx) => ({
          serviceId: id,
          featureId: featId,
          order: idx + 1,
        })),
      });
    }
  }

  await purgeServicesCache();
  revalidatePathsForService(current.slug);
  if (data.slug && data.slug !== current.slug) {
    revalidatePathsForService(data.slug);
  }

  const full = await getAdminServiceById(id);
  return full!;
}

export async function deleteService(id: string): Promise<boolean> {
  const current = await prisma.service.findUnique({ where: { id } });
  if (!current) {
    throw new Error(`Service with ID "${id}" was not found.`);
  }

  await prisma.service.delete({
    where: { id },
  });

  await purgeServicesCache();
  revalidatePathsForService(current.slug);

  return true;
}

// ============================================================================
// 3. ADMIN FEATURES OPERATIONS (PROTECTED)
// ============================================================================

export async function getAdminFeatures(): Promise<CmsFeature[]> {
  const dbFeatures = await prisma.feature.findMany({
    orderBy: [{ category: "asc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    include: {
      serviceFeatures: {
        select: {
          serviceId: true,
        },
      },
    },
  });

  return dbFeatures.map((feat) => ({
    id: feat.id,
    title: feat.title,
    description: feat.description,
    icon: feat.icon,
    category: feat.category,
    displayOrder: feat.displayOrder,
    enabled: feat.enabled,
    showOnPublic: feat.showOnPublic,
    serviceCount: feat.serviceFeatures.length,
    serviceIds: feat.serviceFeatures.map((sf) => sf.serviceId),
    createdAt: feat.createdAt.toISOString(),
    updatedAt: feat.updatedAt.toISOString(),
  }));
}

export async function createFeature(payload: unknown): Promise<CmsFeature> {
  const data = featureCreateSchema.parse(payload);
  const { serviceIds, ...featureData } = data;

  const feat = await prisma.feature.create({
    data: featureData,
  });

  if (serviceIds && serviceIds.length > 0) {
    await prisma.serviceFeature.createMany({
      data: serviceIds.map((svcId, idx) => ({
        serviceId: svcId,
        featureId: feat.id,
        order: idx + 1,
      })),
    });
  }

  await purgeServicesCache();
  return {
    id: feat.id,
    title: feat.title,
    description: feat.description,
    icon: feat.icon,
    category: feat.category,
    displayOrder: feat.displayOrder,
    enabled: feat.enabled,
    showOnPublic: feat.showOnPublic,
    serviceCount: serviceIds?.length || 0,
    serviceIds: serviceIds || [],
    createdAt: feat.createdAt.toISOString(),
    updatedAt: feat.updatedAt.toISOString(),
  };
}

export async function updateFeature(id: string, payload: unknown): Promise<CmsFeature> {
  const data = featureUpdateSchema.parse(payload);
  const { serviceIds, ...featureData } = data;

  const current = await prisma.feature.findUnique({ where: { id } });
  if (!current) {
    throw new Error(`Feature with ID "${id}" was not found.`);
  }

  const feat = await prisma.feature.update({
    where: { id },
    data: featureData,
  });

  if (serviceIds !== undefined) {
    await prisma.serviceFeature.deleteMany({
      where: { featureId: id },
    });

    if (serviceIds.length > 0) {
      await prisma.serviceFeature.createMany({
        data: serviceIds.map((svcId, idx) => ({
          serviceId: svcId,
          featureId: id,
          order: idx + 1,
        })),
      });
    }
  }

  await purgeServicesCache();

  return {
    id: feat.id,
    title: feat.title,
    description: feat.description,
    icon: feat.icon,
    category: feat.category,
    displayOrder: feat.displayOrder,
    enabled: feat.enabled,
    showOnPublic: feat.showOnPublic,
    serviceCount: serviceIds?.length,
    serviceIds: serviceIds,
    createdAt: feat.createdAt.toISOString(),
    updatedAt: feat.updatedAt.toISOString(),
  };
}

export async function deleteFeature(id: string): Promise<boolean> {
  const current = await prisma.feature.findUnique({ where: { id } });
  if (!current) {
    throw new Error(`Feature with ID "${id}" was not found.`);
  }

  await prisma.feature.delete({
    where: { id },
  });

  await purgeServicesCache();
  return true;
}

// ============================================================================
// 4. CACHE INVALIDATION & SEEDING UTILITIES
// ============================================================================

export async function purgeServicesCache(): Promise<void> {
  try {
    await cacheDel([
      CMS_SERVICES_CACHE_KEYS.ALL_SERVICES,
      CMS_SERVICES_CACHE_KEYS.HOME_SERVICES,
      CMS_SERVICES_CACHE_KEYS.ALL_FEATURES,
    ]);
  } catch (err) {
    logger.warn("[CMS Services] Redis purge error", { error: String(err) });
  }
}

function revalidatePathsForService(slug?: string) {
  const paths = ["/services", "/admin/services", "/"];
  if (slug) {
    paths.push(`/services/${slug}`);
  }

  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch {
      // Ignored in test / non-ISR contexts
    }
  }
}

/**
 * Seeds default production services into the database if the table is empty.
 */
export async function seedDefaultServicesIfEmpty(): Promise<number> {
  try {
    const count = await prisma.service.count();
    if (count > 0) return 0;

    logger.info("[CMS Services] Services table is empty, seeding defaults...");

    let seededCount = 0;
    for (const item of DEFAULT_FALLBACK_SERVICES) {
      const { features, ...svcData } = item;

      const createdSvc = await prisma.service.create({
        data: {
          name: svcData.name,
          slug: svcData.slug,
          shortDescription: svcData.shortDescription,
          description: svcData.description,
          icon: svcData.icon,
          coverImage: svcData.coverImage,
          startingPrice: svcData.startingPrice,
          priceLabel: svcData.priceLabel,
          displayOrder: svcData.displayOrder,
          featured: svcData.featured,
          showOnHome: svcData.showOnHome,
          published: svcData.published,
          seoTitle: svcData.seoTitle,
          seoDescription: svcData.seoDescription,
          ogImage: svcData.ogImage,
        },
      });

      for (let i = 0; i < features.length; i++) {
        const feat = features[i];
        const dbFeat = await prisma.feature.create({
          data: {
            title: feat.title,
            description: feat.description,
            icon: feat.icon,
            category: feat.category,
            displayOrder: feat.displayOrder,
            enabled: feat.enabled,
            showOnPublic: feat.showOnPublic,
          },
        });

        await prisma.serviceFeature.create({
          data: {
            serviceId: createdSvc.id,
            featureId: dbFeat.id,
            order: i + 1,
          },
        });
      }
      seededCount++;
    }

    logger.info(`[CMS Services] Successfully seeded ${seededCount} default services`);
    return seededCount;
  } catch (error) {
    logger.error("[CMS Services] Failed to seed default services", { error: String(error) });
    return 0;
  }
}

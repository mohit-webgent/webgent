import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";
import { logger } from "@/lib/logger";

// Blog mutations in the admin API invalidate this key by name.
const CACHE_KEY = "cache:home:composite_data_v2";
const CACHE_TTL_SECONDS = 60;
const PROJECT_LIMIT = 5;

export interface HomeProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string | null;
  demoUrl: string | null;
  imageUrl: string | null;
  screenshots: string[];
}

export interface HomeTestimonial {
  id: string;
  clientName: string;
  clientTitle: string | null;
  company: string | null;
  avatarUrl: string | null;
  rating: number;
  content: string;
}

export interface HomePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  readTime: number | null;
  imageUrl: string | null;
}

export interface HomeData {
  projects: HomeProject[];
  projectCount: number;
  testimonials: HomeTestimonial[];
  posts: HomePost[];
}

const projectSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  category: true,
  demoUrl: true,
  imageUrl: true,
  screenshots: true,
} as const;

/** Screenshots are stored as a JSON array in a text column. */
function parseScreenshots(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((url): url is string => typeof url === "string" && url.length > 0) : [];
  } catch {
    return [];
  }
}

async function loadProjects(): Promise<Pick<HomeData, "projects" | "projectCount">> {
  const [featured, published] = await Promise.all([
    prisma.project.findMany({
      where: { published: true, featured: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: PROJECT_LIMIT,
      select: projectSelect,
    }),
    prisma.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: projectSelect,
    }),
  ]);

  // Nothing flagged as featured still leaves real work to show.
  const pool = featured.length > 0 ? featured : published;
  return {
    projects: pool.slice(0, PROJECT_LIMIT).map((project) => ({ ...project, screenshots: parseScreenshots(project.screenshots) })),
    projectCount: published.length,
  };
}

async function loadTestimonials(): Promise<HomeTestimonial[]> {
  return prisma.testimonial.findMany({
    where: { status: "APPROVED", deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: 4,
    select: {
      id: true,
      clientName: true,
      clientTitle: true,
      company: true,
      avatarUrl: true,
      rating: true,
      content: true,
    },
  });
}

async function loadPosts(): Promise<HomePost[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      category: true,
      readTime: true,
      coverImage: true,
      ogImage: true,
    },
  });

  return posts.map(({ coverImage, ogImage, ...post }) => ({ ...post, imageUrl: coverImage || ogImage || null }));
}

/** Retries once, because a pooled connection dropped between requests is the usual failure. */
async function withRetry<T>(label: string, load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (firstError) {
    logger.warn(`[Home] ${label} query failed, retrying`, { error: String(firstError) });
    return load();
  }
}

/**
 * Loads everything the home page shows. Each block loads independently, so one failing query
 * can't blank the others, and a partial result is never cached.
 */
export async function getHomeData(): Promise<HomeData> {
  const cached = await cacheGet<HomeData>(CACHE_KEY);
  // Entries cached before screenshots were added are skipped and replaced.
  if (cached?.projects?.every((project) => Array.isArray(project.screenshots))) return cached;

  const [projects, testimonials, posts] = await Promise.allSettled([
    withRetry("projects", loadProjects),
    withRetry("testimonials", loadTestimonials),
    withRetry("posts", loadPosts),
  ]);

  const failed = [projects, testimonials, posts].filter((result) => result.status === "rejected");
  failed.forEach((result) =>
    logger.error("[Home] Could not load a home page section", { error: String((result as PromiseRejectedResult).reason) }),
  );

  const data: HomeData = {
    projects: projects.status === "fulfilled" ? projects.value.projects : [],
    projectCount: projects.status === "fulfilled" ? projects.value.projectCount : 0,
    testimonials: testimonials.status === "fulfilled" ? testimonials.value : [],
    posts: posts.status === "fulfilled" ? posts.value : [],
  };

  if (failed.length === 0) {
    await cacheSet(CACHE_KEY, data, CACHE_TTL_SECONDS);
  }

  return data;
}

import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { KNOWN_EVENTS, PageViewInput, EventInput, ValidPeriod } from "@/lib/validations/analytics";

export interface AnalyticsContext {
  sessionId: string;
  isNewSession: boolean;
  country: string;
  device: "desktop" | "mobile" | "tablet" | "other";
  ipHash: string;
}

const HASH_SALT = process.env.AUTH_SECRET || "webgent-analytics-anonymous-salt";

export function extractAnalyticsContext(
  req: NextRequest,
  clientSessionId?: string | null,
  clientDevice?: string | null,
): AnalyticsContext {
  const cookieSessionId = req.cookies.get("webgent_sid")?.value;
  let sessionId = clientSessionId || cookieSessionId;
  let isNewSession = false;

  if (!sessionId || !/^[a-zA-Z0-9_-]{4,64}$/.test(sessionId)) {
    sessionId = `sid_${crypto.randomBytes(16).toString("hex")}`;
    isNewSession = true;
  }

  const countryHeader =
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cloudfront-viewer-country") ||
    req.headers.get("x-country-code") ||
    req.headers.get("x-mock-country");

  let country = "Unknown";
  if (countryHeader && /^[A-Za-z]{2}$/.test(countryHeader.trim())) {
    country = countryHeader.trim().toUpperCase();
  }

  let device: "desktop" | "mobile" | "tablet" | "other" = "desktop";
  if (clientDevice && ["desktop", "mobile", "tablet", "other"].includes(clientDevice)) {
    device = clientDevice as "desktop" | "mobile" | "tablet" | "other";
  } else {
    const userAgent = req.headers.get("user-agent") || "";
    if (
      /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(
        userAgent,
      )
    ) {
      device = "tablet";
    } else if (/(mobi|ipod|phone|iphone|blackberry|opera mini)/i.test(userAgent)) {
      device = "mobile";
    } else {
      device = "desktop";
    }
  }

  const forwarded = req.headers.get("x-forwarded-for");
  const rawIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const ipHash = crypto
    .createHmac("sha256", HASH_SALT)
    .update(rawIp)
    .digest("hex")
    .substring(0, 16);

  return {
    sessionId,
    isNewSession,
    country,
    device,
    ipHash,
  };
}

export class AnalyticsService {
  async recordPageView(req: NextRequest, input: PageViewInput) {
    const context = extractAnalyticsContext(req, input.sessionId, input.device);
    const userAgent = req.headers.get("user-agent")?.substring(0, 255) || null;

    const pageView = await prisma.pageView.create({
      data: {
        path: input.path,
        referrer: input.referrer || null,
        userAgent,
        ipHash: context.ipHash,
        country: context.country,
        device: context.device,
        sessionId: context.sessionId,
      },
    });

    return { pageView, context };
  }

  async recordEvent(req: NextRequest, input: EventInput) {
    const context = extractAnalyticsContext(req, input.sessionId, input.device);

    const event = await prisma.event.create({
      data: {
        name: input.name,
        category: input.category || null,
        path: input.path || null,
        metadata: input.metadata || null,
        sessionId: context.sessionId,
        country: context.country,
        device: context.device,
      },
    });

    return { event, context };
  }

  async getAdminAnalytics(period: ValidPeriod = "30d") {
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [pageViews, events] = await Promise.all([
      prisma.pageView.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          id: true,
          path: true,
          country: true,
          device: true,
          sessionId: true,
          ipHash: true,
          createdAt: true,
        },
      }),
      prisma.event.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          id: true,
          name: true,
          category: true,
          path: true,
          sessionId: true,
          createdAt: true,
        },
      }),
    ]);

    const totalPageViews = pageViews.length;
    const uniqueSessions = new Set<string>();
    pageViews.forEach((pv) => {
      if (pv.sessionId) uniqueSessions.add(pv.sessionId);
      else if (pv.ipHash) uniqueSessions.add(pv.ipHash);
    });
    const uniqueVisitors = uniqueSessions.size;

    const pageCounts: Record<string, { views: number; sessions: Set<string> }> = {};
    pageViews.forEach((pv) => {
      if (!pageCounts[pv.path]) {
        pageCounts[pv.path] = { views: 0, sessions: new Set() };
      }
      pageCounts[pv.path].views += 1;
      if (pv.sessionId) pageCounts[pv.path].sessions.add(pv.sessionId);
    });

    const topPages = Object.entries(pageCounts)
      .map(([path, data]) => ({
        path,
        views: data.views,
        uniqueVisitors: data.sessions.size,
        percentage:
          totalPageViews > 0 ? Number(((data.views / totalPageViews) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const eventCounts: Record<string, number> = {};
    KNOWN_EVENTS.forEach((e) => {
      if (e !== "PAGE_VIEW") eventCounts[e] = 0;
    });

    events.forEach((ev) => {
      eventCounts[ev.name] = (eventCounts[ev.name] || 0) + 1;
    });

    const funnelCtaClicks = (eventCounts["CTA_CLICK"] || 0) + (eventCounts["DEMO_CLICK"] || 0);
    const funnelFormStarts = eventCounts["FORM_START"] || 0;
    const funnelFormSubmits = eventCounts["FORM_SUBMIT"] || 0;

    const conversionFunnel = [
      {
        step: "Visitors",
        count: totalPageViews > 0 ? uniqueVisitors : 0,
        rate: 100,
        dropOff: 0,
      },
      {
        step: "Engagement (CTA/Demo)",
        count: funnelCtaClicks,
        rate:
          uniqueVisitors > 0 ? Number(((funnelCtaClicks / uniqueVisitors) * 100).toFixed(1)) : 0,
        dropOff:
          uniqueVisitors > 0
            ? Number(Math.max(0, 100 - (funnelCtaClicks / uniqueVisitors) * 100).toFixed(1))
            : 0,
      },
      {
        step: "Form Started",
        count: funnelFormStarts,
        rate:
          funnelCtaClicks > 0 ? Number(((funnelFormStarts / funnelCtaClicks) * 100).toFixed(1)) : 0,
        dropOff:
          funnelCtaClicks > 0
            ? Number(Math.max(0, 100 - (funnelFormStarts / funnelCtaClicks) * 100).toFixed(1))
            : 0,
      },
      {
        step: "Form Submitted",
        count: funnelFormSubmits,
        rate:
          funnelFormStarts > 0
            ? Number(((funnelFormSubmits / funnelFormStarts) * 100).toFixed(1))
            : 0,
        dropOff:
          funnelFormStarts > 0
            ? Number(Math.max(0, 100 - (funnelFormSubmits / funnelFormStarts) * 100).toFixed(1))
            : 0,
      },
    ];

    const overallConversionRate =
      uniqueVisitors > 0 ? Number(((funnelFormSubmits / uniqueVisitors) * 100).toFixed(2)) : 0;

    const deviceCounts: Record<string, number> = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
      other: 0,
    };

    pageViews.forEach((pv) => {
      const dev = pv.device || "desktop";
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
    });

    const deviceSplit = Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      count,
      percentage: totalPageViews > 0 ? Number(((count / totalPageViews) * 100).toFixed(1)) : 0,
    }));

    const countryCounts: Record<string, number> = {};
    pageViews.forEach((pv) => {
      const c = pv.country || "Unknown";
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });

    const countryDistribution = Object.entries(countryCounts)
      .map(([country, count]) => ({
        country,
        count,
        percentage: totalPageViews > 0 ? Number(((count / totalPageViews) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const dayMap: Record<string, { views: number; events: number; sessions: Set<string> }> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split("T")[0];
      dayMap[key] = { views: 0, events: 0, sessions: new Set() };
    }

    pageViews.forEach((pv) => {
      const key = pv.createdAt.toISOString().split("T")[0];
      if (dayMap[key]) {
        dayMap[key].views += 1;
        if (pv.sessionId) dayMap[key].sessions.add(pv.sessionId);
      }
    });

    events.forEach((ev) => {
      const key = ev.createdAt.toISOString().split("T")[0];
      if (dayMap[key]) {
        dayMap[key].events += 1;
      }
    });

    const timeline = Object.entries(dayMap).map(([date, data]) => ({
      date,
      views: data.views,
      events: data.events,
      visitors: data.sessions.size,
    }));

    return {
      period,
      days,
      startDate: startDate.toISOString(),
      summary: {
        totalPageViews,
        uniqueVisitors,
        totalEvents: events.length,
        overallConversionRate,
      },
      topPages,
      eventCounts,
      conversionFunnel,
      deviceSplit,
      countryDistribution,
      timeline,
    };
  }
}

export const analyticsService = new AnalyticsService();

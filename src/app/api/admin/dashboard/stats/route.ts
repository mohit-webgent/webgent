import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const authGuard = await verifyAdminApiAccess();
  if (authGuard instanceof Response) {
    return authGuard;
  }

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      allLeads,
      recentLeads,
      totalProjects,
      publishedProjects,
      totalPosts,
      publishedPosts,
      totalTestimonials,
      approvedTestimonials,
      totalSubscribers,
      activeSubscribers,
      totalChatSessions,
      activeChatSessions,
      totalPageViews,
      pageViewsLast7Days,
      pageViewsLast30Days,
      totalEvents,
      topPageViewsGrouped,
    ] = await Promise.all([
      prisma.lead
        .findMany({
          select: { id: true, status: true, score: true },
        })
        .catch(() => []),
      prisma.lead
        .findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            service: true,
            budget: true,
            score: true,
            status: true,
            createdAt: true,
          },
        })
        .catch(() => []),
      prisma.project.count().catch(() => 0),
      prisma.project.count({ where: { published: true } }).catch(() => 0),
      prisma.blogPost.count({ where: { deletedAt: null } }).catch(() => 0),
      prisma.blogPost
        .count({
          where: { status: "PUBLISHED", deletedAt: null },
        })
        .catch(() => 0),
      prisma.testimonial.count({ where: { deletedAt: null } }).catch(() => 0),
      prisma.testimonial
        .count({
          where: { status: "APPROVED", deletedAt: null },
        })
        .catch(() => 0),
      prisma.subscriber.count().catch(() => 0),
      prisma.subscriber.count({ where: { isActive: true } }).catch(() => 0),
      prisma.chatSession.count().catch(() => 0),
      prisma.chatSession.count({ where: { status: "ACTIVE" } }).catch(() => 0),
      prisma.pageView.count().catch(() => 0),
      prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }).catch(() => 0),
      prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }).catch(() => 0),
      prisma.event.count().catch(() => 0),
      prisma.pageView
        .groupBy({
          by: ["path"],
          _count: { path: true },
          orderBy: { _count: { path: "desc" } },
          take: 5,
        })
        .catch(() => []),
    ]);

    const totalLeads = allLeads.length;
    let newLeads = 0;
    let contactedLeads = 0;
    let proposalSentLeads = 0;
    let wonLeads = 0;
    let lostLeads = 0;
    let onHoldLeads = 0;
    let scoreSum = 0;

    for (const lead of allLeads) {
      scoreSum += lead.score;
      switch (lead.status) {
        case "NEW":
          newLeads++;
          break;
        case "CONTACTED":
          contactedLeads++;
          break;
        case "PROPOSAL_SENT":
          proposalSentLeads++;
          break;
        case "WON":
          wonLeads++;
          break;
        case "LOST":
          lostLeads++;
          break;
        case "ON_HOLD":
          onHoldLeads++;
          break;
      }
    }

    const conversionRate = totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0;
    const averageScore = totalLeads > 0 ? Math.round(scoreSum / totalLeads) : 0;

    const topPages = topPageViewsGrouped.map((item) => ({
      path: item.path,
      views: item._count.path,
    }));

    return ApiResponse.success({
      leads: {
        total: totalLeads,
        new: newLeads,
        contacted: contactedLeads,
        proposalSent: proposalSentLeads,
        won: wonLeads,
        lost: lostLeads,
        onHold: onHoldLeads,
        conversionRate,
        averageScore,
        recent: recentLeads,
      },
      content: {
        projects: { total: totalProjects, published: publishedProjects },
        blogPosts: { total: totalPosts, published: publishedPosts },
        testimonials: {
          total: totalTestimonials,
          approved: approvedTestimonials,
        },
        subscribers: { total: totalSubscribers, active: activeSubscribers },
        chat: { total: totalChatSessions, active: activeChatSessions },
      },
      analytics: {
        totalPageViews,
        last7Days: pageViewsLast7Days,
        last30Days: pageViewsLast30Days,
        totalEvents,
        topPages,
      },
    });
  } catch (error) {
    logger.error("Failed to calculate admin dashboard stats", { error });
    return ApiResponse.internalError("Failed to load dashboard metrics.");
  }
}

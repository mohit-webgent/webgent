import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Overview — Webgent Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
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

    const initialData = {
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
        recent: recentLeads.map((l) => ({
          ...l,
          createdAt: l.createdAt.toISOString(),
        })),
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
    };

    return (
      <AdminDashboardView
        initialData={initialData}
        userName={session.user.name || undefined}
      />
    );
  } catch (error) {
    logger.error("[AdminDashboardPage] Error calculating dashboard metrics", { error });

    const safeDefaultData = {
      leads: {
        total: 0,
        new: 0,
        contacted: 0,
        proposalSent: 0,
        won: 0,
        lost: 0,
        onHold: 0,
        conversionRate: 0,
        averageScore: 0,
        recent: [],
      },
      content: {
        projects: { total: 0, published: 0 },
        blogPosts: { total: 0, published: 0 },
        testimonials: { total: 0, approved: 0 },
        subscribers: { total: 0, active: 0 },
        chat: { total: 0, active: 0 },
      },
      analytics: {
        totalPageViews: 0,
        last7Days: 0,
        last30Days: 0,
        totalEvents: 0,
        topPages: [],
      },
    };

    return (
      <AdminDashboardView
        initialData={safeDefaultData}
        userName={session.user.name || undefined}
      />
    );
  }
}

import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export const metadata = {
  title: "Dashboard Overview — Webgent Admin",
};

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Parallel fetch real database metrics for instantaneous first paint
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
    prisma.lead.findMany({
      select: { id: true, status: true, score: true },
    }),
    prisma.lead.findMany({
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
    }),
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.blogPost.count({ where: { deletedAt: null } }),
    prisma.blogPost.count({
      where: { status: "PUBLISHED", deletedAt: null },
    }),
    prisma.testimonial.count({ where: { deletedAt: null } }),
    prisma.testimonial.count({
      where: { status: "APPROVED", deletedAt: null },
    }),
    prisma.subscriber.count(),
    prisma.subscriber.count({ where: { isActive: true } }),
    prisma.chatSession.count(),
    prisma.chatSession.count({ where: { status: "ACTIVE" } }),
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.event.count(),
    prisma.pageView.groupBy({
      by: ["path"],
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 5,
    }),
  ]);

  // Aggregate lead metrics
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

  const conversionRate =
    totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0;
  const averageScore =
    totalLeads > 0 ? Math.round(scoreSum / totalLeads) : 0;

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
}

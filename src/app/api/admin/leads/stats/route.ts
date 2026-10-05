import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const [total, newLeads, contacted, proposalSent, won, lost, onHold, avgScoreResult] =
      await Promise.all([
        prisma.lead.count(),
        prisma.lead.count({ where: { status: "NEW" } }),
        prisma.lead.count({ where: { status: "CONTACTED" } }),
        prisma.lead.count({ where: { status: "PROPOSAL_SENT" } }),
        prisma.lead.count({ where: { status: "WON" } }),
        prisma.lead.count({ where: { status: "LOST" } }),
        prisma.lead.count({ where: { status: "ON_HOLD" } }),
        prisma.lead.aggregate({
          _avg: { score: true },
        }),
      ]);

    const conversionRate = total > 0 ? Number(((won / total) * 100).toFixed(1)) : 0;
    const averageScore = Number((avgScoreResult._avg.score || 0).toFixed(1));

    return ApiResponse.success({
      total,
      byStatus: {
        NEW: newLeads,
        CONTACTED: contacted,
        PROPOSAL_SENT: proposalSent,
        WON: won,
        LOST: lost,
        ON_HOLD: onHold,
      },
      conversionRate,
      averageScore,
    });
  } catch (error) {
    logger.error("Error fetching lead statistics", { error: String(error) });
    return ApiResponse.internalError("Failed to calculate lead statistics.");
  }
}

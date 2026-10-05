import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { SubscriberStatus, Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const statusParam = searchParams.get("status")?.toUpperCase();
    const format =
      searchParams.get("format")?.toLowerCase() ||
      (searchParams.get("export") === "csv" ? "csv" : "json");
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 200);
    const skip = (page - 1) * limit;

    const where: Prisma.SubscriberWhereInput = {};

    if (
      statusParam &&
      statusParam !== "ALL" &&
      Object.values(SubscriberStatus).includes(statusParam as SubscriberStatus)
    ) {
      where.status = statusParam as SubscriberStatus;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (format === "csv") {
      const subscribers = await prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 10000,
      });

      const csvContent = generateSafeCsv(subscribers);
      const dateString = new Date().toISOString().split("T")[0];

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="webgent-subscribers-${dateString}.csv"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    const [total, subscribers] = await Promise.all([
      prisma.subscriber.count({ where }),
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const sanitized = subscribers.map((sub) => ({
      id: sub.id,
      email: sub.email,
      name: sub.name,
      status: sub.status,
      isActive: sub.isActive,
      subscribedAt: sub.subscribedAt,
      unsubscribedAt: sub.unsubscribedAt,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
      hasPendingToken: !!sub.confirmationToken,
      tokenExpiresAt: sub.tokenExpiresAt,
    }));

    return ApiResponse.success(sanitized, 200, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching newsletter subscribers", {
      error: String(error),
    });
    return ApiResponse.internalError("Failed to fetch newsletter subscribers.");
  }
}

function generateSafeCsv(
  subscribers: Array<{
    id: string;
    email: string;
    name: string | null;
    status: SubscriberStatus;
    isActive: boolean;
    subscribedAt: Date | null;
    unsubscribedAt: Date | null;
    createdAt: Date;
  }>,
): string {
  const headers = [
    "Subscriber ID",
    "Email Address",
    "Full Name",
    "Status",
    "Is Active",
    "Subscribed Date",
    "Unsubscribed Date",
    "Created Date",
  ];

  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    let str = String(val).trim();

    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }

    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = subscribers.map((s) => [
    escapeCell(s.id),
    escapeCell(s.email),
    escapeCell(s.name || ""),
    escapeCell(s.status),
    escapeCell(s.isActive ? "Yes" : "No"),
    escapeCell(s.subscribedAt ? s.subscribedAt.toISOString() : ""),
    escapeCell(s.unsubscribedAt ? s.unsubscribedAt.toISOString() : ""),
    escapeCell(s.createdAt.toISOString()),
  ]);

  return [headers.map(escapeCell).join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}

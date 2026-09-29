import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { SubscriberStatus, Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

/**
 * Admin Newsletter Subscribers API
 * GET /api/admin/newsletter/subscribers
 * 
 * Supports:
 * - Status filter: ALL, PENDING, ACTIVE, UNSUBSCRIBED
 * - Search: email or name
 * - Pagination: page, limit
 * - CSV Export: format=csv or export=csv
 */
export async function GET(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const statusParam = searchParams.get("status")?.toUpperCase();
    const format = searchParams.get("format")?.toLowerCase() || (searchParams.get("export") === "csv" ? "csv" : "json");
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 200);
    const skip = (page - 1) * limit;

    const where: Prisma.SubscriberWhereInput = {};

    // Filter by status if specified
    if (statusParam && statusParam !== "ALL" && Object.values(SubscriberStatus).includes(statusParam as SubscriberStatus)) {
      where.status = statusParam as SubscriberStatus;
    }

    // Search query on email or name
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    // Handle CSV Export
    if (format === "csv") {
      const subscribers = await prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 10000, // Export up to 10k subscribers per export batch
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

    // Default JSON Paginated Response
    const [total, subscribers] = await Promise.all([
      prisma.subscriber.count({ where }),
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    // Omit sensitive raw token strings from JSON API response for safety
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
    logger.error("Error fetching newsletter subscribers", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch newsletter subscribers.");
  }
}

/**
 * Generates an RFC 4180 compliant CSV string with CSV injection defense.
 */
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
  }>
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

    // Prevent formula injection in spreadsheet applications (Excel, LibreOffice, Google Sheets)
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }

    // Escape internal double quotes by doubling them
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

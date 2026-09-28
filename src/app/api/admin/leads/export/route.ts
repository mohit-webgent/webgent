import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { logger } from "@/lib/logger";

function escapeCsvCell(cell: string | number | null | undefined): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Company",
      "Service",
      "Budget",
      "Status",
      "Score",
      "Message",
      "Notes",
      "FollowUpDate",
      "CreatedAt",
    ];

    const csvRows = [headers.join(",")];

    for (const lead of leads) {
      const row = [
        escapeCsvCell(lead.id),
        escapeCsvCell(lead.name),
        escapeCsvCell(lead.email),
        escapeCsvCell(lead.phone),
        escapeCsvCell(lead.company),
        escapeCsvCell(lead.service),
        escapeCsvCell(lead.budget),
        escapeCsvCell(lead.status),
        escapeCsvCell(lead.score),
        escapeCsvCell(lead.message),
        escapeCsvCell(lead.notes),
        escapeCsvCell(lead.followUpDate ? lead.followUpDate.toISOString() : ""),
        escapeCsvCell(lead.createdAt.toISOString()),
      ];
      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\r\n");
    const filename = `webgent-leads-export-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    logger.error("Error exporting leads to CSV", { error: String(error) });
    return ApiResponse.internalError("Failed to export CSV.");
  }
}

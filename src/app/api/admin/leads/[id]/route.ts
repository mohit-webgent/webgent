import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { leadUpdateSchema } from "@/lib/validations/contact";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return ApiResponse.notFound("Lead not found.");
    }

    return ApiResponse.success(lead);
  } catch (error) {
    logger.error("Error fetching lead detail", { error: String(error) });
    return ApiResponse.internalError("Failed to retrieve lead details.");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;

    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      return ApiResponse.notFound("Lead not found.");
    }

    const body = await req.json().catch(() => ({}));
    const validation = leadUpdateSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid lead update parameters.",
        validation.error.flatten().fieldErrors,
      );
    }

    const { status, notes, followUpDate } = validation.data;

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (followUpDate !== undefined) {
      updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    logger.info("Updated lead record", {
      leadId: id,
      status: updatedLead.status,
    });

    return ApiResponse.success(updatedLead);
  } catch (error) {
    logger.error("Error updating lead", { error: String(error) });
    return ApiResponse.internalError("Failed to update lead.");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const { id } = params;

    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      return ApiResponse.notFound("Lead not found.");
    }

    await prisma.lead.delete({
      where: { id },
    });

    logger.info("Deleted lead record", { leadId: id });

    return ApiResponse.success({ message: "Lead successfully deleted." });
  } catch (error) {
    logger.error("Error deleting lead", { error: String(error) });
    return ApiResponse.internalError("Failed to delete lead.");
  }
}

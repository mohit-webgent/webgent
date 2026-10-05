import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { testimonialSchema } from "@/lib/validations/testimonial";
import { TestimonialStatus, Prisma } from "@prisma/client";
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
    const featuredParam = searchParams.get("featured");
    const includeDeleted = searchParams.get("includeDeleted") === "true";
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TestimonialWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (
      statusParam &&
      statusParam !== "ALL" &&
      Object.values(TestimonialStatus).includes(statusParam as TestimonialStatus)
    ) {
      where.status = statusParam as TestimonialStatus;
    }

    if (featuredParam === "true") {
      where.featured = true;
    } else if (featuredParam === "false") {
      where.featured = false;
    }

    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { clientTitle: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, testimonials] = await Promise.all([
      prisma.testimonial.count({ where }),
      prisma.testimonial.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
    ]);

    const formatted = testimonials.map((t) => ({
      ...t,
      designation: t.clientTitle,
      quote: t.content,
      photoUrl: t.avatarUrl,
    }));

    return ApiResponse.success(formatted, 200, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching admin testimonials", { error: String(error) });
    return ApiResponse.internalError("Failed to fetch testimonials.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const body = await req.json().catch(() => ({}));
    const validation = testimonialSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid testimonial parameters",
        validation.error.flatten().fieldErrors,
      );
    }

    const data = validation.data;

    let orderToSet = data.order;
    if (orderToSet === 0) {
      const maxOrder = await prisma.testimonial.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
      });
      orderToSet = (maxOrder?.order ?? -1) + 1;
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        clientName: data.clientName,
        clientTitle: data.clientTitle,
        company: data.company,
        content: data.content,
        avatarUrl: data.avatarUrl,
        rating: data.rating,
        featured: data.featured,
        status: data.status,
        order: orderToSet,
      },
    });

    logger.info("Admin created testimonial record", {
      testimonialId: testimonial.id,
      clientName: testimonial.clientName,
    });

    return ApiResponse.success(
      {
        ...testimonial,
        designation: testimonial.clientTitle,
        quote: testimonial.content,
        photoUrl: testimonial.avatarUrl,
      },
      201,
    );
  } catch (error) {
    logger.error("Error creating testimonial", { error: String(error) });
    return ApiResponse.internalError("Failed to create testimonial.");
  }
}

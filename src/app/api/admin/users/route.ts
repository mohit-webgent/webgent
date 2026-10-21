import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import { recordAuditLog } from "@/lib/services/audit-log";
import { UserRole, UserStatus, Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  role: z.enum(["ADMIN", "EDITOR", "USER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function GET(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    if (authGuard.session.user.role !== "ADMIN") {
      return ApiResponse.forbidden("Only system administrators can manage users.");
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const roleParam = searchParams.get("role")?.toUpperCase();
    const statusParam = searchParams.get("status")?.toUpperCase();
    const search = searchParams.get("search")?.trim() || "";

    const where: Prisma.UserWhereInput = {};

    if (roleParam && Object.values(UserRole).includes(roleParam as UserRole)) {
      where.role = roleParam as UserRole;
    }

    if (statusParam && Object.values(UserStatus).includes(statusParam as UserStatus)) {
      where.status = statusParam as UserStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatarUrl: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { posts: true, projects: true },
          },
        },
      }),
    ]);

    return ApiResponse.success(users, 200, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    logger.error("[Admin Users API] Failed to query users", { error });
    return ApiResponse.internalError("Failed to retrieve users.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    if (authGuard.session.user.role !== "ADMIN") {
      return ApiResponse.forbidden("Only system administrators can create accounts.");
    }

    const body = await req.json().catch(() => ({}));
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid user creation parameters.",
        validation.error.flatten().fieldErrors,
      );
    }

    const { email, name, role, status, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return ApiResponse.conflict(`A user with email ${normalizedEmail} already exists.`);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        role: role as UserRole,
        status: status as UserStatus,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    await recordAuditLog("USER_CREATED", {
      actorId: authGuard.session.user.id,
      actorEmail: authGuard.session.user.email,
      createdUserId: newUser.id,
      createdUserEmail: newUser.email,
      assignedRole: newUser.role,
      assignedStatus: newUser.status,
    });

    return ApiResponse.success(newUser, 201, {
      message: "User account successfully created.",
    });
  } catch (error) {
    logger.error("[Admin Users API] Error creating user", { error });
    return ApiResponse.internalError("Failed to create user account.");
  }
}

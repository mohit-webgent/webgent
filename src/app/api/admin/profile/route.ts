import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized access" },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    logger.error("Failed to fetch admin profile", { error });
    return NextResponse.json(
      { success: false, error: "Failed to retrieve profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized access" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validated = updateProfileSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { name, avatarUrl } = validated.data;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        avatarUrl: avatarUrl ? avatarUrl.trim() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    logger.error("Failed to update admin profile", { error });
    return NextResponse.json(
      { success: false, error: "Failed to save profile changes" },
      { status: 500 }
    );
  }
}

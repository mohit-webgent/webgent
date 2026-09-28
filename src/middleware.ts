import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exempt public auth endpoints and login page
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const isActive = token?.status === "ACTIVE";
  const isAdminOrEditor = token?.role === "ADMIN" || token?.role === "EDITOR";

  // Enforce API security for /api/admin/*
  if (isAdminApiRoute) {
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to access admin resources.",
          },
        },
        { status: 401 }
      );
    }

    if (!isActive || !isAdminOrEditor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Access denied. Inactive account or insufficient permissions.",
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // Enforce page security for /admin/*
  if (isAdminRoute) {
    if (!isAuthenticated || !isActive || !isAdminOrEditor) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

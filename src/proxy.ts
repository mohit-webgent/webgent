import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SECURE_SESSION_COOKIE = "__Secure-authjs.session-token";

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  // Auth.js names the cookie after the protocol of AUTH_URL or the request, and the salt follows
  // that name. getToken defaults to the insecure name, so it must be told which one was issued, or
  // every signed-in request over HTTPS looks signed out. Large tokens are split into ".0", ".1"...
  const secureCookie = req.cookies
    .getAll()
    .some(({ name }) => name === SECURE_SESSION_COOKIE || name.startsWith(`${SECURE_SESSION_COOKIE}.`));

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    secureCookie,
  });

  const isAuthenticated = !!token;
  const isActive = token?.status === "ACTIVE";
  const isAdminOrEditor = token?.role === "ADMIN" || token?.role === "EDITOR";

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
        { status: 401 },
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
        { status: 403 },
      );
    }

    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!isAuthenticated || !isActive || !isAdminOrEditor) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

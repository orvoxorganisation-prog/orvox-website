import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (formerly Middleware). Optimistic auth gate for the admin
 * area: it only checks for the presence of the admin session cookie and
 * redirects to the login page when it's missing. Real session validation +
 * RBAC happen in the admin layout's Data Access Layer (Node runtime, DB-backed)
 * — per Next.js guidance, the proxy must not do data fetching for auth.
 */
const ADMIN_COOKIE = "orvox_admin";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login + the 403 screen must stay reachable without a session.
  if (pathname === "/admin/login" || pathname === "/admin/403") {
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const hasCookie = request.cookies.has(ADMIN_COOKIE);
    if (!hasCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

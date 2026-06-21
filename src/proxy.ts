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

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    ""
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Optional admin IP allowlist (opt-in via ADMIN_IP_ALLOWLIST). Applies to the
  // entire /admin tree, including the login page, so locked-down deployments
  // can restrict admin access to office/VPN ranges.
  const allow = (process.env.ADMIN_IP_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allow.length > 0 && !allow.includes(clientIp(request))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

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

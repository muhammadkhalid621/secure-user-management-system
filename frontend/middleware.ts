import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAMES,
  APP_ROUTES,
  PROTECTED_ROUTES,
  PUBLIC_ONLY_ROUTES
} from "@/lib/constants";

const startsWithAny = (pathname: string, routes: readonly string[]) =>
  routes.some((route) => pathname.startsWith(route));

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = Boolean(request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value);
  const hasRefreshToken = Boolean(request.cookies.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value);
  const hasSessionHint = hasAccessToken || hasRefreshToken;

  if (startsWithAny(pathname, PROTECTED_ROUTES) && !hasSessionHint) {
    return NextResponse.redirect(new URL(APP_ROUTES.LOGIN, request.url));
  }

  // Only an active access token should bounce public auth pages immediately.
  // A refresh-only cookie may be expired or otherwise invalid, and redirecting
  // it to /dashboard can create a login <-> dashboard loop.
  if (startsWithAny(pathname, PUBLIC_ONLY_ROUTES) && hasAccessToken) {
    return NextResponse.redirect(new URL(APP_ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"]
};

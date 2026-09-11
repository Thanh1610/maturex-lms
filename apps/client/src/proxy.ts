import { type NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/features/auth/services/jwt-service";

import { APP_ROUTES } from "@/lib/api-routes";

const ACCESS_COOKIE_NAME = "mx_access_token";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Bypass static assets, API routes, and public files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Read access token from cookie
  const accessToken = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const user = accessToken ? await verifyAccessToken(accessToken) : null;

  // 3. If accessing /auth/login while already authenticated, redirect to home
  if (pathname.startsWith(APP_ROUTES.auth.login)) {
    if (user) {
      return NextResponse.redirect(new URL(APP_ROUTES.home, req.url));
    }
    return NextResponse.next();
  }

  // 4. For all protected pages, if not authenticated, redirect to /auth/login
  if (!user) {
    const loginUrl = new URL(APP_ROUTES.auth.login, req.url);
    // Lưu callbackUrl để sau khi login có thể redirect lại đúng trang đang xem
    if (pathname !== APP_ROUTES.home) {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

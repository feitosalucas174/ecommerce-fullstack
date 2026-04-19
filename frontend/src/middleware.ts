import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/pedidos", "/checkout"];
// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read tokens from cookies (set on login for SSR-compatible auth)
  const token = request.cookies.get("access_token")?.value;
  const userCookie = request.cookies.get("user")?.value;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if ((isProtected || isAdmin) && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdmin && userCookie) {
    try {
      const user = JSON.parse(userCookie);
      if (user.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/pedidos/:path*", "/checkout/:path*"],
};

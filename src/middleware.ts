import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Check for admin session cookie
  const session = request.cookies.get("admin_session")?.value;
  const validSession = process.env.ADMIN_SECRET ?? "nurseryadmin2024";

  if (session === validSession) return NextResponse.next();

  // Not authenticated — redirect to login
  const loginUrl = new URL("/admin-login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { default as globalConfig } from "@/lib/config"
import { getSessionCookie } from "better-auth/cookies"
import { NextRequest, NextResponse } from "next/server"

export default async function middleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.startsWith("/monitoring")) {
    return NextResponse.next()
  }

  if (globalConfig.selfHosted.isEnabled) {
    // Self-hosted mode: allow all authenticated routes
    // Auth is handled by getCurrentUser() in server components
    return NextResponse.next()
  }

  const sessionCookie = getSessionCookie(request, { cookiePrefix: "taxhacker" })
  if (!sessionCookie) {
    return NextResponse.redirect(new URL(globalConfig.auth.loginUrl, request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/transactions/:path*",
    "/settings/:path*",
    "/export/:path*",
    "/import/:path*",
    "/unsorted/:path*",
    "/files/:path*",
    "/dashboard/:path*",
    "/apps/:path*",
  ],
}


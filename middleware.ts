import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple rate limiting map
const ipRequestCounts = new Map<string, { count: number; timestamp: number }>()

// Rate limit configuration
const RATE_LIMIT = 100 // requests
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Get client IP
  const ip = request.ip || "unknown"

  // Check rate limit
  const now = Date.now()
  const ipData = ipRequestCounts.get(ip) || { count: 0, timestamp: now }

  // Reset counter if outside window
  if (now - ipData.timestamp > RATE_LIMIT_WINDOW) {
    ipData.count = 0
    ipData.timestamp = now
  }

  // Increment counter
  ipData.count++
  ipRequestCounts.set(ip, ipData)

  // Check if rate limit exceeded
  if (ipData.count > RATE_LIMIT) {
    return new NextResponse(
      JSON.stringify({
        error: "Rate limit exceeded",
        message: "Too many requests, please try again later",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": RATE_LIMIT.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": (Math.ceil(ipData.timestamp / 1000) + RATE_LIMIT_WINDOW / 1000).toString(),
        },
      },
    )
  }

  // Add rate limit headers
  const response = NextResponse.next()
  response.headers.set("X-RateLimit-Limit", RATE_LIMIT.toString())
  response.headers.set("X-RateLimit-Remaining", (RATE_LIMIT - ipData.count).toString())
  response.headers.set("X-RateLimit-Reset", (Math.ceil(ipData.timestamp / 1000) + RATE_LIMIT_WINDOW / 1000).toString())

  return response
}

export const config = {
  matcher: "/api/:path*",
}

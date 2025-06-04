import { NextResponse } from "next/server"
import { getDbStatus } from "@/lib/database/connection"
import { getScraperStatus } from "@/lib/services/scraperManager"
import { getCacheStatus } from "@/lib/services/cacheService"

export async function GET() {
  try {
    const dbStatus = await getDbStatus()
    const scraperStatus = await getScraperStatus()
    const cacheStatus = await getCacheStatus()

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      components: {
        database: dbStatus,
        scraper: scraperStatus,
        cache: cacheStatus,
      },
    })
  } catch (error: any) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message || "An error occurred during health check",
      },
      { status: 500 },
    )
  }
}

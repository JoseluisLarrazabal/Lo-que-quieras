import { NextResponse } from "next/server"
import { testScrapers } from "@/lib/services/scraperManager"

// This endpoint should be protected in production
export async function GET() {
  try {
    const results = await testScrapers()
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Test scrapers error:", error)
    return NextResponse.json({ error: error.message || "An error occurred during scraper testing" }, { status: 500 })
  }
}

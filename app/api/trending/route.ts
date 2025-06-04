import { NextResponse } from "next/server"
import { getPopularSearches } from "@/lib/models/searchModel"

export async function GET() {
  try {
    const trendingSearches = await getPopularSearches(10)
    return NextResponse.json({ trending: trendingSearches })
  } catch (error: any) {
    console.error("Get trending searches error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while fetching trending searches" },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { getSearchHistory, clearSearchHistory } from "@/lib/models/searchModel"

export async function GET() {
  try {
    const history = await getSearchHistory()
    return NextResponse.json({ history })
  } catch (error: any) {
    console.error("Get search history error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while fetching search history" },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    await clearSearchHistory()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Clear search history error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while clearing search history" },
      { status: 500 },
    )
  }
}

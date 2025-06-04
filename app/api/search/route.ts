import { NextResponse } from "next/server"
import { searchProducts } from "@/lib/services/searchService"
import { addToSearchHistory } from "@/lib/models/searchModel"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : undefined
    const maxPrice = searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : undefined
    const category = searchParams.get("category") || undefined
    const marketplace = searchParams.get("marketplace") || undefined

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // Add to search history
    await addToSearchHistory(query)

    // Search products
    const results = await searchProducts({
      query,
      minPrice,
      maxPrice,
      category,
      marketplace,
    })

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error("Search error:", error)
    return NextResponse.json({ error: error.message || "An error occurred during search" }, { status: 500 })
  }
}

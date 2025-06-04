import { NextResponse } from "next/server"
import { deleteOldProducts } from "@/lib/models/productModel"
import { clearMemoryCache } from "@/lib/services/cacheService"

// This endpoint should be protected in production
export async function POST() {
  try {
    // Delete old products (older than 24 hours)
    const deletedCount = await deleteOldProducts(24)

    // Clear memory cache
    clearMemoryCache()

    return NextResponse.json({
      success: true,
      deletedProducts: deletedCount,
      cacheCleared: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ error: error.message || "An error occurred during cleanup" }, { status: 500 })
  }
}

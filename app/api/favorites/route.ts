import { NextResponse } from "next/server"
import { getFavorites, addFavorite, removeFavorite } from "@/lib/models/favoriteModel"

export async function GET() {
  try {
    const favorites = await getFavorites()
    return NextResponse.json({ favorites })
  } catch (error: any) {
    console.error("Get favorites error:", error)
    return NextResponse.json({ error: error.message || "An error occurred while fetching favorites" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await addFavorite(productId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Add favorite error:", error)
    return NextResponse.json({ error: error.message || "An error occurred while adding favorite" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("id")

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await removeFavorite(productId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Remove favorite error:", error)
    return NextResponse.json({ error: error.message || "An error occurred while removing favorite" }, { status: 500 })
  }
}

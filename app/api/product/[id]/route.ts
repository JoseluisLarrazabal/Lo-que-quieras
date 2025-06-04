import { NextResponse } from "next/server"
import { getProductById } from "@/lib/models/productModel"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const product = await getProductById(productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: error.message || "An error occurred while fetching product" }, { status: 500 })
  }
}

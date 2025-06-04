import { NextResponse } from "next/server"

export async function GET() {
  // Return public configuration
  return NextResponse.json({
    apiVersion: "1.0.0",
    marketplaces: ["MercadoLibre", "OLX", "Facebook Marketplace"],
    categories: ["Electrónicos", "Ropa", "Hogar", "Deportes", "Libros", "Juguetes"],
    maxResults: 50,
    cacheTime: 3600, // seconds
  })
}

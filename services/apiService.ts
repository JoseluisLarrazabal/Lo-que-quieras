"use client"

// Simulación del servicio de API para el frontend
// En una implementación real, esto haría llamadas HTTP al backend

interface SearchParams {
  query: string
  minPrice?: number
  maxPrice?: number
  category?: string
  marketplace?: string
}

interface Product {
  id: string
  title: string
  price: number
  marketplace: string
  url: string
  imageUrl: string
  description?: string
  category?: string
}

class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

  async search(params: SearchParams): Promise<Product[]> {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    // Mock data - en producción esto haría una llamada real al backend
    const mockProducts: Product[] = [
      {
        id: "1",
        title: `${params.query} - iPhone 15 Pro`,
        price: 999.99,
        marketplace: "MercadoLibre",
        url: "https://mercadolibre.com/item1",
        imageUrl: "/placeholder.svg?height=200&width=200",
        description: "iPhone 15 Pro nuevo en caja",
        category: "Electrónicos",
      },
      {
        id: "2",
        title: `${params.query} - iPhone 15`,
        price: 849.99,
        marketplace: "OLX",
        url: "https://olx.com/item2",
        imageUrl: "/placeholder.svg?height=200&width=200",
        description: "iPhone 15 en excelente estado",
        category: "Electrónicos",
      },
      {
        id: "3",
        title: `${params.query} - iPhone 14 Pro`,
        price: 799.99,
        marketplace: "Facebook Marketplace",
        url: "https://facebook.com/marketplace/item3",
        imageUrl: "/placeholder.svg?height=200&width=200",
        description: "iPhone 14 Pro como nuevo",
        category: "Electrónicos",
      },
    ]

    // Aplicar filtros
    let filteredProducts = mockProducts.filter((product) =>
      product.title.toLowerCase().includes(params.query.toLowerCase()),
    )

    if (params.minPrice) {
      filteredProducts = filteredProducts.filter((p) => p.price >= params.minPrice!)
    }

    if (params.maxPrice) {
      filteredProducts = filteredProducts.filter((p) => p.price <= params.maxPrice!)
    }

    if (params.category) {
      filteredProducts = filteredProducts.filter((p) => p.category === params.category)
    }

    if (params.marketplace) {
      filteredProducts = filteredProducts.filter((p) => p.marketplace === params.marketplace)
    }

    return filteredProducts
  }

  async getProduct(id: string): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock product detail
    return {
      id,
      title: "iPhone 15 Pro 128GB",
      price: 999.99,
      marketplace: "MercadoLibre",
      url: "https://mercadolibre.com/item1",
      imageUrl: "/placeholder.svg?height=400&width=400",
      description: "iPhone 15 Pro nuevo en caja sellada. Incluye cargador y audífonos.",
      category: "Electrónicos",
    }
  }

  async getHealthStatus(): Promise<{ status: string; timestamp: string }> {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    }
  }
}

export const apiService = new ApiService()

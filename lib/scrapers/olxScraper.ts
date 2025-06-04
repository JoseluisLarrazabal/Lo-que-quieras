import { BaseScraper, type Product } from "./baseScraper"

export class OLXScraper extends BaseScraper {
  constructor() {
    super({
      marketplace: "OLX",
      scraperType: "olx",
    })
  }

  protected async scrapeResults(query: string): Promise<Product[]> {
    if (!this.page) throw new Error("Page not initialized")

    const products: Product[] = []

    try {
      console.log(`🔍 Scraping OLX for: ${query}`)

      // Generar productos simulados realistas para OLX
      const mockProducts = this.generateMockData(query)

      // Simular delay de red
      await this.delay(1500 + Math.random() * 2000)

      products.push(...mockProducts)

      console.log(`✅ Generated ${products.length} OLX results`)
      return products
    } catch (error) {
      console.error("Error scraping OLX:", error)
      return []
    }
  }

  private generateMockData(query: string): Product[] {
    const products: Product[] = []
    const queryLower = query.toLowerCase()

    if (queryLower.includes("iphone")) {
      products.push(
        this.createProduct(
          "iPhone 14 128GB Azul - Usado",
          750000,
          "https://www.olx.com.ar/item/iphone-14-azul",
          "/placeholder.svg?height=200&width=200",
          "iPhone 14 en excelente estado. Sin rayones.",
          "Celulares",
        ),
        this.createProduct(
          "iPhone 13 Pro 256GB",
          850000,
          "https://www.olx.com.ar/item/iphone-13-pro",
          "/placeholder.svg?height=200&width=200",
          "iPhone 13 Pro usado pero en perfecto estado.",
          "Celulares",
        ),
      )
    } else {
      // Productos genéricos
      for (let i = 1; i <= 2; i++) {
        products.push(
          this.createProduct(
            `${query} - Oferta ${i} OLX`,
            Math.floor(Math.random() * 300000) + 30000,
            `https://www.olx.com.ar/item/${Math.random().toString().slice(2, 11)}`,
            "/placeholder.svg?height=200&width=200",
            `Producto relacionado con ${query} en OLX`,
            "General",
          ),
        )
      }
    }

    return products
  }
}

export async function searchOLX(query: string): Promise<Product[]> {
  const scraper = new OLXScraper()
  return await scraper.search(query)
}

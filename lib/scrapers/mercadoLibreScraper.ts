import { BaseScraper, type Product } from "./baseScraper"

export class MercadoLibreScraper extends BaseScraper {
  constructor() {
    super({
      marketplace: "MercadoLibre",
      scraperType: "mercadoLibre",
    })
  }

  protected async scrapeResults(query: string): Promise<Product[]> {
    if (!this.page) throw new Error("Page not initialized")

    const products: Product[] = []
    const searchUrl = `https://listado.mercadolibre.com.ar/${encodeURIComponent(query.replace(/\s+/g, "-"))}`

    try {
      console.log(`🔍 Scraping MercadoLibre: ${searchUrl}`)

      // Navegar a la página de búsqueda
      await this.page.goto(searchUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      })

      // Esperar a que los resultados carguen
      try {
        await this.page.waitForSelector(".ui-search-layout__item", { timeout: 15000 })
      } catch (error) {
        console.log("⚠️ No se encontraron resultados en MercadoLibre")
        return []
      }

      // Extraer datos directamente con evaluateHandle para mayor robustez
      const extractedProducts = await this.page.evaluate(() => {
        const items = Array.from(document.querySelectorAll(".ui-search-layout__item"))

        return items
          .slice(0, 10)
          .map((item) => {
            try {
              // Título
              const titleElement = item.querySelector(".ui-search-item__title")
              const title = titleElement ? titleElement.textContent?.trim() : null

              // Precio
              const priceElement = item.querySelector(".price-tag-fraction")
              const priceText = priceElement
                ? priceElement.textContent?.trim().replace(/\./g, "").replace(/,/g, ".")
                : null
              const price = priceText ? Number.parseFloat(priceText) : 0

              // URL
              const linkElement = item.querySelector("a.ui-search-link")
              const url = linkElement ? linkElement.getAttribute("href") : null

              // Imagen
              const imgElement = item.querySelector("img.ui-search-result-image__element")
              const imageUrl = imgElement
                ? imgElement.getAttribute("data-src") ||
                  imgElement.getAttribute("src") ||
                  "/placeholder.svg?height=200&width=200"
                : "/placeholder.svg?height=200&width=200"

              // Ubicación
              const locationElement = item.querySelector(".ui-search-item__location")
              const location = locationElement ? locationElement.textContent?.trim() : ""

              // Descripción
              const description = location ? `Ubicación: ${location}` : "Producto de MercadoLibre"

              return {
                title,
                price,
                url,
                imageUrl,
                description,
                valid: !!(title && price && url),
              }
            } catch (error) {
              return { valid: false }
            }
          })
          .filter((p) => p.valid)
      })

      console.log(`📦 Extrayendo datos de ${extractedProducts.length} productos de MercadoLibre`)

      // Convertir los datos extraídos al formato Product
      for (const item of extractedProducts) {
        if (item.valid && item.title && item.url) {
          products.push(
            this.createProduct(
              item.title,
              item.price || 0,
              item.url,
              item.imageUrl || "/placeholder.svg?height=200&width=200",
              item.description || "",
              this.categorizeProduct(item.title),
            ),
          )
        }
      }

      console.log(`✅ Scraping exitoso: ${products.length} productos de MercadoLibre`)
      return products
    } catch (error) {
      console.error("Error en scraping de MercadoLibre:", error)
      return []
    }
  }

  private categorizeProduct(title: string): string {
    const titleLower = title.toLowerCase()

    if (
      titleLower.includes("iphone") ||
      titleLower.includes("samsung") ||
      titleLower.includes("celular") ||
      titleLower.includes("smartphone")
    ) {
      return "Celulares"
    }
    if (
      titleLower.includes("notebook") ||
      titleLower.includes("laptop") ||
      titleLower.includes("macbook") ||
      titleLower.includes("computadora")
    ) {
      return "Computación"
    }
    if (titleLower.includes("tv") || titleLower.includes("televisor") || titleLower.includes("smart tv")) {
      return "TV y Audio"
    }
    if (
      titleLower.includes("zapatillas") ||
      titleLower.includes("zapatos") ||
      titleLower.includes("nike") ||
      titleLower.includes("adidas")
    ) {
      return "Ropa y Calzado"
    }

    return "Electrónicos"
  }
}

export async function searchMercadoLibre(query: string): Promise<Product[]> {
  const scraper = new MercadoLibreScraper()
  return await scraper.search(query)
}

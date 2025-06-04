import puppeteer, { type Browser, type Page } from "puppeteer"
import { v4 as uuidv4 } from "uuid"

export interface Product {
  id: string
  title: string
  price: number
  marketplace: string
  url: string
  imageUrl: string
  description?: string
  category?: string
}

export interface ScraperConfig {
  marketplace: string
  scraperType: "mercadoLibre" | "olx" | "facebook"
}

export class BaseScraper {
  protected browser: Browser | null = null
  protected page: Page | null = null
  protected marketplace: string
  protected scraperType: "mercadoLibre" | "olx" | "facebook"

  constructor(config: ScraperConfig) {
    this.marketplace = config.marketplace
    this.scraperType = config.scraperType
  }

  protected async initialize(): Promise<void> {
    try {
      console.log(`🚀 Initializing ${this.marketplace} scraper...`)

      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-web-security"],
      })

      this.page = await this.browser.newPage()
      await this.page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      )
      await this.page.setViewport({ width: 1366, height: 768 })

      console.log(`✅ ${this.marketplace} scraper initialized`)
    } catch (error) {
      console.error(`❌ Error initializing ${this.marketplace} scraper:`, error)
      throw error
    }
  }

  protected async close(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close()
        this.browser = null
        this.page = null
        console.log(`🔒 ${this.marketplace} scraper closed`)
      }
    } catch (error) {
      console.error(`Error closing ${this.marketplace} scraper:`, error)
    }
  }

  protected generateProductId(): string {
    return uuidv4()
  }

  protected createProduct(
    title: string,
    price: number,
    url: string,
    imageUrl: string,
    description?: string,
    category?: string,
  ): Product {
    return {
      id: this.generateProductId(),
      title: title.trim(),
      price: Math.round(price * 100) / 100,
      marketplace: this.marketplace,
      url: url.trim(),
      imageUrl: imageUrl.trim(),
      description: description?.trim(),
      category: category?.trim(),
    }
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public async search(query: string): Promise<Product[]> {
    const startTime = Date.now()

    try {
      console.log(`🔍 Starting ${this.marketplace} search for: "${query}"`)

      await this.initialize()
      const results = await this.scrapeResults(query)

      const duration = Date.now() - startTime
      console.log(`✅ ${this.marketplace} search completed in ${duration}ms - Found ${results.length} products`)

      return results
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ ${this.marketplace} search failed after ${duration}ms:`, error)
      return []
    } finally {
      await this.close()
    }
  }

  protected async scrapeResults(query: string): Promise<Product[]> {
    // Default implementation - should be overridden
    return []
  }
}

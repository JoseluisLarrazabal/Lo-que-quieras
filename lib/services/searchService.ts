import { getProductsByQuery, saveProducts } from "../models/productModel"
import { getCached } from "./cacheService"
import { searchMercadoLibre } from "../scrapers/mercadoLibreScraper"
import { searchOLX } from "../scrapers/olxScraper"
import { searchFacebookMarketplace } from "../scrapers/facebookScraper"
import { aggregateResults } from "./aggregatorService"
import type { Product } from "../models/productModel"

interface SearchParams {
  query: string
  minPrice?: number
  maxPrice?: number
  category?: string
  marketplace?: string
}

export async function searchProducts(params: SearchParams): Promise<Product[]> {
  const { query, minPrice, maxPrice, category, marketplace } = params

  // Generate cache key based on search parameters
  const cacheKey = `search_${query}_${minPrice || ""}_${maxPrice || ""}_${category || ""}_${marketplace || ""}`

  // Try to get results from cache first (1 hour TTL)
  return await getCached(
    cacheKey,
    async () => {
      // Check database first for cached results
      const dbResults = await getProductsByQuery(query, {
        minPrice,
        maxPrice,
        category,
        marketplace,
      })

      // If we have enough results from the database, return them
      if (dbResults.length >= 10) {
        return dbResults
      }

      // Otherwise, scrape fresh results
      const scrapedResults = await scrapeResults(params)

      // Save scraped results to database
      if (scrapedResults.length > 0) {
        await saveProducts(scrapedResults)
      }

      // Combine and deduplicate results
      const combinedResults = aggregateResults([...dbResults, ...scrapedResults])

      // Apply filters
      return filterResults(combinedResults, { minPrice, maxPrice, category, marketplace })
    },
    3600, // 1 hour cache
  )
}

async function scrapeResults(params: SearchParams): Promise<Product[]> {
  const { query, marketplace } = params
  const results: Product[] = []

  try {
    // Run scrapers based on marketplace filter or all if not specified
    const scrapers = []

    if (!marketplace || marketplace === "MercadoLibre") {
      scrapers.push(searchMercadoLibre(query))
    }

    if (!marketplace || marketplace === "OLX") {
      scrapers.push(searchOLX(query))
    }

    if (!marketplace || marketplace === "Facebook Marketplace") {
      scrapers.push(searchFacebookMarketplace(query))
    }

    // Run scrapers in parallel
    const scrapedResults = await Promise.allSettled(scrapers)

    // Process results
    scrapedResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.push(...result.value)
      }
    })

    return results
  } catch (error) {
    console.error("Error scraping results:", error)
    return []
  }
}

function filterResults(
  products: Product[],
  filters: { minPrice?: number; maxPrice?: number; category?: string; marketplace?: string },
): Product[] {
  const { minPrice, maxPrice, category, marketplace } = filters

  return products.filter((product) => {
    if (minPrice !== undefined && product.price < minPrice) return false
    if (maxPrice !== undefined && product.price > maxPrice) return false
    if (category && product.category !== category) return false
    if (marketplace && product.marketplace !== marketplace) return false
    return true
  })
}

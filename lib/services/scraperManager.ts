import { searchMercadoLibre } from "../scrapers/mercadoLibreScraper"
import { searchOLX } from "../scrapers/olxScraper"
import { searchFacebookMarketplace } from "../scrapers/facebookScraper"

// Track scraper status
const scraperStatus = {
  mercadoLibre: {
    lastRun: null as Date | null,
    success: false,
    errorCount: 0,
  },
  olx: {
    lastRun: null as Date | null,
    success: false,
    errorCount: 0,
  },
  facebook: {
    lastRun: null as Date | null,
    success: false,
    errorCount: 0,
  },
}

// Update scraper status
export function updateScraperStatus(scraper: "mercadoLibre" | "olx" | "facebook", success: boolean) {
  scraperStatus[scraper].lastRun = new Date()
  scraperStatus[scraper].success = success

  if (!success) {
    scraperStatus[scraper].errorCount++
  } else {
    scraperStatus[scraper].errorCount = 0
  }
}

// Get scraper status
export async function getScraperStatus() {
  return {
    mercadoLibre: scraperStatus.mercadoLibre,
    olx: scraperStatus.olx,
    facebook: scraperStatus.facebook,
    isHealthy: isScraperHealthy(),
  }
}

// Check if scrapers are healthy
function isScraperHealthy() {
  // Consider unhealthy if any scraper has more than 5 consecutive errors
  return (
    scraperStatus.mercadoLibre.errorCount < 5 &&
    scraperStatus.olx.errorCount < 5 &&
    scraperStatus.facebook.errorCount < 5
  )
}

// Test scrapers
export async function testScrapers() {
  const testQuery = "test"
  const results = {
    mercadoLibre: false,
    olx: false,
    facebook: false,
  }

  try {
    await searchMercadoLibre(testQuery)
    results.mercadoLibre = true
  } catch (error) {
    console.error("MercadoLibre scraper test failed:", error)
  }

  try {
    await searchOLX(testQuery)
    results.olx = true
  } catch (error) {
    console.error("OLX scraper test failed:", error)
  }

  try {
    await searchFacebookMarketplace(testQuery)
    results.facebook = true
  } catch (error) {
    console.error("Facebook scraper test failed:", error)
  }

  return results
}

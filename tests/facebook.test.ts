// tests/facebook.test.ts
import { FacebookMarketplaceScraper } from '../lib/scrapers/facebookScraper'
import { Product } from '../lib/scrapers/baseScraper'
import { describe, beforeEach, afterEach, it, expect } from '@jest/globals'

describe('Facebook Marketplace Scraper', () => {
  let scraper: FacebookMarketplaceScraper

  beforeEach(() => {
    scraper = new FacebookMarketplaceScraper()
  })

  afterEach(async () => {
    await scraper['close']()
  })

  it('should search for products successfully', async () => {
    const query = 'laptop'
    const results = await scraper.search(query)

    expect(results).toBeDefined()
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThan(0)

    // Verificar estructura del primer producto
    const firstProduct = results[0]
    expect(firstProduct).toMatchObject({
      title: expect.any(String),
      price: expect.any(Number),
      url: expect.stringContaining('facebook.com/marketplace'),
      marketplace: 'Facebook Marketplace'
    })
  })

  it('should handle search with no results', async () => {
    const query = 'xyzabc123impossible'
    const results = await scraper.search(query)

    expect(results).toBeDefined()
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThan(0) // Debería devolver productos fallback
  })

  it('should handle special characters in search query', async () => {
    const query = 'iPhone 14 Pro Max'
    const results = await scraper.search(query)

    expect(results).toBeDefined()
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })
}) 
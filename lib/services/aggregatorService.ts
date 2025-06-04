import type { Product } from "../models/productModel"

export function aggregateResults(products: Product[]): Product[] {
  // Remove duplicates based on URL
  const uniqueUrls = new Set<string>()
  const uniqueProducts: Product[] = []

  for (const product of products) {
    if (!uniqueUrls.has(product.url)) {
      uniqueUrls.add(product.url)
      uniqueProducts.push(product)
    }
  }

  // Group similar products (same title, different marketplace)
  const similarProducts = groupSimilarProducts(uniqueProducts)

  return similarProducts
}

function groupSimilarProducts(products: Product[]): Product[] {
  // This is a simplified implementation
  // In a real app, you would use more sophisticated text similarity algorithms

  // For now, we'll just return the products as is
  return products
}

export function findBestPrice(products: Product[]): Product | null {
  if (products.length === 0) return null

  // Find product with lowest price
  return products.reduce((best, current) => {
    return current.price < best.price ? current : best
  }, products[0])
}

export function getPriceComparison(products: Product[]): { marketplace: string; price: number; url: string }[] {
  // Group by marketplace and find lowest price for each
  const marketplaceMap = new Map<string, { price: number; url: string }>()

  for (const product of products) {
    const existing = marketplaceMap.get(product.marketplace)
    if (!existing || product.price < existing.price) {
      marketplaceMap.set(product.marketplace, { price: product.price, url: product.url })
    }
  }

  // Convert to array
  return Array.from(marketplaceMap.entries()).map(([marketplace, { price, url }]) => ({
    marketplace,
    price,
    url,
  }))
}

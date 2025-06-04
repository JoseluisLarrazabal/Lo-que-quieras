import { getConnection } from "../database/connection"

export interface Product {
  id: string
  title: string
  price: number
  marketplace: string
  url: string
  imageUrl: string
  description?: string
  category?: string
  cachedAt?: Date
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = await getConnection()
  const row = await db.get(
    `
    SELECT 
      id, 
      title, 
      price, 
      marketplace, 
      url, 
      image_url as imageUrl, 
      description, 
      category, 
      cached_at as cachedAt
    FROM products 
    WHERE id = ?
  `,
    [id],
  )

  return row ? (row as Product) : null
}

export async function saveProduct(product: Product): Promise<void> {
  const db = await getConnection()
  await db.run(
    `
    INSERT OR REPLACE INTO products (
      id, 
      title, 
      price, 
      marketplace, 
      url, 
      image_url, 
      description, 
      category, 
      cached_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `,
    [
      product.id,
      product.title,
      product.price,
      product.marketplace,
      product.url,
      product.imageUrl,
      product.description || null,
      product.category || null,
    ],
  )
}

export async function saveProducts(products: Product[]): Promise<void> {
  const db = await getConnection()
  const stmt = await db.prepare(`
    INSERT OR REPLACE INTO products (
      id, 
      title, 
      price, 
      marketplace, 
      url, 
      image_url, 
      description, 
      category, 
      cached_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `)

  for (const product of products) {
    await stmt.run([
      product.id,
      product.title,
      product.price,
      product.marketplace,
      product.url,
      product.imageUrl,
      product.description || null,
      product.category || null,
    ])
  }

  await stmt.finalize()
}

export async function getProductsByQuery(
  query: string,
  options: {
    minPrice?: number
    maxPrice?: number
    category?: string
    marketplace?: string
    limit?: number
    offset?: number
  } = {},
): Promise<Product[]> {
  const { minPrice, maxPrice, category, marketplace, limit = 50, offset = 0 } = options

  const db = await getConnection()
  const params: any[] = [`%${query}%`]
  let sql = `
    SELECT 
      id, 
      title, 
      price, 
      marketplace, 
      url, 
      image_url as imageUrl, 
      description, 
      category, 
      cached_at as cachedAt
    FROM products 
    WHERE title LIKE ?
  `

  if (minPrice !== undefined) {
    sql += " AND price >= ?"
    params.push(minPrice)
  }

  if (maxPrice !== undefined) {
    sql += " AND price <= ?"
    params.push(maxPrice)
  }

  if (category) {
    sql += " AND category = ?"
    params.push(category)
  }

  if (marketplace) {
    sql += " AND marketplace = ?"
    params.push(marketplace)
  }

  sql += " ORDER BY price ASC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  const rows = await db.all(sql, params)
  return rows as Product[]
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []

  const db = await getConnection()
  const placeholders = ids.map(() => "?").join(",")
  const rows = await db.all(
    `
    SELECT 
      id, 
      title, 
      price, 
      marketplace, 
      url, 
      image_url as imageUrl, 
      description, 
      category, 
      cached_at as cachedAt
    FROM products 
    WHERE id IN (${placeholders})
  `,
    ids,
  )

  return rows as Product[]
}

export async function deleteOldProducts(maxAgeInHours = 24): Promise<number> {
  const db = await getConnection()
  const result = await db.run(
    `
    DELETE FROM products 
    WHERE cached_at < datetime('now', '-' || ? || ' hours')
  `,
    [maxAgeInHours],
  )

  return result.changes || 0
}

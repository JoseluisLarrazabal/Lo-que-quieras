import { getConnection } from "../database/connection"
import { getProductById, getProductsByIds, type Product } from "./productModel"

export interface Favorite {
  id: number
  productId: string
  createdAt: Date
}

export async function addFavorite(productId: string): Promise<void> {
  // Check if product exists
  const product = await getProductById(productId)
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`)
  }

  const db = await getConnection()
  await db.run(
    `
    INSERT OR IGNORE INTO favorites (product_id) 
    VALUES (?)
  `,
    [productId],
  )
}

export async function removeFavorite(productId: string): Promise<void> {
  const db = await getConnection()
  await db.run(
    `
    DELETE FROM favorites 
    WHERE product_id = ?
  `,
    [productId],
  )
}

export async function getFavorites(): Promise<Product[]> {
  const db = await getConnection()
  const rows = await db.all(
    `
    SELECT product_id as productId
    FROM favorites 
    ORDER BY created_at DESC
  `,
  )

  const favoriteIds = rows.map((row: any) => row.productId)
  return await getProductsByIds(favoriteIds)
}

export async function isFavorite(productId: string): Promise<boolean> {
  const db = await getConnection()
  const row = await db.get(
    `
    SELECT 1 
    FROM favorites 
    WHERE product_id = ?
  `,
    [productId],
  )

  return !!row
}

export async function clearFavorites(): Promise<void> {
  const db = await getConnection()
  await db.run("DELETE FROM favorites")
}

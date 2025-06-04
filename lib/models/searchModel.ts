import { getConnection } from "../database/connection"

export interface SearchHistory {
  id: number
  query: string
  createdAt: Date
}

export async function addToSearchHistory(query: string): Promise<void> {
  const db = await getConnection()
  await db.run(
    `
    INSERT INTO searches (query) 
    VALUES (?)
  `,
    [query],
  )
}

export async function getSearchHistory(limit = 50): Promise<SearchHistory[]> {
  const db = await getConnection()
  const rows = await db.all(
    `
    SELECT 
      id, 
      query, 
      created_at as createdAt
    FROM searches 
    ORDER BY created_at DESC 
    LIMIT ?
  `,
    [limit],
  )

  return rows as SearchHistory[]
}

export async function clearSearchHistory(): Promise<void> {
  const db = await getConnection()
  await db.run("DELETE FROM searches")
}

export async function getPopularSearches(limit = 10): Promise<{ query: string; count: number }[]> {
  const db = await getConnection()
  const rows = await db.all(
    `
    SELECT 
      query, 
      COUNT(*) as count
    FROM searches 
    GROUP BY query 
    ORDER BY count DESC 
    LIMIT ?
  `,
    [limit],
  )

  return rows as { query: string; count: number }[]
}

export async function getRecentSearches(limit = 10): Promise<SearchHistory[]> {
  const db = await getConnection()
  const rows = await db.all(
    `
    SELECT 
      id, 
      query, 
      created_at as createdAt
    FROM searches 
    GROUP BY query 
    ORDER BY created_at DESC 
    LIMIT ?
  `,
    [limit],
  )

  return rows as SearchHistory[]
}

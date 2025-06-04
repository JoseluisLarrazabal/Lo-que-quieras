import sqlite3 from "sqlite3"
import { open, type Database } from "sqlite"
import path from "path"
import fs from "fs"

let db: Database | null = null

// Ensure database directory exists
const DB_DIR = path.join(process.cwd(), "database")
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

const DB_PATH = path.join(DB_DIR, "products.db")

export async function getConnection() {
  if (db) {
    return db
  }

  // Open database connection
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  })

  // Enable foreign keys
  await db.exec("PRAGMA foreign_keys = ON")

  // Initialize database schema if needed
  await initializeDatabase(db)

  return db
}

async function initializeDatabase(db: Database) {
  // Create products table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price REAL,
      marketplace TEXT,
      url TEXT,
      image_url TEXT,
      description TEXT,
      category TEXT,
      cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create searches table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create favorites table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id)
    )
  `)

  // Create indexes
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_marketplace ON products(marketplace);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_searches_query ON searches(query);
    CREATE INDEX IF NOT EXISTS idx_searches_created_at ON searches(created_at);
  `)
}

export async function closeConnection() {
  if (db) {
    await db.close()
    db = null
  }
}

export async function getDbStatus() {
  try {
    const connection = await getConnection()
    const result = await connection.get("SELECT sqlite_version() as version")
    return {
      connected: true,
      version: result?.version,
    }
  } catch (error) {
    return {
      connected: false,
      error: (error as Error).message,
    }
  }
}

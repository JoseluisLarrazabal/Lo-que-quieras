import { getConnection, closeConnection } from "../lib/database/connection"

async function setupDatabase() {
  console.log("Setting up database...")

  try {
    // Get database connection (this will initialize the schema)
    const db = await getConnection()

    // Insert some sample data
    await db.run(`
      INSERT OR IGNORE INTO products (
        id, title, price, marketplace, url, image_url, description, category
      ) VALUES (
        'sample1', 
        'iPhone 15 Pro 128GB', 
        999.99, 
        'MercadoLibre', 
        'https://mercadolibre.com/sample1', 
        '/placeholder.svg?height=200&width=200', 
        'iPhone 15 Pro nuevo en caja', 
        'Electrónicos'
      )
    `)

    await db.run(`
      INSERT OR IGNORE INTO products (
        id, title, price, marketplace, url, image_url, description, category
      ) VALUES (
        'sample2', 
        'Samsung Galaxy S23', 
        899.99, 
        'OLX', 
        'https://olx.com/sample2', 
        '/placeholder.svg?height=200&width=200', 
        'Samsung Galaxy S23 en excelente estado', 
        'Electrónicos'
      )
    `)

    await db.run(`
      INSERT OR IGNORE INTO searches (query) VALUES ('iPhone')
    `)

    await db.run(`
      INSERT OR IGNORE INTO searches (query) VALUES ('Samsung')
    `)

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await closeConnection()
  }
}

setupDatabase()

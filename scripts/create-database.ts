import fs from "fs"
import path from "path"
import sqlite3 from "sqlite3"
import { open } from "sqlite"

async function createDatabase() {
  console.log('🚀 Creando base de datos para "Lo que quieras!"...')

  try {
    // Crear directorio de base de datos si no existe
    const dbDir = path.join(process.cwd(), "database")
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
      console.log("📁 Directorio database/ creado")
    }

    // Ruta de la base de datos
    const dbPath = path.join(dbDir, "products.db")

    // Eliminar base de datos existente si existe
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
      console.log("🗑️  Base de datos anterior eliminada")
    }

    // Crear nueva base de datos
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    console.log("✅ Base de datos SQLite creada en:", dbPath)

    // Leer y ejecutar schema.sql
    const schemaPath = path.join(dbDir, "schema.sql")
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8")
      await db.exec(schema)
      console.log("📋 Schema aplicado correctamente")
    } else {
      console.log("⚠️  Archivo schema.sql no encontrado, creando tablas básicas...")

      // Crear tablas básicas si no existe schema.sql
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
        );

        CREATE TABLE IF NOT EXISTS searches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          query TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id)
        );
      `)
    }

    // Leer y ejecutar seeds.sql
    const seedsPath = path.join(dbDir, "seeds.sql")
    if (fs.existsSync(seedsPath)) {
      const seeds = fs.readFileSync(seedsPath, "utf8")
      await db.exec(seeds)
      console.log("🌱 Datos de ejemplo insertados")
    } else {
      console.log("⚠️  Archivo seeds.sql no encontrado, insertando datos básicos...")

      // Insertar datos básicos
      await db.run(`
        INSERT OR IGNORE INTO products (
          id, title, price, marketplace, url, image_url, description, category
        ) VALUES (
          'sample1', 
          'iPhone 15 Pro 128GB', 
          999999.99, 
          'MercadoLibre', 
          'https://mercadolibre.com/sample1', 
          '/placeholder.svg?height=200&width=200', 
          'iPhone 15 Pro nuevo en caja', 
          'Electrónicos'
        )
      `)
    }

    // Verificar que todo esté bien
    const productCount = await db.get("SELECT COUNT(*) as count FROM products")
    const searchCount = await db.get("SELECT COUNT(*) as count FROM searches")
    const favoriteCount = await db.get("SELECT COUNT(*) as count FROM favorites")

    console.log("📊 Estadísticas de la base de datos:")
    console.log(`   - Productos: ${productCount.count}`)
    console.log(`   - Búsquedas: ${searchCount.count}`)
    console.log(`   - Favoritos: ${favoriteCount.count}`)

    await db.close()
    console.log("✅ Base de datos creada exitosamente!")
    console.log('🎉 ¡Ya puedes ejecutar "npm run dev" para iniciar la aplicación!')
  } catch (error) {
    console.error("❌ Error creando la base de datos:", error)
    process.exit(1)
  }
}

createDatabase()

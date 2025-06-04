import fs from "fs"
import path from "path"

async function resetDatabase() {
  console.log("🔄 Reseteando base de datos...")

  try {
    const dbPath = path.join(process.cwd(), "database", "products.db")

    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
      console.log("🗑️  Base de datos eliminada")
    }

    // Limpiar caché también
    const cacheDir = path.join(process.cwd(), "cache")
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true })
      console.log("🧹 Caché limpiado")
    }

    console.log("✅ Reset completado")
    console.log('💡 Ejecuta "npm run setup-db" para recrear la base de datos')
  } catch (error) {
    console.error("❌ Error reseteando:", error)
  }
}

resetDatabase()

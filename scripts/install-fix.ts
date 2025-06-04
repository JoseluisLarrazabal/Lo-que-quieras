import { execSync } from "child_process"
import fs from "fs"

console.log("🔧 Solucionando problemas de instalación...")

try {
  // Limpiar caché de npm
  console.log("🧹 Limpiando caché de npm...")
  execSync("npm cache clean --force", { stdio: "inherit" })

  // Eliminar node_modules y package-lock.json
  console.log("🗑️  Eliminando node_modules y package-lock.json...")
  if (fs.existsSync("node_modules")) {
    fs.rmSync("node_modules", { recursive: true, force: true })
  }
  if (fs.existsSync("package-lock.json")) {
    fs.unlinkSync("package-lock.json")
  }

  // Reinstalar dependencias
  console.log("📦 Reinstalando dependencias...")
  execSync("npm install --legacy-peer-deps", { stdio: "inherit" })

  console.log("✅ Instalación completada exitosamente!")
  console.log("🚀 Ahora puedes ejecutar: npm run setup-db")
} catch (error) {
  console.error("❌ Error durante la instalación:", error)
  console.log("\n💡 Intenta ejecutar manualmente:")
  console.log("   npm cache clean --force")
  console.log("   rm -rf node_modules package-lock.json")
  console.log("   npm install --legacy-peer-deps")
}

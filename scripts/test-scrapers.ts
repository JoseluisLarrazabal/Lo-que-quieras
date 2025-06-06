// scripts/testScrapers.ts
import { MercadoLibreScraper } from "../lib/scrapers/mercadoLibreScraper"
import { OLXScraper } from "../lib/scrapers/olxScraper"
import { FacebookMarketplaceScraper } from "../lib/scrapers/facebookScraper"
import dotenv from "dotenv"

// Cargar variables de entorno
dotenv.config()

async function testScrapers() {
  console.log("🧪 Testing scrapers...")
  
  // Verificar si el login está habilitado
  const useLogin = process.env.USE_LOGIN === 'true'
  
  if (useLogin) {
    console.log("🔐 Login enabled - Using credentials from .env")
    console.log("📋 Credentials status:")
    console.log(`   - Facebook: ${process.env.FB_EMAIL ? '✓' : '✗'} email, ${process.env.FB_PASSWORD ? '✓' : '✗'} password`)
    console.log(`   - MercadoLibre: ${process.env.ML_EMAIL ? '✓' : '✗'} email, ${process.env.ML_PASSWORD ? '✓' : '✗'} password`)
    console.log(`   - OLX: ${process.env.OLX_EMAIL ? '✓' : '✗'} email, ${process.env.OLX_PASSWORD ? '✓' : '✗'} password`)
  } else {
    console.log("🔓 Login disabled - Running without authentication")
  }

  try {
    console.log("\n🛒 Testing MercadoLibre scraper...")
    const mlScraper = new MercadoLibreScraper({
      useLogin: useLogin,
      credentials: useLogin ? {
        email: process.env.ML_EMAIL || '',
        password: process.env.ML_PASSWORD || ''
      } : undefined
    })
    
    const mlResults = await mlScraper.search("iphone")
    console.log(`✅ MercadoLibre results: ${mlResults.length}`)
    
    if (mlResults.length > 0) {
      console.log("📦 Sample result:", {
        title: mlResults[0].title,
        price: mlResults[0].price,
        marketplace: mlResults[0].marketplace,
      })
      console.log("🔗 URL:", mlResults[0].url)
    } else {
      console.log("⚠️ No results found for MercadoLibre")
    }

    console.log("\n🏪 Testing OLX scraper...")
    const olxScraper = new OLXScraper({
      useLogin: useLogin,
      credentials: useLogin ? {
        email: process.env.OLX_EMAIL || '',
        password: process.env.OLX_PASSWORD || ''
      } : undefined
    })
    
    const olxResults = await olxScraper.search("iphone")
    console.log(`✅ OLX results: ${olxResults.length}`)
    
    if (olxResults.length > 0) {
      console.log("📦 Sample result:", {
        title: olxResults[0].title,
        price: olxResults[0].price,
        marketplace: olxResults[0].marketplace,
      })
      console.log("🔗 URL:", olxResults[0].url)
    } else {
      console.log("⚠️ No results found for OLX")
    }

    console.log("\n📘 Testing Facebook Marketplace scraper...")
    const fbScraper = new FacebookMarketplaceScraper({
      useLogin: useLogin,
      credentials: useLogin ? {
        email: process.env.FB_EMAIL || '',
        password: process.env.FB_PASSWORD || ''
      } : undefined
    })
    
    const fbResults = await fbScraper.search("iphone")
    console.log(`✅ Facebook results: ${fbResults.length}`)
    
    if (fbResults.length > 0) {
      console.log("📦 Sample result:", {
        title: fbResults[0].title,
        price: fbResults[0].price,
        marketplace: fbResults[0].marketplace,
      })
      console.log("🔗 URL:", fbResults[0].url)
    } else {
      console.log("⚠️ No results found for Facebook")
    }

    console.log("\n🎉 All scrapers tested successfully!")
    console.log(`📊 Total results: ${mlResults.length + olxResults.length + fbResults.length}`)
    
    // Mostrar estadísticas adicionales
    console.log("\n📈 Statistics:")
    console.log(`   - Average price: $${calculateAveragePrice([...mlResults, ...olxResults, ...fbResults])}`)
    console.log(`   - Price range: $${getMinPrice([...mlResults, ...olxResults, ...fbResults])} - $${getMaxPrice([...mlResults, ...olxResults, ...fbResults])}`)
    
  } catch (error) {
    console.error("❌ Error testing scrapers:", error)
  }
}

// Funciones helper para estadísticas
function calculateAveragePrice(products: any[]): string {
  if (products.length === 0) return '0'
  const total = products.reduce((sum, product) => sum + product.price, 0)
  return (total / products.length).toFixed(2)
}

function getMinPrice(products: any[]): string {
  if (products.length === 0) return '0'
  return Math.min(...products.map(p => p.price)).toFixed(2)
}

function getMaxPrice(products: any[]): string {
  if (products.length === 0) return '0'
  return Math.max(...products.map(p => p.price)).toFixed(2)
}

// Script adicional para probar solo con login
async function testScrapersWithLogin() {
  console.log("\n🔐 Testing scrapers WITH LOGIN only...")
  
  // Forzar el uso de login
  process.env.USE_LOGIN = 'true'
  
  await testScrapers()
}

// Script adicional para probar sin login
async function testScrapersWithoutLogin() {
  console.log("\n🔓 Testing scrapers WITHOUT LOGIN...")
  
  // Desactivar el login
  process.env.USE_LOGIN = 'false'
  
  await testScrapers()
}

// Ejecutar según el argumento de línea de comandos
const args = process.argv.slice(2)
if (args.includes('--with-login')) {
  testScrapersWithLogin()
} else if (args.includes('--without-login')) {
  testScrapersWithoutLogin()
} else {
  // Por defecto, usar la configuración del .env
  testScrapers()
}
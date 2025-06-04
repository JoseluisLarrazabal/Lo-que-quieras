async function testScrapers() {
  console.log("🧪 Testing scrapers...")

  try {
    // Importar dinámicamente para evitar problemas de inicialización
    const { searchMercadoLibre } = await import("../lib/scrapers/mercadoLibreScraper")
    const { searchOLX } = await import("../lib/scrapers/olxScraper")
    const { searchFacebookMarketplace } = await import("../lib/scrapers/facebookScraper")

    console.log("\n🛒 Testing MercadoLibre scraper...")
    const mlResults = await searchMercadoLibre("iphone")
    console.log(`✅ MercadoLibre results: ${mlResults.length}`)
    if (mlResults.length > 0) {
      console.log("📦 Sample result:", {
        title: mlResults[0].title,
        price: mlResults[0].price,
        marketplace: mlResults[0].marketplace,
      })
    }

    console.log("\n🏪 Testing OLX scraper...")
    const olxResults = await searchOLX("iphone")
    console.log(`✅ OLX results: ${olxResults.length}`)
    if (olxResults.length > 0) {
      console.log("📦 Sample result:", {
        title: olxResults[0].title,
        price: olxResults[0].price,
        marketplace: olxResults[0].marketplace,
      })
    }

    console.log("\n📘 Testing Facebook Marketplace scraper...")
    const fbResults = await searchFacebookMarketplace("iphone")
    console.log(`✅ Facebook results: ${fbResults.length}`)
    if (fbResults.length > 0) {
      console.log("📦 Sample result:", {
        title: fbResults[0].title,
        price: fbResults[0].price,
        marketplace: fbResults[0].marketplace,
      })
    }

    console.log("\n🎉 All scrapers tested successfully!")
    console.log(`📊 Total results: ${mlResults.length + olxResults.length + fbResults.length}`)
  } catch (error) {
    console.error("❌ Error testing scrapers:", error)
  }
}

testScrapers()

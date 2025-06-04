import { deleteOldProducts } from "../lib/models/productModel"
import { clearMemoryCache } from "../lib/services/cacheService"
import { closeConnection } from "../lib/database/connection"

async function cleanup() {
  console.log("Running cleanup...")

  try {
    // Delete old products (older than 24 hours)
    const deletedCount = await deleteOldProducts(24)
    console.log(`Deleted ${deletedCount} old products`)

    // Clear memory cache
    clearMemoryCache()
    console.log("Memory cache cleared")

    console.log("Cleanup completed successfully!")
  } catch (error) {
    console.error("Error during cleanup:", error)
  } finally {
    await closeConnection()
  }
}

cleanup()

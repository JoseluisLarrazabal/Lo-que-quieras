"use client"

// Simulación de AsyncStorage para el navegador usando localStorage
class StorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window === "undefined") return null
      return localStorage.getItem(key)
    } catch (error) {
      console.error("Error getting item from storage:", error)
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window === "undefined") return
      localStorage.setItem(key, value)
    } catch (error) {
      console.error("Error setting item in storage:", error)
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window === "undefined") return
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing item from storage:", error)
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window === "undefined") return
      localStorage.clear()
    } catch (error) {
      console.error("Error clearing storage:", error)
    }
  }

  // Métodos específicos para la app
  async getFavorites(): Promise<any[]> {
    const favoritesJson = await this.getItem("favorites")
    return favoritesJson ? JSON.parse(favoritesJson) : []
  }

  async setFavorites(favorites: any[]): Promise<void> {
    await this.setItem("favorites", JSON.stringify(favorites))
  }

  async getSearchHistory(): Promise<string[]> {
    const historyJson = await this.getItem("searchHistory")
    return historyJson ? JSON.parse(historyJson) : []
  }

  async setSearchHistory(history: string[]): Promise<void> {
    await this.setItem("searchHistory", JSON.stringify(history))
  }

  async addToSearchHistory(query: string): Promise<void> {
    const history = await this.getSearchHistory()
    const newHistory = [query, ...history.filter((item) => item !== query)].slice(0, 50)
    await this.setSearchHistory(newHistory)
  }
}

export const storageService = new StorageService()

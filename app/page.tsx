"use client"

import { AppProvider } from "@/contexts/AppContext"
import { SearchProvider } from "@/contexts/SearchContext"
import { FavoritesProvider } from "@/contexts/FavoritesContext"
import AppNavigator from "@/components/navigation/AppNavigator"

export default function App() {
  return (
    <AppProvider>
      <SearchProvider>
        <FavoritesProvider>
          <div className="min-h-screen bg-gray-50">
            <AppNavigator />
          </div>
        </FavoritesProvider>
      </SearchProvider>
    </AppProvider>
  )
}

"use client"
import { useApp } from "@/contexts/AppContext"
import { useSearch } from "@/contexts/SearchContext"
import SearchBar from "@/components/search/SearchBar"
import { TrendingUp, Zap, Clock } from "lucide-react"

export default function HomeScreen() {
  const { dispatch: appDispatch } = useApp()
  const { state: searchState, dispatch: searchDispatch } = useSearch()

  const trendingSearches = ["iPhone 15", "Samsung Galaxy", "PlayStation 5", "Nike Air Max", "MacBook Pro"]

  const quickCategories = [
    { name: "Electrónicos", icon: "📱", color: "bg-blue-100 text-blue-800" },
    { name: "Ropa", icon: "👕", color: "bg-green-100 text-green-800" },
    { name: "Hogar", icon: "🏠", color: "bg-purple-100 text-purple-800" },
    { name: "Deportes", icon: "⚽", color: "bg-orange-100 text-orange-800" },
  ]

  const handleSearch = (query: string) => {
    if (query.trim()) {
      searchDispatch({ type: "SET_QUERY", payload: query })
      searchDispatch({ type: "ADD_TO_HISTORY", payload: query })
      appDispatch({ type: "SET_CURRENT_SCREEN", payload: "results" })
    }
  }

  const handleTrendingSearch = (query: string) => {
    handleSearch(query)
  }

  const handleCategorySearch = (category: string) => {
    searchDispatch({ type: "SET_FILTERS", payload: { category } })
    appDispatch({ type: "SET_CURRENT_SCREEN", payload: "search" })
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-6 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Lo que quieras! 🛍️</h1>
          <p className="text-gray-600">Compara precios y encuentra las mejores ofertas</p>
        </div>

        <SearchBar onSearch={handleSearch} placeholder="¿Qué estás buscando?" />
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Quick Categories */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Categorías populares
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategorySearch(category.name)}
                className={`p-4 rounded-xl ${category.color} text-left transition-transform hover:scale-105`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-medium">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Trending Searches */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Búsquedas populares
          </h2>
          <div className="space-y-2">
            {trendingSearches.map((search, index) => (
              <button
                key={search}
                onClick={() => handleTrendingSearch(search)}
                className="w-full p-3 bg-white rounded-lg border border-gray-200 text-left hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center"
              >
                <span className="text-gray-400 mr-3">#{index + 1}</span>
                <span className="text-gray-900">{search}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        {searchState.searchHistory.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-500" />
              Búsquedas recientes
            </h2>
            <div className="space-y-2">
              {searchState.searchHistory.slice(0, 3).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full p-3 bg-white rounded-lg border border-gray-200 text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-gray-900">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

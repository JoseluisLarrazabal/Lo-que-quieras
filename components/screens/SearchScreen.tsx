"use client"

import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { useSearch } from "@/contexts/SearchContext"
import SearchBar from "@/components/search/SearchBar"
import FilterPanel from "@/components/search/FilterPanel"
import { Filter, X } from "lucide-react"

export default function SearchScreen() {
  const { dispatch: appDispatch } = useApp()
  const { state: searchState, dispatch: searchDispatch } = useSearch()
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (query: string) => {
    if (query.trim()) {
      searchDispatch({ type: "SET_QUERY", payload: query })
      searchDispatch({ type: "ADD_TO_HISTORY", payload: query })
      appDispatch({ type: "SET_CURRENT_SCREEN", payload: "results" })
    }
  }

  const handleFilterChange = (filters: any) => {
    searchDispatch({ type: "SET_FILTERS", payload: filters })
  }

  const clearFilters = () => {
    searchDispatch({ type: "SET_FILTERS", payload: {} })
  }

  const activeFiltersCount = Object.keys(searchState.filters).filter(
    (key) => searchState.filters[key as keyof typeof searchState.filters] !== undefined,
  ).length

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Búsqueda avanzada</h1>
          <button
            onClick={() => appDispatch({ type: "SET_CURRENT_SCREEN", payload: "home" })}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <SearchBar onSearch={handleSearch} placeholder="Buscar productos..." value={searchState.query} />

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter size={16} className="mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-blue-800 text-xs px-2 py-1 rounded-full">{activeFiltersCount}</span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="text-sm text-gray-600 hover:text-gray-800">
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <FilterPanel
          filters={searchState.filters}
          onFiltersChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Search Suggestions */}
      <div className="flex-1 px-4 py-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sugerencias de búsqueda</h2>

          <div className="space-y-3">
            {searchState.searchHistory.length > 0 ? (
              <>
                <h3 className="text-sm font-medium text-gray-700">Búsquedas recientes</h3>
                {searchState.searchHistory.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay búsquedas recientes</p>
                <p className="text-sm mt-2">Tus búsquedas aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

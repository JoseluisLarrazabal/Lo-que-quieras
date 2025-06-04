"use client"

import { useSearch } from "@/contexts/SearchContext"
import { useApp } from "@/contexts/AppContext"
import EmptyState from "@/components/common/EmptyState"
import { Clock, Search, Trash2 } from "lucide-react"

export default function HistoryScreen() {
  const { state: searchState, dispatch: searchDispatch } = useSearch()
  const { dispatch: appDispatch } = useApp()

  const handleSearchAgain = (query: string) => {
    searchDispatch({ type: "SET_QUERY", payload: query })
    appDispatch({ type: "SET_CURRENT_SCREEN", payload: "results" })
  }

  const handleClearHistory = () => {
    if (confirm("¿Estás seguro de que quieres limpiar todo el historial?")) {
      // En una implementación real, esto limpiaría el historial del storage
      console.log("Clearing search history...")
    }
  }

  const handleGoToSearch = () => {
    appDispatch({ type: "SET_CURRENT_SCREEN", payload: "home" })
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-gray-500 mr-2" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Historial</h1>
              <p className="text-sm text-gray-600">{searchState.searchHistory.length} búsquedas realizadas</p>
            </div>
          </div>

          {searchState.searchHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 text-sm"
            >
              <Trash2 size={16} className="mr-1" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 px-4 py-4">
        {searchState.searchHistory.length > 0 ? (
          <div className="space-y-2">
            {searchState.searchHistory.map((search, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between hover:border-blue-300 transition-colors"
              >
                <button onClick={() => handleSearchAgain(search)} className="flex items-center flex-1 text-left">
                  <Search className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-900">{search}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSearchAgain(search)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Buscar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay búsquedas recientes"
            description="Tu historial de búsquedas aparecerá aquí"
            actionText="Realizar búsqueda"
            onAction={handleGoToSearch}
            icon={<Clock className="w-16 h-16 text-gray-300" />}
          />
        )}
      </div>
    </div>
  )
}

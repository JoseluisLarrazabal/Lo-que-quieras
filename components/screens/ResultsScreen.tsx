"use client"

import { useEffect, useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { useSearch } from "@/contexts/SearchContext"
import ProductList from "@/components/product/ProductList"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import EmptyState from "@/components/common/EmptyState"
import { ArrowLeft, Filter } from "lucide-react"

// Mock data para simular resultados
const mockResults = [
  {
    id: "1",
    title: "iPhone 15 Pro 128GB",
    price: 999.99,
    marketplace: "MercadoLibre",
    url: "https://mercadolibre.com/item1",
    imageUrl: "/placeholder.svg?height=200&width=200",
    description: "Nuevo iPhone 15 Pro con chip A17 Pro",
    category: "Electrónicos",
  },
  {
    id: "2",
    title: "iPhone 15 Pro 128GB",
    price: 1049.99,
    marketplace: "OLX",
    url: "https://olx.com/item2",
    imageUrl: "/placeholder.svg?height=200&width=200",
    description: "iPhone 15 Pro en excelente estado",
    category: "Electrónicos",
  },
  {
    id: "3",
    title: "iPhone 15 Pro Max 256GB",
    price: 1199.99,
    marketplace: "Facebook Marketplace",
    url: "https://facebook.com/marketplace/item3",
    imageUrl: "/placeholder.svg?height=200&width=200",
    description: "iPhone 15 Pro Max nuevo en caja",
    category: "Electrónicos",
  },
]

interface ResultsScreenProps {
  onProductSelect: (product: any) => void
}

export default function ResultsScreen({ onProductSelect }: ResultsScreenProps) {
  const { dispatch: appDispatch } = useApp()
  const { state: searchState, dispatch: searchDispatch } = useSearch()
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "relevance">("relevance")

  useEffect(() => {
    // Simular búsqueda
    if (searchState.query) {
      searchDispatch({ type: "SET_SEARCHING", payload: true })

      setTimeout(() => {
        const filteredResults = mockResults.filter((product) => {
          const matchesQuery = product.title.toLowerCase().includes(searchState.query.toLowerCase())
          const matchesMinPrice = !searchState.filters.minPrice || product.price >= searchState.filters.minPrice
          const matchesMaxPrice = !searchState.filters.maxPrice || product.price <= searchState.filters.maxPrice
          const matchesCategory = !searchState.filters.category || product.category === searchState.filters.category

          return matchesQuery && matchesMinPrice && matchesMaxPrice && matchesCategory
        })

        searchDispatch({ type: "SET_RESULTS", payload: filteredResults })
      }, 1500)
    }
  }, [searchState.query, searchState.filters])

  const handleProductSelect = (product: any) => {
    onProductSelect(product)
    appDispatch({ type: "SET_CURRENT_SCREEN", payload: "product-detail" })
  }

  const handleGoBack = () => {
    appDispatch({ type: "SET_CURRENT_SCREEN", payload: "home" })
  }

  const sortedResults = [...searchState.results].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      default:
        return 0
    }
  })

  if (searchState.isSearching) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center">
            <button onClick={handleGoBack} className="mr-3 p-2 text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Buscando "{searchState.query}"</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner message="Comparando precios en todos los marketplaces..." />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button onClick={handleGoBack} className="mr-3 p-2 text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Resultados para "{searchState.query}"</h1>
              <p className="text-sm text-gray-600">{searchState.results.length} productos encontrados</p>
            </div>
          </div>
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex items-center justify-between">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">Más relevante</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
          </select>

          <button
            onClick={() => appDispatch({ type: "SET_CURRENT_SCREEN", payload: "search" })}
            className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800"
          >
            <Filter size={16} className="mr-1" />
            Filtros
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        {sortedResults.length > 0 ? (
          <ProductList products={sortedResults} onProductSelect={handleProductSelect} />
        ) : (
          <EmptyState
            title="No se encontraron productos"
            description="Intenta con otros términos de búsqueda o ajusta los filtros"
            actionText="Nueva búsqueda"
            onAction={handleGoBack}
          />
        )}
      </div>
    </div>
  )
}

"use client"

import { useFavorites } from "@/contexts/FavoritesContext"
import { useApp } from "@/contexts/AppContext"
import ProductList from "@/components/product/ProductList"
import EmptyState from "@/components/common/EmptyState"
import { Heart, Trash2 } from "lucide-react"

interface FavoritesScreenProps {
  onProductSelect: (product: any) => void
}

export default function FavoritesScreen({ onProductSelect }: FavoritesScreenProps) {
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites()
  const { dispatch: appDispatch } = useApp()

  const handleProductSelect = (product: any) => {
    onProductSelect(product)
    appDispatch({ type: "SET_CURRENT_SCREEN", payload: "product-detail" })
  }

  const handleClearAll = () => {
    if (confirm("¿Estás seguro de que quieres eliminar todos los favoritos?")) {
      favoritesState.favorites.forEach((favorite) => {
        favoritesDispatch({ type: "REMOVE_FAVORITE", payload: favorite.id })
      })
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
            <Heart className="w-6 h-6 text-red-500 mr-2" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Favoritos</h1>
              <p className="text-sm text-gray-600">{favoritesState.favorites.length} productos guardados</p>
            </div>
          </div>

          {favoritesState.favorites.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 text-sm"
            >
              <Trash2 size={16} className="mr-1" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Favorites List */}
      <div className="flex-1 px-4 py-4">
        {favoritesState.favorites.length > 0 ? (
          <ProductList
            products={favoritesState.favorites}
            onProductSelect={handleProductSelect}
            showRemoveFavorite={true}
          />
        ) : (
          <EmptyState
            title="No tienes favoritos"
            description="Los productos que marques como favoritos aparecerán aquí"
            actionText="Buscar productos"
            onAction={handleGoToSearch}
            icon={<Heart className="w-16 h-16 text-gray-300" />}
          />
        )}
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useFavorites } from "@/contexts/FavoritesContext"
import { Heart, ExternalLink } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  title: string
  price: number
  marketplace: string
  url: string
  imageUrl: string
  description?: string
  category?: string
}

interface ProductCardProps {
  product: Product
  onSelect: (product: Product) => void
  showRemoveFavorite?: boolean
}

export default function ProductCard({ product, onSelect, showRemoveFavorite = false }: ProductCardProps) {
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites()
  const [imageError, setImageError] = useState(false)

  const isFavorite = favoritesState.favorites.some((fav) => fav.id === product.id)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFavorite) {
      favoritesDispatch({ type: "REMOVE_FAVORITE", payload: product.id })
    } else {
      favoritesDispatch({ type: "ADD_FAVORITE", payload: product })
    }
  }

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(product.url, "_blank")
  }

  const getMarketplaceColor = (marketplace: string) => {
    switch (marketplace) {
      case "MercadoLibre":
        return "bg-yellow-100 text-yellow-800"
      case "OLX":
        return "bg-green-100 text-green-800"
      case "Facebook Marketplace":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div
      onClick={() => onSelect(product)}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex space-x-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {!imageError ? (
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.title}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-xs">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 pr-2">{product.title}</h3>
            <button
              onClick={handleToggleFavorite}
              className={`p-1 ${isFavorite ? "text-red-500" : "text-gray-400"} hover:text-red-500 transition-colors flex-shrink-0`}
            >
              <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-bold text-green-600">${product.price.toLocaleString()}</div>
            <span className={`text-xs px-2 py-1 rounded-full ${getMarketplaceColor(product.marketplace)}`}>
              {product.marketplace}
            </span>
          </div>

          {product.description && <p className="text-xs text-gray-600 line-clamp-2 mb-2">{product.description}</p>}

          <div className="flex items-center justify-between">
            {product.category && <span className="text-xs text-gray-500">{product.category}</span>}
            <button
              onClick={handleOpenExternal}
              className="flex items-center text-xs text-blue-600 hover:text-blue-800"
            >
              <ExternalLink size={12} className="mr-1" />
              Ver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

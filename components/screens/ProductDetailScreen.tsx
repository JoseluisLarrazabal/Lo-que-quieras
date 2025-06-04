"use client"

import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { useFavorites } from "@/contexts/FavoritesContext"
import PriceComparison from "@/components/product/PriceComparison"
import { ArrowLeft, Heart, ExternalLink, Share2 } from "lucide-react"
import Image from "next/image"

interface ProductDetailScreenProps {
  product: any
}

export default function ProductDetailScreen({ product }: ProductDetailScreenProps) {
  const { dispatch: appDispatch } = useApp()
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites()
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  if (!product) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Producto no encontrado</p>
          <button
            onClick={() => appDispatch({ type: "SET_CURRENT_SCREEN", payload: "home" })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const isFavorite = favoritesState.favorites.some((fav) => fav.id === product.id)

  const handleToggleFavorite = () => {
    if (isFavorite) {
      favoritesDispatch({ type: "REMOVE_FAVORITE", payload: product.id })
    } else {
      favoritesDispatch({ type: "ADD_FAVORITE", payload: product })
    }
  }

  const handleGoBack = () => {
    appDispatch({ type: "SET_CURRENT_SCREEN", payload: "results" })
  }

  const handleOpenExternal = () => {
    window.open(product.url, "_blank")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Encontré este producto: ${product.title} por $${product.price}`,
        url: window.location.href,
      })
    }
  }

  // Mock data para comparación de precios
  const priceComparisons = [
    { marketplace: "MercadoLibre", price: 999.99, url: "https://mercadolibre.com/item1" },
    { marketplace: "OLX", price: 1049.99, url: "https://olx.com/item2" },
    { marketplace: "Facebook Marketplace", price: 1199.99, url: "https://facebook.com/marketplace/item3" },
  ]

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={handleGoBack} className="p-2 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-2">
            <button onClick={handleShare} className="p-2 text-gray-500 hover:text-gray-700">
              <Share2 size={20} />
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`p-2 ${isFavorite ? "text-red-500" : "text-gray-500"} hover:text-red-600`}
            >
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Product Images */}
        <div className="bg-white p-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.title}
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>

          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold text-green-600">${product.price.toLocaleString()}</div>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{product.marketplace}</div>
          </div>

          {product.description && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          <button
            onClick={handleOpenExternal}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <ExternalLink size={20} className="mr-2" />
            Ver en {product.marketplace}
          </button>
        </div>

        {/* Price Comparison */}
        <div className="bg-white p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparación de precios</h3>
          <PriceComparison comparisons={priceComparisons} currentPrice={product.price} />
        </div>
      </div>
    </div>
  )
}

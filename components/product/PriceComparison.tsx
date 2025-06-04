"use client"

import { ExternalLink, TrendingDown, TrendingUp } from "lucide-react"

interface PriceComparison {
  marketplace: string
  price: number
  url: string
}

interface PriceComparisonProps {
  comparisons: PriceComparison[]
  currentPrice: number
}

export default function PriceComparison({ comparisons, currentPrice }: PriceComparisonProps) {
  const sortedComparisons = [...comparisons].sort((a, b) => a.price - b.price)
  const lowestPrice = sortedComparisons[0]?.price || currentPrice
  const highestPrice = sortedComparisons[sortedComparisons.length - 1]?.price || currentPrice

  const getMarketplaceColor = (marketplace: string) => {
    switch (marketplace) {
      case "MercadoLibre":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "OLX":
        return "bg-green-100 text-green-800 border-green-200"
      case "Facebook Marketplace":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriceIndicator = (price: number) => {
    if (price === lowestPrice) {
      return <TrendingDown className="w-4 h-4 text-green-500" />
    } else if (price === highestPrice) {
      return <TrendingUp className="w-4 h-4 text-red-500" />
    }
    return null
  }

  return (
    <div className="space-y-3">
      {sortedComparisons.map((comparison, index) => (
        <div
          key={comparison.marketplace}
          className={`p-4 border rounded-lg ${getMarketplaceColor(comparison.marketplace)} ${
            comparison.price === lowestPrice ? "ring-2 ring-green-500" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <div className="font-semibold text-sm">{comparison.marketplace}</div>
                <div className="text-2xl font-bold">${comparison.price.toLocaleString()}</div>
              </div>
              {getPriceIndicator(comparison.price)}
            </div>

            <div className="flex flex-col items-end space-y-2">
              {comparison.price === lowestPrice && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Mejor precio</span>
              )}
              <button
                onClick={() => window.open(comparison.url, "_blank")}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink size={14} className="mr-1" />
                Ver oferta
              </button>
            </div>
          </div>

          {comparison.price !== lowestPrice && (
            <div className="mt-2 text-xs text-gray-600">
              ${(comparison.price - lowestPrice).toLocaleString()} más caro que el mejor precio
            </div>
          )}
        </div>
      ))}

      {sortedComparisons.length > 1 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-700">
            <strong>Ahorro potencial:</strong> ${(highestPrice - lowestPrice).toLocaleString()}(
            {(((highestPrice - lowestPrice) / highestPrice) * 100).toFixed(1)}%)
          </div>
        </div>
      )}
    </div>
  )
}

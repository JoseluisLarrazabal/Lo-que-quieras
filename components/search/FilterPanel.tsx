"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface FilterPanelProps {
  filters: any
  onFiltersChange: (filters: any) => void
  onClose: () => void
}

export default function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const categories = ["Electrónicos", "Ropa", "Hogar", "Deportes", "Libros", "Juguetes"]

  const marketplaces = ["MercadoLibre", "OLX", "Facebook Marketplace"]

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleClearFilters = () => {
    setLocalFilters({})
    onFiltersChange({})
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Rango de precio</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Precio mínimo</label>
              <input
                type="number"
                placeholder="$0"
                value={localFilters.minPrice || ""}
                onChange={(e) =>
                  handleFilterChange("minPrice", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Precio máximo</label>
              <input
                type="number"
                placeholder="$999999"
                value={localFilters.maxPrice || ""}
                onChange={(e) =>
                  handleFilterChange("maxPrice", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Categoría</h4>
          <select
            value={localFilters.category || ""}
            onChange={(e) => handleFilterChange("category", e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Marketplace */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Marketplace</h4>
          <select
            value={localFilters.marketplace || ""}
            onChange={(e) => handleFilterChange("marketplace", e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los marketplaces</option>
            {marketplaces.map((marketplace) => (
              <option key={marketplace} value={marketplace}>
                {marketplace}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 mt-6">
        <button
          onClick={handleClearFilters}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Limpiar
        </button>
        <button
          onClick={handleApplyFilters}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import { useSearch as useSearchContext } from "@/contexts/SearchContext"

export function useSearch() {
  const { state, dispatch } = useSearchContext()
  const [isLoading, setIsLoading] = useState(false)

  const performSearch = useCallback(
    async (query: string, filters: any = {}) => {
      if (!query.trim()) return

      setIsLoading(true)
      dispatch({ type: "SET_SEARCHING", payload: true })
      dispatch({ type: "SET_QUERY", payload: query })
      dispatch({ type: "ADD_TO_HISTORY", payload: query })

      try {
        // Simular llamada a API
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock results - en una app real esto vendría del backend
        const mockResults = [
          {
            id: "1",
            title: `${query} - Producto 1`,
            price: Math.floor(Math.random() * 1000) + 100,
            marketplace: "MercadoLibre",
            url: "https://mercadolibre.com/item1",
            imageUrl: "/placeholder.svg?height=200&width=200",
            description: `Descripción del producto ${query}`,
            category: "Electrónicos",
          },
          {
            id: "2",
            title: `${query} - Producto 2`,
            price: Math.floor(Math.random() * 1000) + 100,
            marketplace: "OLX",
            url: "https://olx.com/item2",
            imageUrl: "/placeholder.svg?height=200&width=200",
            description: `Otro producto relacionado con ${query}`,
            category: "Electrónicos",
          },
        ]

        dispatch({ type: "SET_RESULTS", payload: mockResults })
      } catch (error) {
        console.error("Error searching:", error)
        dispatch({ type: "SET_RESULTS", payload: [] })
      } finally {
        setIsLoading(false)
        dispatch({ type: "SET_SEARCHING", payload: false })
      }
    },
    [dispatch],
  )

  const clearSearch = useCallback(() => {
    dispatch({ type: "CLEAR_RESULTS" })
  }, [dispatch])

  const updateFilters = useCallback(
    (filters: any) => {
      dispatch({ type: "SET_FILTERS", payload: filters })
    },
    [dispatch],
  )

  return {
    ...state,
    isLoading,
    performSearch,
    clearSearch,
    updateFilters,
  }
}

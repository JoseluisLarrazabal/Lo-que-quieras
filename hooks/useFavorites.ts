"use client"

import { useCallback } from "react"
import { useFavorites as useFavoritesContext } from "@/contexts/FavoritesContext"

export function useFavorites() {
  const { state, dispatch } = useFavoritesContext()

  const addFavorite = useCallback(
    (product: any) => {
      dispatch({ type: "ADD_FAVORITE", payload: product })
    },
    [dispatch],
  )

  const removeFavorite = useCallback(
    (productId: string) => {
      dispatch({ type: "REMOVE_FAVORITE", payload: productId })
    },
    [dispatch],
  )

  const isFavorite = useCallback(
    (productId: string) => {
      return state.favorites.some((fav) => fav.id === productId)
    },
    [state.favorites],
  )

  const toggleFavorite = useCallback(
    (product: any) => {
      if (isFavorite(product.id)) {
        removeFavorite(product.id)
      } else {
        addFavorite(product)
      }
    },
    [isFavorite, addFavorite, removeFavorite],
  )

  return {
    favorites: state.favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    favoritesCount: state.favorites.length,
  }
}

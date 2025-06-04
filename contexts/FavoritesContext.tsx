"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode, useEffect } from "react"

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

interface FavoritesState {
  favorites: Product[]
}

interface FavoritesAction {
  type: "ADD_FAVORITE" | "REMOVE_FAVORITE" | "LOAD_FAVORITES"
  payload: any
}

const initialState: FavoritesState = {
  favorites: [],
}

const FavoritesContext = createContext<{
  state: FavoritesState
  dispatch: React.Dispatch<FavoritesAction>
} | null>(null)

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case "ADD_FAVORITE":
      const newFavorites = [...state.favorites, action.payload]
      if (typeof window !== "undefined") {
        localStorage.setItem("favorites", JSON.stringify(newFavorites))
      }
      return { ...state, favorites: newFavorites }
    case "REMOVE_FAVORITE":
      const filteredFavorites = state.favorites.filter((fav) => fav.id !== action.payload)
      if (typeof window !== "undefined") {
        localStorage.setItem("favorites", JSON.stringify(filteredFavorites))
      }
      return { ...state, favorites: filteredFavorites }
    case "LOAD_FAVORITES":
      return { ...state, favorites: action.payload }
    default:
      return state
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFavorites = localStorage.getItem("favorites")
      if (savedFavorites) {
        dispatch({ type: "LOAD_FAVORITES", payload: JSON.parse(savedFavorites) })
      }
    }
  }, [])

  return <FavoritesContext.Provider value={{ state, dispatch }}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider")
  }
  return context
}

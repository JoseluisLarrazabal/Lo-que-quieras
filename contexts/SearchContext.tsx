"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

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

interface SearchFilters {
  minPrice?: number
  maxPrice?: number
  category?: string
  marketplace?: string
}

interface SearchState {
  query: string
  results: Product[]
  filters: SearchFilters
  isSearching: boolean
  searchHistory: string[]
  suggestions: string[]
}

interface SearchAction {
  type:
    | "SET_QUERY"
    | "SET_RESULTS"
    | "SET_FILTERS"
    | "SET_SEARCHING"
    | "ADD_TO_HISTORY"
    | "SET_SUGGESTIONS"
    | "CLEAR_RESULTS"
  payload: any
}

const initialState: SearchState = {
  query: "",
  results: [],
  filters: {},
  isSearching: false,
  searchHistory: [],
  suggestions: [],
}

const SearchContext = createContext<{
  state: SearchState
  dispatch: React.Dispatch<SearchAction>
} | null>(null)

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_QUERY":
      return { ...state, query: action.payload }
    case "SET_RESULTS":
      return { ...state, results: action.payload, isSearching: false }
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } }
    case "SET_SEARCHING":
      return { ...state, isSearching: action.payload }
    case "ADD_TO_HISTORY":
      const newHistory = [action.payload, ...state.searchHistory.filter((item) => item !== action.payload)].slice(0, 50)
      return { ...state, searchHistory: newHistory }
    case "SET_SUGGESTIONS":
      return { ...state, suggestions: action.payload }
    case "CLEAR_RESULTS":
      return { ...state, results: [], query: "" }
    default:
      return state
  }
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState)

  return <SearchContext.Provider value={{ state, dispatch }}>{children}</SearchContext.Provider>
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider")
  }
  return context
}

"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

interface AppState {
  theme: "light" | "dark"
  isLoading: boolean
  networkStatus: "online" | "offline"
  currentScreen: string
}

interface AppAction {
  type: "SET_THEME" | "SET_LOADING" | "SET_NETWORK_STATUS" | "SET_CURRENT_SCREEN"
  payload: any
}

const initialState: AppState = {
  theme: "light",
  isLoading: false,
  networkStatus: "online",
  currentScreen: "home",
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_NETWORK_STATUS":
      return { ...state, networkStatus: action.payload }
    case "SET_CURRENT_SCREEN":
      return { ...state, currentScreen: action.payload }
    default:
      return state
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}

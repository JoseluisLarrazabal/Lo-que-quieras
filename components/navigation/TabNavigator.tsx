"use client"

import { Home, Search, Heart, Clock } from "lucide-react"
import { useApp } from "@/contexts/AppContext"
import { useFavorites } from "@/contexts/FavoritesContext"

export default function TabNavigator() {
  const { state, dispatch } = useApp()
  const { state: favoritesState } = useFavorites()

  const tabs = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "search", label: "Buscar", icon: Search },
    { id: "favorites", label: "Favoritos", icon: Heart, badge: favoritesState.favorites.length },
    { id: "history", label: "Historial", icon: Clock },
  ]

  const handleTabPress = (tabId: string) => {
    dispatch({ type: "SET_CURRENT_SCREEN", payload: tabId })
  }

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2 shadow-lg">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = state.currentScreen === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 relative ${
                isActive
                  ? "text-blue-600 bg-blue-50 transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon size={20} className={isActive ? "animate-pulse" : ""} />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

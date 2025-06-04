"use client"

import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import HomeScreen from "@/components/screens/HomeScreen"
import SearchScreen from "@/components/screens/SearchScreen"
import ResultsScreen from "@/components/screens/ResultsScreen"
import ProductDetailScreen from "@/components/screens/ProductDetailScreen"
import FavoritesScreen from "@/components/screens/FavoritesScreen"
import HistoryScreen from "@/components/screens/HistoryScreen"
import TabNavigator from "./TabNavigator"

export default function AppNavigator() {
  const { state, dispatch } = useApp()
  const [selectedProduct, setSelectedProduct] = useState(null)

  const renderScreen = () => {
    switch (state.currentScreen) {
      case "home":
        return <HomeScreen />
      case "search":
        return <SearchScreen />
      case "results":
        return <ResultsScreen onProductSelect={setSelectedProduct} />
      case "product-detail":
        return <ProductDetailScreen product={selectedProduct} />
      case "favorites":
        return <FavoritesScreen onProductSelect={setSelectedProduct} />
      case "history":
        return <HistoryScreen />
      default:
        return <HomeScreen />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pb-20">{renderScreen()}</div>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <TabNavigator />
      </div>
    </div>
  )
}

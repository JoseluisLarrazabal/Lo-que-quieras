"use client"

import ProductCard from "./ProductCard"

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

interface ProductListProps {
  products: Product[]
  onProductSelect: (product: Product) => void
  showRemoveFavorite?: boolean
}

export default function ProductList({ products, onProductSelect, showRemoveFavorite = false }: ProductListProps) {
  return (
    <div className="space-y-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={onProductSelect}
          showRemoveFavorite={showRemoveFavorite}
        />
      ))}
    </div>
  )
}

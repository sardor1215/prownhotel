'use client'

import React from 'react'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { getImageUrl, PLACEHOLDER_IMAGE } from '../utils/image'

interface Product {
  id: number
  name: string
  description: string
  price: number
  main_image: string
  category: string
  specifications?: any
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCart = () => {
    onAddToCart(product)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={getImageUrl(product.main_image) || PLACEHOLDER_IMAGE}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="mb-2">
          <span className="text-sm text-gray-500 font-medium">{product.category}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {product.description}
        </p>

        {/* Specifications Preview */}
        {product.specifications && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
                <span key={key} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {key}: {String(value)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary-600">
            ${Number(product.price).toFixed(2)}
          </div>
          
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

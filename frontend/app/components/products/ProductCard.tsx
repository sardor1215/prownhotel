import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getImageUrl, PLACEHOLDER_IMAGE } from '../../utils/image'

interface Product {
  id: number
  name: string
  description: string
  price: number
  main_image: string
  images?: Array<{
    image_url: string
    is_main: boolean
    display_order: number
  }>
  category_name: string
  average_rating: number
  review_count: number
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  isAddingToCart?: boolean
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  isAddingToCart = false 
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    onAddToCart(product)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group relative">
      {/* Clickable Product Link */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-square relative overflow-hidden">
          <Image 
            src={getImageUrl(product.main_image || (product.images && product.images[0]?.image_url)) || PLACEHOLDER_IMAGE} 
            alt={product.name} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
        <div className="p-4 pb-16">
          <h3 className="font-medium text-gray-900 mb-2 text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>
          <div className="text-lg font-bold text-gray-900">
            ₺ {Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          {product.average_rating > 0 && (
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.average_rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-1">
                ({product.review_count})
              </span>
            </div>
          )}
        </div>
      </Link>
      
      {/* Add to Cart Button */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className={`mt-4 w-full flex items-center justify-center gap-2 ${isAddingToCart ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-md transition-colors`}
        >
          {isAddingToCart ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ekleniyor...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {'Sepete Ekle'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

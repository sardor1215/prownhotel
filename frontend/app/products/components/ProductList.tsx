'use client';

import { ShoppingCart, Loader2, X, Search } from 'lucide-react';
import Image from 'next/image';
import { Product, ViewMode } from '../types';
import { ProductsGridSkeleton } from './ProductsGridSkeleton';
import { getImageUrl } from '../../utils/image';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isAddingToCart: number | null;
}

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  isAddingToCart: number | null;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, isAddingToCart }: ProductCardProps) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="relative h-48 w-full">
      <Image
        src={getImageUrl(product.main_image)}
        alt={product.name}
        fill
        className="object-cover"
      />
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
      <p className="text-sm text-gray-500 mb-2">{product.category_name}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
        <button
          onClick={() => onAddToCart(product)}
          disabled={isAddingToCart === product.id}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-1"
        >
          {isAddingToCart === product.id ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

export function ProductList({
  products,
  loading,
  error,
  viewMode,
  isAddingToCart,
  onAddToCart,
}: ProductListProps) {
  if (loading) {
    return <ProductsGridSkeleton count={12} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <X className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Search className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
        <p className="mt-1 text-gray-500">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            isAddingToCart={isAddingToCart === product.id ? product.id : null}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-48 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={product.main_image || '/placeholder.jpg'}
                alt={product.name}
                width={192}
                height={192}
                className="w-full h-full object-cover"
                priority={products.indexOf(product) < 4}
              />
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-500 capitalize">{product.category_name}</p>
                <p className="mt-3 text-gray-600 line-clamp-3">{product.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  {product.average_rating > 0 && (
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${i < Math.round(product.average_rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-500">
                        ({product.review_count})
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={isAddingToCart === product.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {isAddingToCart === product.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

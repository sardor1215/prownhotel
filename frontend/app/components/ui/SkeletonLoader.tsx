import React from 'react'

interface SkeletonLoaderProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  lines?: number
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full'
      case 'text':
        return 'rounded h-4'
      case 'rectangular':
      default:
        return 'rounded'
    }
  }

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()} mb-2 last:mb-0`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : width, // Last line is shorter
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={style}
    />
  )
}

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="aspect-square relative">
        <SkeletonLoader height="100%" />
      </div>
      <div className="p-4 pb-16">
        <SkeletonLoader variant="text" lines={2} className="mb-2" />
        <SkeletonLoader width="60%" height="1.5rem" />
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <SkeletonLoader height="2.5rem" />
      </div>
    </div>
  )
}

// Products Grid Skeleton
export const ProductsGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}

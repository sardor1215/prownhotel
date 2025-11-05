'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ShoppingCart, ArrowLeft, Plus, Minus, Share2, X, Star, ChevronLeft, ChevronRight, Truck, BadgePercent, Ruler, Layers } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useOrderManagement } from '../../hooks/useOrderManagement'
import Navbar from '../../components/Navbar'
import Cart from '../../components/Cart'
import CheckoutForm from '../../components/CheckoutForm'
import { getImageUrl, PLACEHOLDER_IMAGE } from '../../utils/image'

interface Product {
  id: number
  name: string
  description: string
  price: number
  main_image: string

  category_name: string
  average_rating: number
  review_count: number
  dimensions?: string
  material?: string
  features?: string
  specifications?: any
}

interface ProductImage {
  id: number
  image_url: string
  alt_text: string
  sort_order: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface User {
  id: number
  name: string
  email: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const thumbsRef = useRef<HTMLDivElement | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  
  // User authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  
  const {
    addToCart,
    cartItems,
    getCartItemCount,
    updateCartQuantity,
    removeFromCart,
    submitOrder
  } = useOrderManagement()

  // Authentication functions
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsLoggedIn(true)
      try {
        setUser(JSON.parse(userData))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
    window.location.reload()
  }

  const handleCheckoutSubmit = async (orderData: any) => {
    const result = await submitOrder(orderData)
    if (result.success) {
      setNotification({ message: 'Siparişiniz başarıyla alındı!', type: 'success' })
      setIsCheckoutOpen(false)
      setTimeout(() => setNotification(null), 5000)
    } else {
      setNotification({ message: `Sipariş gönderilemedi: ${result.error}`, type: 'error' })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      console.log('Fetching product with ID:', params.id) // Debug log
      const response = await fetch(`${API_BASE_URL}/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', JSON.stringify(data, null, 2)) // Debug log
        
        if (data.product) {
          console.log('Main image:', data.product.main_image) // Debug log
          console.log('Additional images:', data.product.images) // Debug log
          console.log('Images array length:', data.product.images?.length || 0) // Debug log
          
          // Ensure we have a valid images array
          const images = Array.isArray(data.product.images) 
            ? data.product.images 
            : [];
            
          console.log('Processed images:', images) // Debug log
          
          setProduct(data.product)
          setProductImages(images)
        }
      } else {
        console.error('Failed to load product')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    const success = await addToCart({
      ...product
    }, quantity)
    
    if (success) {
      showNotification(`${product.name} sepete eklendi (${quantity} adet)`, 'success')
    } else {
      showNotification('Ürün sepete eklenemedi', 'error')
    }
  }

  // Debug logs before processing images
  console.log('Product in render:', product)
  console.log('Product images in render:', productImages)
  
  // Define interface for image objects
  interface ProductImageItem {
    url: string;
    isMain: boolean;
    alt?: string;
  }

  // Combine images ensuring no duplicates
  const allImages = React.useMemo(() => {
    // Start with a properly typed empty array
    const uniqueImages: ProductImageItem[] = [];
    
    // Add the main image if it exists
    if (product?.main_image) {
      uniqueImages.push({
        url: product.main_image,
        isMain: true
      });
    }
    
    // Add additional images, avoiding duplicates
    (productImages || [])
      .filter(img => img && img.image_url)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .forEach(img => {
        // Skip if this URL already exists in our array
        if (!uniqueImages.some(existing => existing.url === img.image_url)) {
          uniqueImages.push({
            url: img.image_url,
            isMain: false,
            alt: img.alt_text || `Product image ${uniqueImages.length + 1}`
          });
        }
      });
    
    // Convert to final format with proper URLs
    const processedImages = uniqueImages.map(item => {
      const url = getImageUrl(item.url) || PLACEHOLDER_IMAGE;
      return url;
    });
    
    // If no images at all, return a single placeholder
    return processedImages.length > 0 ? processedImages : [PLACEHOLDER_IMAGE];
  }, [product, productImages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ürün bulunamadı</h1>
          <Link href="/products" className="text-blue-600 hover:text-blue-700">
            Ürünlere geri dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
        cartItemCount={getCartItemCount()}
        onCartOpen={() => setIsCartOpen(true)}
      />

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.type === 'success' ? (
            <ShoppingCart className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}

      {/* Sticky Add-to-Cart (mobile) */}
      {product && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t shadow-lg p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="text-lg font-semibold text-gray-900">
              ₺ {Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
            <button
              onClick={async () => {
                if (isAdding) return
                setIsAdding(true)
                try { await handleAddToCart() } finally { setIsAdding(false) }
              }}
              disabled={isAdding}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all duration-200 transform
                ${isAdding ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'} text-white shadow-lg hover:shadow-xl`}
            >
              {isAdding ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/70 border-top-transparent border-t-transparent rounded-full animate-spin" />
                  Ekleniyor
                </span>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Sepete Ekle
                </>
              )}
            </button>
          </div>
        </div>
      )}
          {notification.message}
        </div>
      )}

      {/* Back & Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Geri
          </button>
          <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
            <ol className="flex items-center gap-1">
              <li>
                <Link href="/" className="hover:text-gray-700">Ana Sayfa</Link>
              </li>
              <li className="px-1">/</li>
              <li>
                <Link href="/products" className="hover:text-gray-700">Ürünler</Link>
              </li>
              {product?.name && (
                <>
                  <li className="px-1">/</li>
                  <li className="text-gray-700 truncate max-w-[40ch]" aria-current="page">{product.name}</li>
                </>
              )}
            </ol>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image with hover zoom and lightbox */}
            <div
              className="relative overflow-hidden rounded-lg bg-white shadow-md group cursor-zoom-in h-[520px] md:h-[600px]"
              onClick={() => setIsLightboxOpen(true)}
            >
              <Image
                src={allImages[selectedImageIndex]}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>

            {/* Thumbnail Images with scroll and arrows */}
            {allImages.length > 1 && (
              <div className="relative">
                <div ref={thumbsRef} className="flex gap-2 overflow-x-auto py-1">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative rounded-lg border transition-all flex-shrink-0 w-20 h-20 md:w-24 md:h-24 hover:scale-[1.02] hover:shadow-md ${
                        selectedImageIndex === index
                          ? 'border-blue-600 ring-2 ring-blue-600'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      aria-label={`Resim ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 20vw, 10vw"
                        className="object-cover rounded-md"
                        priority={index === 0}
                      />
                    </button>
                  ))}
                </div>

                {/* Scroll Arrows */}
                <button
                  type="button"
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow hover:bg-white"
                  onClick={() => thumbsRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                  aria-label="Önceki görseller"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  type="button"
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow hover:bg-white"
                  onClick={() => thumbsRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                  aria-label="Sonraki görseller"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">{product.category_name}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                {/* Share button near title (desktop) */}
                <button
                  className="inline-flex p-2 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 transition-transform hover:scale-[1.02] hover:shadow-md"
                  aria-label="Ürünü paylaş"
                  onClick={async () => {
                    const url = window.location.href
                    const shareData: ShareData = {
                      title: product?.name || 'Ürün',
                      text: product?.description ? String(product.description).slice(0, 120) : '',
                      url
                    }
                    if (navigator.share) {
                      try {
                        await navigator.share(shareData)
                        showNotification('Paylaşıldı', 'success')
                        return
                      } catch (err: any) {
                        if (err && (err.name === 'AbortError' || err.message === 'Share canceled')) return
                      }
                    }
                    try {
                      await navigator.clipboard.writeText(url)
                      showNotification('Bağlantı kopyalandı', 'success')
                    } catch (e) {
                      const ok = window.prompt('Bu bağlantıyı kopyalayın:', url)
                      if (ok !== null) {
                        showNotification('Bağlantı kopyalama penceresi açıldı', 'success')
                      }
                    }
                  }}
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              {/* Rating row - show only when there is at least one rating/review */}
              {(((typeof product.average_rating === 'number') && product.average_rating > 0) ||
                ((typeof product.review_count === 'number') && product.review_count > 0)) && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const filled = (product.average_rating || 0) >= i + 1
                      return (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${filled ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      )
                    })}
                  </div>
                  {typeof product.average_rating === 'number' && (
                    <span>{product.average_rating.toFixed(1)}</span>
                  )}
                  {typeof product.review_count === 'number' && (
                    <span>({product.review_count} yorum)</span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="mt-4 mb-4 flex items-center flex-wrap gap-3">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  ₺ {Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200">
                  <Truck className="w-4 h-4" /> Kargo ücretsiz
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                  <BadgePercent className="w-4 h-4" /> KDV dahil
                </span>
              </div>
              {/* <p className="text-sm text-gray-600">Taksit seçenekleri için bizimle iletişime geçin.</p> */}
            </div>

            {/* Description */}
            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürün Açıklaması</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications as cards */}
            {(product.dimensions || product.material || product.features) && (
              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Özellikler</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.dimensions && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Ruler className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-500">Boyutlar</div>
                          <div className="font-medium text-gray-900">{product.dimensions}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {product.material && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Layers className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-500">Malzeme</div>
                          <div className="font-medium text-gray-900">{product.material}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {product.features && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:col-span-2">
                      <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-500">Özellikler</div>
                          <div className="font-medium text-gray-900">{product.features}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add to Cart and Actions */}
            <div className="border-t pt-6">
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    if (isAdding) return
                    setIsAdding(true)
                    try { await handleAddToCart() } finally { setIsAdding(false) }
                  }}
                  disabled={isAdding}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold transition-all duration-200 transform
                    ${isAdding ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'} text-white shadow-lg hover:shadow-xl`}
                >
                  {isAdding ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                      Ekleniyor
                    </span>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Sepete Ekle
                    </>
                  )}
                </button>
                
                {/* Moved share button near title; remove from action row to keep CTA dominant */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-200"
              aria-label="Kapat"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={allImages[selectedImageIndex]}
                alt={`${product.name} - Büyük görüntü`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Cart Component */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false)
          setIsCheckoutOpen(true)
        }}
      />

      {/* Checkout Form */}
      <CheckoutForm
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onSubmitOrder={handleCheckoutSubmit}
      />
    </div>
  )
}

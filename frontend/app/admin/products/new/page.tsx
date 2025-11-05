'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { MultiImageUpload } from '../../../components/MultiImageUpload'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Array<{id: number, name: string, slug: string}>>([])
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: ''
  })
  
  const [productImages, setProductImages] = useState<string[]>([])

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin-panel/categories', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        } else if (response.status === 401) {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate description length
      if (!formData.description || formData.description.trim().length < 10) {
        setError('Description must be at least 10 characters long');
        setIsLoading(false);
        return;
      }

      console.log('Product images before sending:', productImages);
      console.log('Form data:', formData);
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: 1, // Default stock value since we're not tracking stock
        category_id: parseInt(formData.category_id),
        main_image: productImages[0] || null,
        images: productImages
      }

      console.log('Sending product data:', productData);
      console.log('Images array length:', productImages.length);
      console.log('First image URL:', productImages[0]);

      const response = await fetch('/api/admin-panel/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productData)
      });

      const responseData = await response.json().catch(() => ({}));
      
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);
      
      if (response.ok) {
        console.log('Product created successfully:', responseData);
        router.push('/admin/dashboard');
      } else {
        console.error('Failed to create product:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        setError(responseData.message || responseData.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error)
      setError('Failed to create product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  // Image handling is now done by the ImageUpload component

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Premium Glass Shower Cabin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description * <span className="text-xs text-gray-500">(minimum 10 characters)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Detailed product description (at least 10 characters)..."
                  required
                  minLength={10}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length} / 10 characters minimum
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₺) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="899.99"
                  required
                />
              </div>

              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-sm text-gray-500">
                  Manage categories in the{' '}
                  <a 
                    href="/admin/categories" 
                    className="text-primary-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Categories section
                  </a>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Images</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload up to 5 images. The first image will be used as the main product image.
                </p>
                <MultiImageUpload
                  images={productImages}
                  onImagesChange={setProductImages}
                  maxImages={5}
                  className="mb-4"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-5 w-5" />
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

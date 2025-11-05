'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ImageObject {
  url: string;
  filename?: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  main_image: string;
  images: Array<{ url: string; filename?: string }>;
  category_id: string;
  specifications: Record<string, string>;
}

type ImageData = string | { url: string; filename?: string };

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  main_image: string | { url: string };
  images: ImageData[];
  category_id: number;
  specifications: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id || '';

  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    main_image: '',
    images: [{ url: '' }],
    category_id: '',
    specifications: {}
  })

  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchProduct(),
        fetchCategories()
      ])
    }
    fetchData()
  }, [productId])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin-panel/categories', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
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

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin-panel/products/${productId}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const product: Product = await response.json();
        
        // Process images to ensure consistent format
        const processImages = (images: ImageData | ImageData[] | undefined): Array<{url: string, filename?: string}> => {
          if (!images) return [{ url: '' }];
          const imageArray = Array.isArray(images) ? images : [images];
          
          return imageArray.map((img): {url: string, filename?: string} => {
            if (!img) return { url: '' };
            
            if (typeof img === 'string') {
              return { 
                url: img, 
                filename: img.split('/').pop() 
              };
            }
            
            if (typeof img === 'object' && img !== null && 'url' in img) {
              const url = typeof img.url === 'string' ? img.url : '';
              const filename = 'filename' in img && typeof img.filename === 'string' 
                ? img.filename 
                : url ? url.split('/').pop() : 'image.jpg';
                
              return {
                url,
                filename
              };
            }
            
            return { url: '' };
          });
        }

        let mainImage = '';
        if (typeof product.main_image === 'string') {
          mainImage = product.main_image;
        } else if (product.main_image && 'url' in product.main_image) {
          mainImage = product.main_image.url || '';
        }
          
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '0',
          main_image: mainImage,
          images: processImages(product.images),
          category_id: product.category_id?.toString() || '',
          specifications: product.specifications || {}
        })
      } else if (response.status === 401) {
        router.push('/admin/login')
      } else {
        setError('Failed to load product')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate description length
      if (!formData.description || formData.description.trim().length < 10) {
        setError('Description must be at least 10 characters long');
        setIsLoading(false);
        return;
      }

      // Prepare product data for submission
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        main_image: formData.main_image,
        images: formData.images
          .filter(img => img?.url?.trim() !== '')
          .map(img => ({
            url: img.url,
            ...(img.filename && { filename: img.filename })
          })),
        category_id: parseInt(formData.category_id) || 0,
        specifications: formData.specifications
      };

      const response = await fetch(`/api/admin-panel/products/${productId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        router.push('/admin/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      setError('Failed to update product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', filename: '' }]
    }))
  }

  const updateImageField = (index: number, value: string) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const filename = value.split('/').pop() || 'image.jpg';
      newImages[index] = {
        ...newImages[index],
        url: value,
        filename
      };
      return {
        ...prev,
        images: newImages
      };
    });
  }

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addSpecification = () => {
    if (specKey && specValue) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey]: specValue
        }
      }))
      setSpecKey('')
      setSpecValue('')
    }
  }

  const removeSpecification = (key: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: Object.fromEntries(
        Object.entries(prev.specifications).filter(([k]) => k !== key)
      )
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error && !formData.name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
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
              
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description * <span className="text-xs text-gray-500">(minimum 10 characters)</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter product description (at least 10 characters)..."
                  required
                  minLength={10}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length} / 10 characters minimum
                </p>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-sm text-gray-500">
                  Manage categories in the <a 
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

            {/* Images and Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Images & Details</h3>
              
              {/* Main Image */}
              <div>
                <label htmlFor="main_image" className="block text-sm font-medium text-gray-700 mb-2">
                  Main Image URL *
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    id="main_image"
                    value={formData.main_image}
                    onChange={(e) => handleInputChange('main_image', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {formData.main_image && (
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={formData.main_image}
                          alt="Main preview"
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-product.jpg';
                          }}
                          crossOrigin="anonymous"
                        />
                      </div>
                      <div className="text-xs text-gray-500 truncate flex-1">
                        {formData.main_image.split('/').pop()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Images
                </label>
                <div className="space-y-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <input
                          type="url"
                          value={typeof image === 'string' ? image : image.url || ''}
                          onChange={(e) => updateImageField(index, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                        {image && (
                          <div className="mt-1 flex items-center">
                            <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
                              <img 
                                src={typeof image === 'string' ? image : image.url || ''} 
                                alt={`Preview ${index + 1}`} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {typeof image === 'object' && 'filename' in image && image.filename 
                                ? image.filename 
                                : (typeof image === 'string' || (image && 'url' in image)) 
                                  ? (typeof image === 'string' ? image : image.url).split('/').pop() 
                                  : 'image.jpg'}
                            </div>
                          </div>
                        )}
                      </div>
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addImageField}
                  className="mt-2 flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Image
                </button>
              </div>

              {/* Specifications */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">Specifications</h4>
                
                {/* Add Specification */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Property (e.g., width)"
                  />
                  <input
                    type="text"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Value (e.g., 120cm)"
                  />
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>

                {/* Current Specifications */}
                <div className="space-y-2">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm">
                        <strong>{key}:</strong> {String(value)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

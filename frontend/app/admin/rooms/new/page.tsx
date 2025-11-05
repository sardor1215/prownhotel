'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, ArrowUp, ArrowDown, Image as ImageIcon, Upload, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getApiUrl, getBackendUrl } from '@/lib/backend-url'

interface RoomType {
  id: number
  name: string
  slug: string
}

interface ImageFile {
  file: File | null
  url: string // Blob URL for preview or server URL
  uploadedUrl?: string // Server URL (stored separately for form submission)
  uploading: boolean
  uploaded: boolean
}

export default function NewRoomPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [images, setImages] = useState<ImageFile[]>([{ file: null, url: '', uploading: false, uploaded: false }])
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_night: '',
    room_type_id: '',
    max_adults: '2',
    max_children: '0',
    size_sqm: '',
    is_available: true,
    display_order: '0'
  })

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch(getApiUrl('/api/room-types'), {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setRoomTypes(data.roomTypes)
      } else {
        console.error('Failed to fetch room types:', data.error)
        toast.error('Failed to load room types')
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
      toast.error('Failed to load room types')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const handleFileSelect = async (index: number, file: File | null) => {
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)

    // Update images array
    const newImages = [...images]
    newImages[index] = {
      file,
      url: previewUrl,
      uploading: true,
      uploaded: false
    }
    setImages(newImages)

    // Upload file
    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        const verifyResponse = await fetch('/api/admin-auth/verify', {
          credentials: 'include'
        })
        
        if (!verifyResponse.ok) {
          toast.error('Not authenticated. Please login again.')
          window.location.href = '/admin/login'
          return
        }
      }

      const formData = new FormData()
      formData.append('image', file)

      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        headers['X-Authorization'] = `Bearer ${token}` // Also send as custom header
      }

      // Use Next.js API route instead of direct backend call
      const uploadResponse = await fetch('/api/admin/room-uploads/single', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData
      })

      // Handle 401 error specifically
      if (uploadResponse.status === 401) {
        const errorData = await uploadResponse.json().catch(() => ({ error: 'Authentication failed' }))
        toast.error(errorData.error || 'Authentication failed. Please login again.')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        window.location.href = '/admin/login'
        return
      }

      const uploadData = await uploadResponse.json()

      if (uploadData.success) {
        // Clean up blob URL
        if (newImages[index].url && newImages[index].url.startsWith('blob:')) {
          URL.revokeObjectURL(newImages[index].url)
        }
        
        // Log the URL for debugging
        console.log('Upload successful, received URL:', uploadData.url)
        
        // Use the backend URL directly for display - no need to fetch and convert to blob
        const backendUrl = getBackendUrl()
        const imageUrl = `${backendUrl}${uploadData.url}`
        console.log('Image URL for display:', imageUrl)
        
        // Update with server URL directly
        const updatedImages = [...images]
        updatedImages[index] = {
          file: null, // Clear file after upload
          url: imageUrl, // Use server URL directly for display
          uploadedUrl: uploadData.url, // Store relative URL for submission
          uploading: false,
          uploaded: true
        }
        setImages(updatedImages)
        console.log('Updated images array:', updatedImages)
        toast.success('Image uploaded successfully')
      } else {
        throw new Error(uploadData.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
      
      // Reset on error
      const updatedImages = [...images]
      updatedImages[index] = {
        file: null,
        url: '',
        uploading: false,
        uploaded: false
      }
      setImages(updatedImages)
    }
  }

  const addImageField = () => {
    setImages([...images, { file: null, url: '', uploading: false, uploaded: false }])
  }

  const removeImage = (index: number) => {
    if (images.length > 1) {
      const newImages = images.filter((_, i) => i !== index)
      // Clean up preview URLs
      if (images[index].url && images[index].url.startsWith('blob:')) {
        URL.revokeObjectURL(images[index].url)
      }
      setImages(newImages)
    } else {
      toast.error('At least one image is required')
    }
  }

  const moveImageUp = (index: number) => {
    if (index === 0) return
    const newImages = [...images]
    ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
    setImages(newImages)
  }

  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return
    const newImages = [...images]
    ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
    setImages(newImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Filter out images that haven't been uploaded
    // Use uploadedUrl (relative URL) if available, otherwise extract from full URL
    const validImages = images
      .map(img => {
        // Use uploadedUrl if available (relative URL from server)
        if (img.uploadedUrl) {
          return img.uploadedUrl
        }
        // If url is a full URL, extract the relative path
        if (img.url && img.url.startsWith('http')) {
          const urlObj = new URL(img.url)
          return urlObj.pathname
        }
        // If url is already a relative path, use it
        if (img.url && !img.url.startsWith('blob:') && !img.url.startsWith('http')) {
          return img.url
        }
        return null
      })
      .filter((url): url is string => url !== null && url.trim() !== '')

    if (validImages.length === 0) {
      toast.error('Please upload at least one image')
      setLoading(false)
      return
    }

    // Check if any images are still uploading
    const stillUploading = images.some(img => img.uploading)
    if (stillUploading) {
      toast.error('Please wait for all images to finish uploading')
      setLoading(false)
      return
    }

    try {
      // Get token from localStorage
      let token = localStorage.getItem('adminToken');
      
      if (!token) {
        const verifyResponse = await fetch('/api/admin-auth/verify', {
          credentials: 'include'
        });
        
        if (!verifyResponse.ok) {
          toast.error('Not authenticated. Please login again.')
          window.location.href = '/admin/login'
          return
        }
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // First image is main_image, rest go in images array
      const main_image = validImages[0]
      const imagesArray = validImages.slice(1)
      
      const response = await fetch(getApiUrl('/api/admin/rooms'), {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          ...formData,
          price_per_night: parseFloat(formData.price_per_night),
          room_type_id: parseInt(formData.room_type_id),
          max_adults: parseInt(formData.max_adults),
          max_children: parseInt(formData.max_children),
          size_sqm: formData.size_sqm ? parseInt(formData.size_sqm) : null,
          display_order: parseInt(formData.display_order) || 0,
          main_image,
          images: imagesArray
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Room created successfully!')
        // Navigate to rooms page - it will refetch on mount
        // Use window.location to force a full page reload and fresh data
        setTimeout(() => {
          window.location.href = '/admin/rooms'
        }, 500)
      } else {
        toast.error(data.error || 'Failed to create room')
      }
    } catch (error) {
      console.error('Error creating room:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">Add New Room</h1>
            <p className="text-zinc-600">Create a new room listing for guests</p>
          </div>
          <Link
            href="/admin/rooms"
            className="text-zinc-600 hover:text-zinc-900 font-medium"
          >
            ← Back to Rooms
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Room Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              placeholder="e.g., Superior Deluxe Room"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-none"
              placeholder="Describe the room features and amenities..."
            />
          </div>

          {/* Room Type & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Room Type <span className="text-red-500">*</span>
              </label>
              <select
                name="room_type_id"
                value={formData.room_type_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              >
                <option value="">Select room type</option>
                {roomTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Price per Night (£) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price_per_night"
                value={formData.price_per_night}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Images Section */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Room Images <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-zinc-500 mb-4">
              Upload multiple images. The first image will be the main image. Use arrows to reorder.
            </p>
            
            <div className="space-y-3">
              {images.map((image, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border border-stone-200 rounded-lg bg-stone-50 hover:bg-stone-100 transition">
                  {/* Order Controls & Number */}
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveImageUp(index)}
                        disabled={index === 0}
                        className="p-1 text-zinc-400 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImageDown(index)}
                        disabled={index === images.length - 1}
                        className="p-1 text-zinc-400 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      index === 0 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-stone-200 text-zinc-700'
                    }`}>
                      {index === 0 ? 'Main' : index + 1}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="flex-1">
                    {!image.uploaded && !image.uploading ? (
                      <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 hover:border-amber-500 transition">
                        <input
                          ref={(el) => {
                            fileInputRefs.current[index] = el
                          }}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={(e) => handleFileSelect(index, e.target.files?.[0] || null)}
                          className="hidden"
                          id={`image-upload-${index}`}
                        />
                        <label
                          htmlFor={`image-upload-${index}`}
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                          <span className="text-sm font-medium text-zinc-700 mb-1">
                            Click to upload image
                          </span>
                          <span className="text-xs text-zinc-500">
                            JPEG, PNG, GIF, WebP (max 10MB)
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Image Preview */}
                        <div className="relative w-full h-48 bg-stone-200 rounded-lg overflow-hidden border border-stone-300">
                          {image.uploading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-stone-100 z-20">
                              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                            </div>
                          ) : image.url ? (
                            <>
                              <img
                                key={`img-${index}-${image.url}`}
                src={image.url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover block"
                                style={{ display: 'block' }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  const src = target.src
                                  console.error('❌ Image failed to load:', src)
                                  console.error('❌ Image URL from state:', image.url)
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    const icon = parent.querySelector('.preview-icon') as HTMLElement
                                    if (icon) {
                                      icon.style.display = 'flex'
                                      icon.classList.remove('hidden')
                                    }
                                  }
                                }}
                                onLoad={(e) => {
                                  console.log('✅ Image loaded successfully:', (e.target as HTMLImageElement).src)
                                  // Hide error icon if image loads successfully
                                  const target = e.target as HTMLImageElement
                                  const parent = target.parentElement
                                  if (parent) {
                                    const icon = parent.querySelector('.preview-icon') as HTMLElement
                                    if (icon) {
                                      icon.style.display = 'none'
                                      icon.classList.add('hidden')
                                    }
                                  }
                                }}
                              />
                              <div className="preview-icon hidden absolute inset-0 flex items-center justify-center bg-stone-100 z-10">
                                <div className="text-center">
                                  <ImageIcon className="w-12 h-12 text-stone-400 mx-auto mb-2" />
                                  <p className="text-xs text-stone-500">Image failed to load</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                              <div className="text-center">
                                <ImageIcon className="w-12 h-12 text-stone-400 mx-auto mb-2" />
                                <p className="text-xs text-stone-500">No image</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Upload Status */}
                          {image.uploading && (
                            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded z-30">
                              Uploading...
                            </div>
                          )}
                          {image.uploaded && !image.uploading && image.url && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded z-30">
                              ✓ Uploaded
                            </div>
                          )}
                        </div>
                        
                        {/* Change Image Button */}
                        {image.uploaded && image.url && (
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...images]
                              // Clean up blob URL if exists
                              if (image.url && image.url.startsWith('blob:')) {
                                URL.revokeObjectURL(image.url)
                              }
                              newImages[index] = { file: null, url: '', uploading: false, uploaded: false }
                              setImages(newImages)
                            }}
                            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                          >
                            Change Image
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={images.length === 1 || image.uploading}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remove image"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Image Button */}
            <button
              type="button"
              onClick={addImageField}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Add Another Image
            </button>
          </div>

          {/* Capacity & Size */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Max Adults <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="max_adults"
                value={formData.max_adults}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Max Children
              </label>
              <input
                type="number"
                name="max_children"
                value={formData.max_children}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Size (m²)
              </label>
              <input
                type="number"
                name="size_sqm"
                value={formData.size_sqm}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Display Order */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <ArrowUp className="w-4 h-4" />
                  Homepage Display Position
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-lg font-semibold"
                    placeholder="0"
                  />
                  <div className="bg-white rounded-lg p-3 text-sm text-zinc-700 space-y-1">
                    <p className="font-medium text-blue-700">💡 How it works:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>0</strong> = Shows first on homepage</li>
                      <li><strong>1-10</strong> = Shows in top positions</li>
                      <li><strong>Higher numbers</strong> = Shows later</li>
                    </ul>
                    <p className="mt-2 text-xs text-zinc-500 italic">You can change the order anytime from the Rooms list</p>
                  </div>
                </div>
              </div>

          {/* Availability */}
          <div className="flex items-center p-4 bg-stone-50 rounded-lg border border-stone-200">
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={handleInputChange}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
            />
            <label className="ml-3 block text-sm font-medium text-zinc-900">
              Room is available for booking
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-stone-200">
            <Link
              href="/admin/rooms"
              className="px-6 py-3 border border-stone-300 text-zinc-700 font-medium rounded-lg hover:bg-stone-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || images.some(img => img.uploading)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold px-8 py-3 rounded-lg transition shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Room'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

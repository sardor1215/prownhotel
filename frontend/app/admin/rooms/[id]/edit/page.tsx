'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, ArrowUp, ArrowDown, Image as ImageIcon, Upload, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getApiUrl, getBackendUrl, getImageUrl } from '@/lib/backend-url'

interface RoomType {
  id: number
  name: string
  slug: string
}

interface Room {
  id: number
  name: string
  description: string
  price_per_night: number
  room_type_id: number
  main_image: string
  images: string[]
  max_adults: number
  max_children: number
  size_sqm: number | null
  is_available: boolean
}

interface ImageFile {
  file: File | null
  url: string
  uploading: boolean
  uploaded: boolean
  isExisting: boolean // True if this is an existing image from database
}

export default function EditRoomPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [room, setRoom] = useState<Room | null>(null)
  const [images, setImages] = useState<ImageFile[]>([{ file: null, url: '', uploading: false, uploaded: false, isExisting: false }])
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
    fetchRoom()
  }, [roomId])

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch(getApiUrl('/api/room-types'), {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setRoomTypes(data.roomTypes)
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
    }
  }

  const fetchRoom = async () => {
    try {
      // Get token from localStorage
      let token = localStorage.getItem('adminToken');
      
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Use frontend API proxy route
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        credentials: 'include',
        headers
      })
      
      const data = await response.json()
      
      if (data.success && data.room) {
        const roomData = data.room
        setRoom(roomData)
        
        // Set form data
        setFormData({
          name: roomData.name || '',
          description: roomData.description || '',
          price_per_night: roomData.price_per_night?.toString() || '',
          room_type_id: roomData.room_type_id?.toString() || '',
          max_adults: roomData.max_adults?.toString() || '2',
          max_children: roomData.max_children?.toString() || '0',
          size_sqm: roomData.size_sqm?.toString() || '',
          is_available: roomData.is_available !== false,
          display_order: roomData.display_order?.toString() || '0'
        })

        // Set images - combine main_image and images array
        const allImages: ImageFile[] = []
        if (roomData.main_image) {
          allImages.push({
            file: null,
            url: roomData.main_image,
            uploading: false,
            uploaded: true,
            isExisting: true
          })
        }
        // Handle images - can be array or JSON string
        if (roomData.images) {
          let imagesArray: string[] = []
          if (Array.isArray(roomData.images)) {
            imagesArray = roomData.images
          } else if (typeof roomData.images === 'string') {
            try {
              imagesArray = JSON.parse(roomData.images)
            } catch (e) {
              // If not JSON, treat as single string
              imagesArray = [roomData.images]
            }
          }
          
          imagesArray
            .filter((img: string) => img && img.trim() !== '')
            .forEach((img: string) => {
              allImages.push({
                file: null,
                url: img,
                uploading: false,
                uploaded: true,
                isExisting: true
              })
            })
        }
        
        console.log('📸 [Edit] Loaded images:', allImages.length, allImages.map(img => ({ url: img.url, isExisting: img.isExisting })))
        
        // Ensure at least one empty field
        if (allImages.length === 0) {
          allImages.push({ file: null, url: '', uploading: false, uploaded: false, isExisting: false })
        }
        
        setImages(allImages)
      } else {
        toast.error('Room not found')
        router.push('/admin/rooms')
      }
    } catch (error) {
      console.error('Error fetching room:', error)
      toast.error('Failed to load room')
      router.push('/admin/rooms')
    } finally {
      setLoading(false)
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
      uploaded: false,
      isExisting: false
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
      }

      const uploadResponse = await fetch(getApiUrl('/api/admin/room-uploads/single'), {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData
      })

      const uploadData = await uploadResponse.json()

      if (uploadData.success) {
        // Clean up blob URL
        if (newImages[index].url && newImages[index].url.startsWith('blob:')) {
          URL.revokeObjectURL(newImages[index].url)
        }
        
        // Update with uploaded URL
        const updatedImages = [...images]
        updatedImages[index] = {
          file: null, // Clear file after upload
          url: uploadData.url, // Server URL
          uploading: false,
          uploaded: true,
          isExisting: false
        }
        setImages(updatedImages)
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
        uploaded: false,
        isExisting: false
      }
      setImages(updatedImages)
    }
  }

  const addImageField = () => {
    setImages([...images, { file: null, url: '', uploading: false, uploaded: false, isExisting: false }])
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
    setSaving(true)

    // Filter out images that haven't been uploaded
    const validImages = images
      .map(img => img.url)
      .filter(url => url && url.trim() !== '' && !url.startsWith('blob:'))

    if (validImages.length === 0) {
      toast.error('Please upload at least one image')
      setSaving(false)
      return
    }

    // Check if any images are still uploading
    const stillUploading = images.some(img => img.uploading)
    if (stillUploading) {
      toast.error('Please wait for all images to finish uploading')
      setSaving(false)
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
      
      // Use frontend API proxy route
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'PUT',
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
        toast.success('Room updated successfully!')
        // Force a full page reload to ensure fresh data
        setTimeout(() => {
          window.location.href = '/admin/rooms'
        }, 500)
      } else {
        // Show backend error message if available
        const errorMsg = data.error || data.message || 'Failed to update room'
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Error updating room:', error)
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">Edit Room</h1>
            <p className="text-zinc-600">Update room details and images</p>
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

                  {/* Image Upload/Preview */}
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
                        {/* Image Preview - Always show container if image has URL */}
                        {image.url && image.url.trim() !== '' ? (
                          <div className="relative w-full h-48 bg-stone-200 rounded-lg overflow-hidden border border-stone-300">
                            {image.uploading ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-stone-100 z-20">
                                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                              </div>
                            ) : (
                              <>
                                <img
                                  key={`edit-img-${index}-${image.url}`}
                                  src={(() => {
                                    let srcUrl = ''
                                    if (image.url.startsWith('blob:')) {
                                      // Blob URLs are already browser-ready
                                      srcUrl = image.url
                                    } else if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
                                      // Full URLs use as-is
                                      srcUrl = image.url
                                    } else if (image.url.startsWith('/uploads/')) {
                                      // Backend uploads path - convert to full backend URL
                                      srcUrl = `${getBackendUrl()}${image.url}`
                                    } else if (image.url && image.url.trim() !== '') {
                                      // If it's just a filename or relative path, construct full backend URL
                                      if (image.url.startsWith('/')) {
                                        srcUrl = `${getBackendUrl()}${image.url}`
                                      } else {
                                        // Assume it's in uploads/rooms folder
                                        srcUrl = `${getBackendUrl()}/uploads/rooms/${image.url}`
                                      }
                                    }
                                    console.log(`🖼️ [Edit] Image ${index} src:`, srcUrl, 'Original URL:', image.url, 'isExisting:', image.isExisting)
                                    return srcUrl
                                  })()}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  style={{ display: 'block', minHeight: '192px', width: '100%' }}
                                  crossOrigin="anonymous"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    const src = target.src
                                    console.error('❌ [Edit] Image failed to load:', src, 'Original URL:', image.url)
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
                                    console.log('✅ [Edit] Image loaded successfully:', (e.target as HTMLImageElement).src)
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
                            )}
                            
                            {/* Upload Status */}
                            {image.uploading && (
                              <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded z-30">
                                Uploading...
                              </div>
                            )}
                            {image.uploaded && !image.uploading && (
                              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded z-30">
                                {image.isExisting ? 'Existing' : '✓ Uploaded'}
                              </div>
                            )}
                          </div>
                        ) : null}
                        
                        {/* Change Image Button */}
                        {image.uploaded && image.url && (
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...images]
                              // If it's an existing image, we still want to keep it as a fallback
                              // But allow replacing it
                              newImages[index] = { file: null, url: '', uploading: false, uploaded: false, isExisting: false }
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

          {/* Display Order - Improved */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-5 shadow-sm">
                <label className="block text-base font-black text-amber-900 mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 bg-amber-400 text-white rounded-full text-sm">
                    #
                  </span>
                  Homepage Display Order
                </label>
                <p className="text-sm text-amber-800 mb-4 font-medium">
                  Control where this room appears on your homepage
                </p>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="number"
                      name="display_order"
                      value={formData.display_order}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-5 py-4 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-2xl font-black text-center bg-white"
                      placeholder="0"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-semibold">
                      Position
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-amber-200 space-y-2">
                    <p className="font-bold text-amber-900 flex items-center gap-2">
                      <span className="text-lg">💡</span> Quick Guide:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-2xl font-black text-green-600">0-10</span>
                        <span className="text-green-800 font-medium">= Top rooms (shown FIRST) ⭐</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="text-2xl font-black text-yellow-600">11-50</span>
                        <span className="text-yellow-800 font-medium">= Middle section</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-2xl font-black text-gray-600">51+</span>
                        <span className="text-gray-700 font-medium">= Bottom (shown LAST)</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-amber-100 rounded-lg border border-amber-300">
                      <p className="text-xs text-amber-900 leading-relaxed">
                        <strong>💡 Pro Tip:</strong> You can easily change the order later using the arrow buttons in the Rooms list!
                      </p>
                    </div>
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
              disabled={saving || images.some(img => img.uploading)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold px-8 py-3 rounded-lg transition shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Room'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

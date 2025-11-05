'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Search, Users, Home, Bed, CheckCircle, XCircle, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, X, ZoomIn, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/formatPrice'
import { getImageUrl } from '@/lib/backend-url'

interface Room {
  id: number
  name: string
  description: string
  price_per_night: number
  room_type_name: string
  max_adults: number
  max_children: number
  is_available: boolean
  main_image?: string
  images?: string[] | string
  size_sqm?: number
  display_order?: number
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAvailable, setFilterAvailable] = useState<string>('all')
  const [updatingRooms, setUpdatingRooms] = useState<Set<number>>(new Set())
  const [fetchingRooms, setFetchingRooms] = useState(false)
  const lastFetchTime = useRef<number>(0)
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({})
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Get all images for a room
  const getRoomImages = (room: Room): string[] => {
    const images: string[] = []
    if (room.main_image) {
      images.push(room.main_image)
    }
    if (room.images) {
      const additionalImages = typeof room.images === 'string' 
        ? JSON.parse(room.images) 
        : room.images
      images.push(...additionalImages)
    }
    return images
  }

  // Navigate carousel
  const nextImage = (roomId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) + 1) % totalImages
    }))
  }

  const prevImage = (roomId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) - 1 + totalImages) % totalImages
    }))
  }

  // Open lightbox
  const openLightbox = (images: string[], startIndex: number) => {
    setLightboxImages(images)
    setLightboxIndex(startIndex)
    setLightboxOpen(true)
  }

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length)
  }

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)
  }


  useEffect(() => {
    fetchRooms()
    
    // Refresh rooms when page becomes visible (with throttling)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now()
        // Only fetch if it's been at least 2 seconds since last fetch
        if (now - lastFetchTime.current > 2000) {
          fetchRooms()
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchRooms = async () => {
    // Prevent concurrent requests
    if (fetchingRooms) {
      console.log('⏳ Already fetching rooms, skipping...')
      return
    }

    // Throttle requests - only allow one request per second
    const now = Date.now()
    if (now - lastFetchTime.current < 1000) {
      console.log('⏳ Throttling request, too soon since last fetch')
      return
    }

    try {
      setFetchingRooms(true)
      lastFetchTime.current = now
      
      // Add cache-busting timestamp to ensure fresh data
      const response = await fetch(`/api/admin/rooms?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store'
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Rooms fetched:', data.rooms.length)
        setRooms(data.rooms)
      } else {
        toast.error(data.error || 'Failed to fetch rooms')
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
      setFetchingRooms(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/rooms/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Room "${name}" deleted successfully`)
        // Refresh the rooms list
        await fetchRooms()
      } else {
        // Show backend error message if available
        const errorMsg = data.error || data.message || 'Failed to delete room'
        toast.error(errorMsg)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error('An error occurred while deleting the room')
      setLoading(false)
    }
  }

  const handleToggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      setUpdatingRooms(prev => new Set(prev).add(id))
      const response = await fetch(`/api/admin/rooms/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_available: !currentStatus
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Room ${!currentStatus ? 'enabled' : 'disabled'} successfully`)
        // Refresh the rooms list to show updated status
        await fetchRooms()
      } else {
        // Show backend error message if available
        const errorMsg = data.error || data.message || 'Failed to update room availability'
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Error updating room:', error)
      toast.error('An error occurred while updating the room')
    } finally {
      setUpdatingRooms(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleUpdateDisplayOrder = async (id: number, newOrder: number, roomName?: string) => {
    try {
      setUpdatingRooms(prev => new Set(prev).add(id))
      const response = await fetch(`/api/admin/rooms/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          display_order: newOrder
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(roomName ? `"${roomName}" position updated` : 'Position updated')
        await fetchRooms()
      } else {
        // Show helpful error if display_order column doesn't exist
        if (data.hint) {
          toast.error(
            <div>
              <div className="font-bold">{data.error}</div>
              <div className="text-xs mt-1">{data.hint}</div>
            </div>,
            { duration: 8000 }
          )
        } else {
          toast.error(data.error || 'Failed to update position')
        }
      }
    } catch (error) {
      console.error('Error updating display order:', error)
      toast.error('An error occurred')
    } finally {
      setUpdatingRooms(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleMoveOrder = (roomId: number, direction: 'up' | 'down') => {
    const roomIndex = rooms.findIndex(r => r.id === roomId)
    if (roomIndex === -1) return

    const room = rooms[roomIndex]
    const currentOrder = room.display_order || 0
    let targetIndex: number

    if (direction === 'up') {
      if (roomIndex === 0) return
      targetIndex = roomIndex - 1
    } else {
      if (roomIndex === rooms.length - 1) return
      targetIndex = roomIndex + 1
    }

    const targetOrder = rooms[targetIndex].display_order || 0
    const newOrder = direction === 'up' ? targetOrder - 1 : targetOrder + 1

    handleUpdateDisplayOrder(roomId, newOrder, room.name)
  }

  const handleMoveToPosition = (roomId: number, position: 'first' | 'last') => {
    const roomIndex = rooms.findIndex(r => r.id === roomId)
    if (roomIndex === -1) return

    const room = rooms[roomIndex]
    let newOrder: number

    if (position === 'first') {
      if (roomIndex === 0) return // Already first
      const firstRoomOrder = rooms[0].display_order || 0
      newOrder = firstRoomOrder - 1
    } else {
      if (roomIndex === rooms.length - 1) return // Already last
      const lastRoomOrder = rooms[rooms.length - 1].display_order || 0
      newOrder = lastRoomOrder + 1
    }

    handleUpdateDisplayOrder(roomId, newOrder, room.name)
  }

  // Filter rooms based on search and availability
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.room_type_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAvailability = filterAvailable === 'all' ||
                               (filterAvailable === 'available' && room.is_available) ||
                               (filterAvailable === 'unavailable' && !room.is_available)
    
    return matchesSearch && matchesAvailability
  })

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
            <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">Room Management</h1>
            <p className="text-zinc-600">Manage hotel rooms and availability</p>
          </div>
          <Link
            href="/admin/rooms/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold px-6 py-3 rounded-lg transition shadow-lg shadow-amber-900/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Room</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 rounded-lg p-2.5">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-600">Total Rooms</p>
                <p className="text-2xl font-bold text-zinc-900">{rooms.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 rounded-lg p-2.5">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-600">Available</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {rooms.filter(r => r.is_available).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 rounded-lg p-2.5">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-600">Unavailable</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {rooms.filter(r => !r.is_available).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rooms by name, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            {/* Availability Filter */}
            <select
              value={filterAvailable}
              onChange={(e) => setFilterAvailable(e.target.value)}
              className="px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            >
              <option value="all">All Status</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-lg border border-stone-200 p-12 text-center">
          <Bed className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No rooms found</h3>
          <p className="text-zinc-600 mb-6">
            {searchTerm || filterAvailable !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Get started by adding your first room'}
          </p>
          {!searchTerm && filterAvailable === 'all' && (
            <Link
              href="/admin/rooms/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Room</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition group">
              {/* Image Gallery */}
              <div className="relative h-56 bg-stone-200 overflow-hidden group/gallery">
                {(() => {
                  const roomImages = getRoomImages(room)
                  const currentIndex = currentImageIndex[room.id] || 0
                  const currentImage = roomImages[currentIndex]
                  
                  return roomImages.length > 0 ? (
                    <>
                      <img
                        src={getImageUrl(currentImage)}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => openLightbox(roomImages.map(img => getImageUrl(img)), currentIndex)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/imgtouse/1.JPG'
                        }}
                      />
                      
                      {/* Zoom overlay */}
                      <div 
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/gallery:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        onClick={() => openLightbox(roomImages.map(img => getImageUrl(img)), currentIndex)}
                      >
                        <ZoomIn className="w-10 h-10 text-white" />
                      </div>
                      
                      {/* Carousel controls */}
                      {roomImages.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              prevImage(room.id, roomImages.length)
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              nextImage(room.id, roomImages.length)
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          
                          {/* Image counter */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {currentIndex + 1} / {roomImages.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bed className="w-16 h-16 text-stone-300" />
                    </div>
                  )
                })()}
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-20">
                  {room.is_available ? (
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                      Available
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-serif font-bold text-zinc-900 mb-1">{room.name}</h3>
                      <p className="text-sm text-amber-600 font-medium">{room.room_type_name}</p>
                    </div>
                  {/* Display Order Controls - Improved UI */}
                  <div className="flex flex-col items-center gap-3 ml-4 border-l-2 border-amber-200 pl-5">
                    {/* Position Badge */}
                    <div className="text-center">
                      <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1.5">
                        Homepage Order
                      </span>
                      <div className="relative">
                        <span className="inline-block px-4 py-2 bg-gradient-to-br from-amber-400 to-amber-500 text-white rounded-lg text-lg font-black shadow-md">
                          #{rooms.findIndex(r => r.id === room.id) + 1}
                        </span>
                        <span className="block text-[10px] text-zinc-400 mt-1.5">
                          of {rooms.length} rooms
                        </span>
                      </div>
                    </div>

                    {/* Move Controls */}
                    <div className="flex flex-col gap-1.5 w-full">
                      {/* Move to First (if not already first) */}
                      {rooms.findIndex(r => r.id === room.id) > 0 && (
                        <button
                          onClick={() => handleMoveToPosition(room.id, 'first')}
                          disabled={updatingRooms.has(room.id)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 rounded-md transition disabled:opacity-30 disabled:cursor-not-allowed shadow-sm border border-green-200 hover:border-green-300"
                          title="Move to first position (show first on homepage)"
                        >
                          <ArrowUp className="w-3 h-3" />
                          <ArrowUp className="w-3 h-3 -ml-2" />
                          <span className="text-xs font-semibold">First</span>
                        </button>
                      )}

                      {/* Move Up One */}
                      <button
                        onClick={() => handleMoveOrder(room.id, 'up')}
                        disabled={rooms.findIndex(r => r.id === room.id) === 0 || updatingRooms.has(room.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-b from-stone-50 to-stone-100 hover:from-stone-100 hover:to-stone-200 text-zinc-700 rounded-md transition disabled:opacity-30 disabled:cursor-not-allowed shadow-sm border border-stone-200 hover:border-stone-300"
                        title="Move up one position"
                      >
                        <ArrowUp className="w-4 h-4" />
                        <span className="text-xs font-semibold">Move Up</span>
                      </button>

                      {/* Move Down One */}
                      <button
                        onClick={() => handleMoveOrder(room.id, 'down')}
                        disabled={rooms.findIndex(r => r.id === room.id) === rooms.length - 1 || updatingRooms.has(room.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-b from-stone-50 to-stone-100 hover:from-stone-100 hover:to-stone-200 text-zinc-700 rounded-md transition disabled:opacity-30 disabled:cursor-not-allowed shadow-sm border border-stone-200 hover:border-stone-300"
                        title="Move down one position"
                      >
                        <ArrowDown className="w-4 h-4" />
                        <span className="text-xs font-semibold">Move Down</span>
                      </button>

                      {/* Move to Last (if not already last) */}
                      {rooms.findIndex(r => r.id === room.id) < rooms.length - 1 && (
                        <button
                          onClick={() => handleMoveToPosition(room.id, 'last')}
                          disabled={updatingRooms.has(room.id)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 rounded-md transition disabled:opacity-30 disabled:cursor-not-allowed shadow-sm border border-red-200 hover:border-red-300"
                          title="Move to last position (show last on homepage)"
                        >
                          <ArrowDown className="w-3 h-3" />
                          <ArrowDown className="w-3 h-3 -ml-2" />
                          <span className="text-xs font-semibold">Last</span>
                        </button>
                      )}
                    </div>

                    {/* Helper Text */}
                    <div className="text-center px-2 py-1.5 bg-amber-50 rounded-md border border-amber-100">
                      <p className="text-[10px] text-amber-700 leading-tight">
                        {rooms.findIndex(r => r.id === room.id) === 0 ? (
                          <span className="font-semibold">✨ Shows FIRST on homepage</span>
                        ) : rooms.findIndex(r => r.id === room.id) === rooms.length - 1 ? (
                          <span className="font-semibold">Shows LAST on homepage</span>
                        ) : (
                          <span>Position {rooms.findIndex(r => r.id === room.id) + 1} on homepage</span>
                        )}
                      </p>
                    </div>
                  </div>
                  </div>
                </div>

                {room.description && (
                  <p className="text-sm text-zinc-600 mb-4 line-clamp-2">{room.description}</p>
                )}

                {/* Details */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-stone-200">
                  <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                    <Users className="w-4 h-4" />
                    <span>{room.max_adults + room.max_children}</span>
                  </div>
                  {room.size_sqm && (
                    <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                      <Home className="w-4 h-4" />
                      <span>{room.size_sqm}m²</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 ml-auto">
                    <span>{formatPrice(room.price_per_night)}</span>
                    <span className="text-zinc-500 font-normal">/night</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/rooms/${room.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-2.5 rounded-lg transition border border-amber-200"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  
                  <button
                    onClick={() => handleToggleAvailability(room.id, room.is_available)}
                    disabled={updatingRooms.has(room.id) || loading}
                    className={`flex-1 flex items-center justify-center gap-2 font-medium py-2.5 rounded-lg transition border ${
                      room.is_available
                        ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                    title={room.is_available ? 'Mark as unavailable' : 'Mark as available'}
                  >
                    {updatingRooms.has(room.id) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        {room.is_available ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        <span>{room.is_available ? 'Disable' : 'Enable'}</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(room.id, room.name)}
                    disabled={loading}
                    className="p-2.5 bg-stone-100 hover:bg-red-50 text-zinc-600 hover:text-red-700 rounded-lg transition border border-stone-200 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete room"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
          >
            <X className="w-8 h-8" />
          </button>
          
          {lightboxImages.length > 1 && (
            <>
              <button
                onClick={prevLightboxImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              
              <button
                onClick={nextLightboxImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          
          <div className="max-w-6xl max-h-[90vh] w-full">
            <img
              src={lightboxImages[lightboxIndex]}
              alt={`Image ${lightboxIndex + 1}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/imgtouse/1.JPG'
              }}
            />
            <div className="text-center text-white mt-4 text-lg font-semibold">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

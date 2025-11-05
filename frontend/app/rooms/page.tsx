'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Calendar, Star, ChevronRight, Search, Filter, Sparkles, ArrowLeft, CheckCircle, ChevronLeft, Image as ImageIcon, Phone, Mail, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/formatPrice'
import { getImageUrl, getApiUrl, getBackendUrl } from '@/lib/backend-url'
import FadeInSection from '@/components/FadeInSection'

interface Room {
  id: number
  name: string
  description: string
  price_per_night: number | string
  main_image: string
  images?: string[] | string
  max_adults: number
  max_children: number
  size_sqm: number
  room_type_name: string
  amenities: Record<string, boolean>
}

function RoomsContent() {
  const searchParams = useSearchParams()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState(searchParams.get('check_in') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('check_out') || '')
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '1'))
  const [children, setChildren] = useState(parseInt(searchParams.get('children') || '0'))
  const [showFilters, setShowFilters] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({})

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const params = new URLSearchParams()
      if (checkIn) params.append('check_in', checkIn)
      if (checkOut) params.append('check_out', checkOut)
      if (adults) params.append('adults', adults.toString())
      if (children) params.append('children', children.toString())

      const response = await fetch(getApiUrl(`/api/rooms?${params.toString()}`))
      const data = await response.json()
      
      if (data.success) {
        setRooms(data.rooms)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()

  // Get all images for a room (main_image + images array)
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


  // Navigate to next image
  const nextImage = (roomId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) + 1) % totalImages
    }))
  }

  // Navigate to previous image
  const prevImage = (roomId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) - 1 + totalImages) % totalImages
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Enhanced Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl md:text-3xl font-serif text-[#D4AF37] font-bold">
                CROWN
              </span>
              <span className="text-2xl md:text-3xl font-serif text-gray-900 font-bold">
                Salamis Hotel
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">Home</Link>
              <Link href="/rooms" className="text-[#D4AF37] font-bold">Rooms</Link>
              <Link href="/restaurant" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">Restaurant</Link>
              <a 
                href="#" 
                onClick={async (e) => {
                  e.preventDefault()
                  try {
                    const response = await fetch('/api/menu')
                    const data = await response.json()
                    if (data.success && data.menu) {
                      window.open(`${getBackendUrl()}${data.menu.url}`, '_blank')
                    } else {
                      alert('Menu not available')
                    }
                  } catch (error) {
                    console.error('Error fetching menu:', error)
                    alert('Failed to load menu')
                  }
                }}
                className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors cursor-pointer"
              >
                Menu
              </a>
              <a href="/#about" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">About Us</a>
              <a href="/#contact" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Stunning Header */}
      <div className="relative bg-black text-white py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInSection direction="up">
            <div className="flex items-center gap-2 mb-6">
              <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">
              Our Rooms
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
              Experience luxury and comfort in our elegantly designed rooms
            </p>
          </FadeInSection>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <FadeInSection direction="up" className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-xl font-bold text-gray-900">Search Available Rooms</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all duration-300 group-hover:border-[#D4AF37]/30"
              />
            </div>
            
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all duration-300 group-hover:border-[#D4AF37]/30"
              />
            </div>
            
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37]" />
                Adults
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all duration-300 group-hover:border-[#D4AF37]/30 appearance-none bg-white"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37]" />
                Children
              </label>
              <select
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all duration-300 group-hover:border-[#D4AF37]/30 appearance-none bg-white"
              >
                {[0, 1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchRooms}
                className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </FadeInSection>
      </div>

      {/* Rooms List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No rooms available</h3>
            <p className="text-gray-600 mb-6">Try different dates or contact us directly</p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Contact Us
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {rooms.map((room, index) => (
              <FadeInSection
                key={room.id}
                delay={index * 120}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  {/* Image Gallery Section */}
                  <div className="relative h-64 lg:h-auto overflow-hidden">
                    {(() => {
                      const roomImages = getRoomImages(room)
                      const currentIndex = currentImageIndex[room.id] || 0
                      const currentImage = roomImages[currentIndex] || room.main_image
                      
                      return (
                        <>
                          <img
                            src={getImageUrl(currentImage)}
                            alt={`${room.name} - Image ${currentIndex + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/imgtouse/1.JPG'
                            }}
                          />
                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {/* Image Navigation - Show only if multiple images */}
                          {roomImages.length > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  prevImage(room.id, roomImages.length)
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
                                aria-label="Previous image"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  nextImage(room.id, roomImages.length)
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
                                aria-label="Next image"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                              
                              {/* Image Counter */}
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 z-10">
                                <ImageIcon className="w-3 h-3" />
                                <span>{currentIndex + 1} / {roomImages.length}</span>
                              </div>
                              
                              {/* Dot Indicators */}
                              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                {roomImages.map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setCurrentImageIndex(prev => ({...prev, [room.id]: idx}))
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                      idx === currentIndex 
                                        ? 'bg-[#D4AF37] w-6' 
                                        : 'bg-white/50 hover:bg-white/80'
                                    }`}
                                    aria-label={`View image ${idx + 1}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                          
                          {/* Badge */}
                          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>

                          {/* Room Type Badge */}
                          <div className="absolute top-4 right-4 bg-[#D4AF37]/95 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg font-semibold text-sm">
                            {room.room_type_name}
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {/* Details Section */}
                  <div className="lg:col-span-2 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-3xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {room.name}
                          </h2>
                          <p className="text-gray-500 uppercase tracking-wide text-sm font-semibold">
                            {room.room_type_name}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-6 leading-relaxed line-clamp-2">
                        {room.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">
                          <Users className="w-4 h-4" />
                          <span>Max {room.max_adults} adults, {room.max_children} children</span>
                        </div>
                        {room.size_sqm && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">
                            <Calendar className="w-4 h-4" />
                            <span>{room.size_sqm} m²</span>
                          </div>
                        )}
                      </div>

                      {/* Amenities */}
                      {room.amenities && Object.keys(room.amenities).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {Object.entries(room.amenities).slice(0, 6).map(([key, value]) => 
                            value && (
                              <span 
                                key={key} 
                                className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-xs rounded-full font-medium border border-gray-200"
                              >
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div>
                        <div className="text-4xl font-black text-[#D4AF37]">
                          {formatPrice(room.price_per_night)}
                        </div>
                        <div className="text-sm text-gray-500">
                          per night {nights > 0 && `• ${nights} nights = ${formatPrice(parseFloat(String(room.price_per_night)) * nights)}`}
                        </div>
                      </div>
                      <Link
                        href={`/rooms/${room.id}/book?check_in=${checkIn}&check_out=${checkOut}&adults=${adults}&children=${children}`}
                        className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8941F] text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
                      >
                        <span>Book Now</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      {!loading && rooms.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-black rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" />
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Need Help Choosing?</h2>
              <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                Our team is here to help you find the perfect room for your stay
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>Contact Us</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Hotel Info */}
            <div>
              <h3 className="text-2xl font-serif text-white mb-4">CROWN SALAMIS HOTEL</h3>
              <p className="text-gray-300 mb-4">
                Crown Salamis Hotel offers one of the most special accommodation experiences in Famagusta. 
                We are delighted to host you.
              </p>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+905428613030" className="hover:text-white transition-colors">+90 542 861 3030</a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:reservation@crownsalamishotel.com" className="hover:text-white transition-colors">reservation@crownsalamishotel.com</a>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>İsmet İnönü Bulvarı, No: 290<br />Gazimağusa / Kuzey Kıbrıs</span>
                </p>
              </div>
            </div>
            
            {/* Our Rooms */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Our Rooms</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/rooms/standard" className="hover:text-[#D4AF37] transition-colors">Standard Room</Link></li>
                <li><Link href="/rooms/family" className="hover:text-[#D4AF37] transition-colors">Family Room</Link></li>
                <li><Link href="/rooms/premium" className="hover:text-[#D4AF37] transition-colors">Premium Suite</Link></li>
                <li><Link href="/rooms/superior" className="hover:text-[#D4AF37] transition-colors">Superior Room</Link></li>
              </ul>
            </div>
            
            {/* Other Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Other Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/restaurant" className="hover:text-[#D4AF37] transition-colors">Restaurant</Link></li>
                <li>
                  <a 
                    href="#" 
                    onClick={async (e) => {
                      e.preventDefault()
                      try {
                        const response = await fetch('/api/menu')
                        const data = await response.json()
                    if (data.success && data.menu) {
                      window.open(`${getBackendUrl()}${data.menu.url}`, '_blank')
                        } else {
                          alert('Menu not available')
                        }
                      } catch (error) {
                        console.error('Error fetching menu:', error)
                        alert('Failed to load menu')
                      }
                    }}
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    Menu
                  </a>
                </li>
                <li><Link href="/#about" className="hover:text-[#D4AF37] transition-colors">About Us</Link></li>
                <li><Link href="/#contact" className="hover:text-[#D4AF37] transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>Designed and Powered by Ata Bilişim</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function RoomsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    }>
      <RoomsContent />
    </Suspense>
  )
}

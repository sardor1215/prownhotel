'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Users, Mail, Phone, User, MessageSquare, ArrowLeft, Check, Shield, Sparkles, Star, ChevronLeft, ChevronRight, X, ZoomIn, Image as ImageIcon, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/formatPrice'
import { getImageUrl, getApiUrl, getBackendUrl } from '@/lib/backend-url'
import { formatDate } from '@/lib/utils'
import FadeInSection from '@/components/FadeInSection'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/i18n'

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

function BookingContent() {
  const { language } = useLanguage()
  const t = translations[language]
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const roomId = params.id as string
  const initialCheckIn = searchParams.get('check_in') || ''
  const initialCheckOut = searchParams.get('check_out') || ''
  const adults = parseInt(searchParams.get('adults') || '1')
  const children = parseInt(searchParams.get('children') || '0')

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)

  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    special_requests: ''
  })

  useEffect(() => {
    if (roomId) {
      fetchRoom()
    }
  }, [roomId])

  // Auto-update check-out when check-in changes to maintain nights or set to 1 night minimum
  useEffect(() => {
    if (checkIn) {
      const currentNights = calculateNights()
      // If check-out is invalid or before check-in, set to 1 night
      if (!checkOut || currentNights <= 0) {
        const newCheckOut = calculateCheckOut(checkIn, 1)
        setCheckOut(newCheckOut)
        // Update URL
        const params = new URLSearchParams(window.location.search)
        params.set('check_out', newCheckOut)
        params.set('check_in', checkIn)
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
      } else {
        // Maintain the same number of nights when check-in changes
        const newCheckOut = calculateCheckOut(checkIn, currentNights)
        if (newCheckOut !== checkOut) {
          setCheckOut(newCheckOut)
          // Update URL
          const params = new URLSearchParams(window.location.search)
          params.set('check_out', newCheckOut)
          params.set('check_in', checkIn)
          router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn])


  const fetchRoom = async () => {
    try {
      // Use Next.js API route instead of direct backend call
      const response = await fetch(`/api/rooms/${roomId}`)
      const data = await response.json()
      
      // Handle different response formats
      if (data.success && data.room) {
        setRoom(data.room)
      } else if (data.id) {
        // If room is at root level
        setRoom(data)
      } else {
        toast.error(t.booking.roomNotFound)
      }
    } catch (error) {
      console.error('Error fetching room:', error)
      toast.error(t.booking.failedToLoad)
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

  const calculateCheckOut = (checkInDate: string, numNights: number) => {
    if (!checkInDate || numNights <= 0) return ''
    const start = new Date(checkInDate)
    const end = new Date(start)
    end.setDate(end.getDate() + numNights)
    return end.toISOString().split('T')[0]
  }

  const nights = calculateNights()
  const totalAmount = room ? parseFloat(String(room.price_per_night)) * nights : 0

  const handleNightsChange = (newNights: number) => {
    if (newNights > 0 && checkIn) {
      const newCheckOut = calculateCheckOut(checkIn, newNights)
      setCheckOut(newCheckOut)
      // Update URL params
      const params = new URLSearchParams(window.location.search)
      params.set('check_out', newCheckOut)
      params.set('check_in', checkIn)
      router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!checkIn || !checkOut) {
      toast.error(t.booking.selectDates)
      return
    }

    if (nights <= 0) {
      toast.error('Invalid date range')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(getApiUrl('/api/reservations'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          check_in_date: checkIn,
          check_out_date: checkOut,
          adults,
          children,
          rooms: [{ room_id: parseInt(roomId) }]
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Reservation created successfully!')
        setTimeout(() => {
          router.push(`/reservations/${data.reservation.id}`)
        }, 1500)
      } else {
        toast.error(data.error || 'Failed to create reservation')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Get all images for the room
  const getRoomImages = (): string[] => {
    if (!room) return []
    const images: string[] = []
    if (room.main_image) images.push(room.main_image)
    if (room.images) {
      const additionalImages = typeof room.images === 'string' 
        ? JSON.parse(room.images) 
        : room.images
      images.push(...additionalImages)
    }
    return images
  }


  const nextImage = () => {
    const images = getRoomImages()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    const images = getRoomImages()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const openLightbox = (startIndex: number) => {
    const images = getRoomImages()
    setLightboxImages(images.map(img => getImageUrl(img)))
    setLightboxIndex(startIndex)
    setLightboxOpen(true)
  }

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length)
  }

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading room details...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Not Found</h2>
          <p className="text-gray-600 mb-6">The room you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/rooms" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Rooms</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center group">
              <Image
                src="/iconfornav.png"
                alt="Crown Salamis Hotel Logo"
                width={180}
                height={60}
                className="object-contain h-12 md:h-16 group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
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
                      toast.error('Menu not available')
                    }
                  } catch (error) {
                    console.error('Error fetching menu:', error)
                    toast.error('Failed to load menu')
                  }
                }}
                className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors cursor-pointer"
              >
                Menu
              </a>
              <Link href="/rooms" className="flex items-center space-x-2 text-gray-700 hover:text-[#D4AF37] transition font-medium">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Rooms</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeInSection direction="up" className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-semibold text-sm">{t.booking.completeReservation}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
            {t.booking.bookYourStay}
          </h1>
          <p className="text-xl text-gray-600">{t.booking.fillDetails}</p>
        </FadeInSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <FadeInSection direction="left" className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#D4AF37]" />
                    {t.booking.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    name="guest_name"
                    value={formData.guest_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all duration-300 group-hover:border-[#D4AF37]/30"
                    placeholder={t.booking.fullName}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#D4AF37]" />
                      {t.booking.emailAddressLabel}
                    </label>
                    <input
                      type="email"
                      name="guest_email"
                      value={formData.guest_email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all duration-300 group-hover:border-[#D4AF37]/30"
                      placeholder={t.booking.emailPlaceholder}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#D4AF37]" />
                      {t.booking.phoneNumberLabel}
                    </label>
                    <input
                      type="tel"
                      name="guest_phone"
                      value={formData.guest_phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all duration-300 group-hover:border-[#D4AF37]/30"
                      placeholder={t.booking.phonePlaceholder}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                    {t.booking.specialRequests}
                  </label>
                  <textarea
                    name="special_requests"
                    value={formData.special_requests}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all duration-300 group-hover:border-[#D4AF37]/30 resize-none"
                    placeholder={t.booking.specialRequestsPlaceholder}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>{t.booking.processing}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>{t.booking.confirmReservation}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </FadeInSection>

          {/* Enhanced Booking Summary */}
          <FadeInSection direction="right" className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-serif font-bold text-gray-900">{t.booking.bookingSummary}</h2>
              </div>

              {/* Room Image Gallery */}
              <div className="relative h-48 rounded-xl overflow-hidden mb-6 group/img">
                {(() => {
                  const roomImages = getRoomImages()
                  const currentImage = roomImages[currentImageIndex]
                  
                  return roomImages.length > 0 ? (
                    <>
                      <img
                        src={getImageUrl(currentImage)}
                        alt={room.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => openLightbox(currentImageIndex)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/imgtouse/1.JPG'
                        }}
                      />
                      
                      {/* Zoom overlay */}
                      <div 
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        onClick={() => openLightbox(currentImageIndex)}
                      >
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Carousel controls */}
                      {roomImages.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              prevImage()
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              nextImage()
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          
                          {/* Image counter */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {currentImageIndex + 1} / {roomImages.length}
                          </div>
                        </>
                      )}
                      
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg z-10">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null
                })()}
              </div>

              {/* Room Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{room.name}</h3>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">{room.room_type_name}</p>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-gray-700 font-semibold flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#D4AF37]" />
                      {t.booking.checkIn} <span className="text-[#D4AF37]">*</span>
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none z-10 group-focus-within:scale-110 transition-transform" />
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => {
                          const newCheckIn = e.target.value
                          setCheckIn(newCheckIn)
                          // Update URL
                          const params = new URLSearchParams(window.location.search)
                          params.set('check_in', newCheckIn)
                          if (newCheckIn && checkOut) {
                            const newNights = calculateNights()
                            if (newNights <= 0) {
                              // If check-out is before or equal to check-in, set to next day
                              const newCheckOut = calculateCheckOut(newCheckIn, 1)
                              setCheckOut(newCheckOut)
                              params.set('check_out', newCheckOut)
                            } else {
                              // Maintain nights
                              const newCheckOut = calculateCheckOut(newCheckIn, newNights)
                              setCheckOut(newCheckOut)
                              params.set('check_out', newCheckOut)
                            }
                          }
                          router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none bg-white shadow-sm hover:shadow-md hover:border-[#D4AF37]/50 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-semibold flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#D4AF37]" />
                      {t.booking.checkOut} <span className="text-[#D4AF37]">*</span>
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none z-10 group-focus-within:scale-110 transition-transform" />
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => {
                          const newCheckOut = e.target.value
                          setCheckOut(newCheckOut)
                          // Update URL
                          const params = new URLSearchParams(window.location.search)
                          params.set('check_out', newCheckOut)
                          if (checkIn) {
                            params.set('check_in', checkIn)
                          }
                          router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
                        }}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none bg-white shadow-sm hover:shadow-md hover:border-[#D4AF37]/50 transition-all duration-300"
                        required
                        disabled={!checkIn}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#D4AF37]" />
                      {t.booking.guests}
                    </span>
                    <span className="font-semibold text-gray-900">{adults} {t.booking.adults}, {children} {t.booking.children}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-4 border-t-2 border-gray-200 bg-gradient-to-r from-[#D4AF37]/5 to-transparent p-3 rounded-lg">
                    <span className="text-gray-700 font-semibold flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#D4AF37]" />
                      {language === 'tr' ? 'Gece Sayısı' : 'Number of Nights'}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleNightsChange(Math.max(1, nights - 1))}
                        disabled={nights <= 1 || !checkIn}
                        className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-all duration-300 flex items-center justify-center font-bold text-lg shadow-sm hover:shadow-md"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={nights || 1}
                        onChange={(e) => {
                          const newNights = parseInt(e.target.value) || 1
                          if (newNights >= 1 && newNights <= 365) {
                            handleNightsChange(newNights)
                          }
                        }}
                        disabled={!checkIn}
                        className="w-20 text-center font-bold text-lg text-gray-900 border-2 border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => handleNightsChange(nights + 1)}
                        disabled={!checkIn || nights >= 365}
                        className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-all duration-300 flex items-center justify-center font-bold text-lg shadow-sm hover:shadow-md"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {!checkIn && (
                    <p className="text-xs text-gray-500 italic mt-2 text-center">
                      {language === 'tr' ? 'Gece sayısını ayarlamak için önce giriş tarihini seçin' : 'Select check-in date first to adjust nights'}
                    </p>
                  )}
                </div>

                <div className="border-t-2 border-gray-200 pt-4 space-y-3 bg-gradient-to-r from-gray-50 to-transparent p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">{formatPrice(room.price_per_night)} {language === 'tr' ? 'gece' : 'per night'}</span>
                      <span className="text-gray-500 text-xs mt-1">× {nights} {nights === 1 ? (language === 'tr' ? 'gece' : 'night') : (language === 'tr' ? 'gece' : 'nights')}</span>
                    </div>
                    <span className="font-bold text-lg text-gray-900">{formatPrice(parseFloat(String(room.price_per_night)) * nights)}</span>
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900">{t.booking.total}</span>
                    <span className="font-black text-3xl text-[#D4AF37]">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantee Badge */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900 text-sm mb-1">{t.booking.freeCancellation}</p>
                  <p className="text-green-700 text-xs">{t.booking.cancelPolicy}</p>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>

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
                          toast.error('Menu not available')
                        }
                      } catch (error) {
                        console.error('Error fetching menu:', error)
                        toast.error('Failed to load menu')
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
            <p>Designed and Powered by SE Lab</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Utensils, Coffee, Home, Phone, Mail, MapPin, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { getBackendUrl } from '@/lib/backend-url'
import { getImageUrl } from '../utils/image'
import FadeInSection from '@/components/FadeInSection'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/i18n'

export default function RestaurantPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Default restaurant images (resolved using NEXT_PUBLIC_MEDIA_URL)
  const defaultRestaurantImages = [
    '/uploads/IMGM_8813_01f6fccb28.JPG',
    '/uploads/IMGM_8809_f08ed368ad.JPG',
    '/uploads/BGRK_3409_dc79c21238.JPG',
  ]

  // Restaurant images for carousel (resolved with media URL)
  const restaurantImages = defaultRestaurantImages.map(img => getImageUrl(img))

  const nextImage = () => {
    setCarouselIndex((prev) => (prev + 1) % restaurantImages.length)
  }

  const prevImage = () => {
    setCarouselIndex((prev) => (prev - 1 + restaurantImages.length) % restaurantImages.length)
  }

  // Lightbox functions
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % restaurantImages.length)
  }

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + restaurantImages.length) % restaurantImages.length)
  }

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % restaurantImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [restaurantImages.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navigation */}
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
              <Link href="/" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">{t.nav.home}</Link>
              <Link href="/rooms" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">{t.nav.rooms}</Link>
              <Link href="/restaurant" className="text-[#D4AF37] font-bold">{t.nav.restaurant}</Link>
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
                      alert(t.restaurant.footer.menuNotAvailable)
                    }
                  } catch (error) {
                    console.error('Error fetching menu:', error)
                    alert(t.restaurant.footer.failedToLoad)
                  }
                }}
                className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors cursor-pointer"
              >
                {t.nav.menu}
              </a>
              <a href="/#about" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">{t.nav.about}</a>
              <a href="/#contact" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">{t.nav.contact}</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-black text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInSection direction="up">
            <div className="flex items-center gap-2 mb-6">
              <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                <Home className="w-5 h-5" />
                <span>{t.restaurant.breadcrumb.home}</span>
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-[#D4AF37]">{t.restaurant.hero.title}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">
              {t.restaurant.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
              {t.restaurant.hero.subtitle}
            </p>
          </FadeInSection>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Text Content */}
          <FadeInSection direction="left">
            <div className="mb-6">
              <p className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider mb-2">
                {t.restaurant.main.tagline}
              </p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                {t.restaurant.main.title}
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {t.restaurant.main.description}
              </p>
            </div>

            {/* Service Hours */}
            <FadeInSection delay={120} className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-[#D4AF37]" />
                <h3 className="text-2xl font-serif font-bold text-gray-900">{t.restaurant.hours.title}</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-[#D4AF37]" />
                    <span className="font-semibold text-gray-900">{t.restaurant.hours.breakfast}</span>
                  </div>
                  <span className="text-gray-700">08:00 - 10:00</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-[#D4AF37]" />
                    <span className="font-semibold text-gray-900">{t.restaurant.hours.roomService}</span>
                  </div>
                  <span className="text-gray-700">10:00 - 23:00</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-[#D4AF37]" />
                    <span className="font-semibold text-gray-900">{t.restaurant.hours.aLaCarte}</span>
                  </div>
                  <span className="text-gray-700">08:00 - 00:00</span>
                </div>
              </div>
            </FadeInSection>

            {/* Crown Lounge Bar */}
            <FadeInSection delay={220} className="bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Coffee className="w-6 h-6" />
                <h3 className="text-2xl font-serif font-bold">{t.restaurant.bar.title}</h3>
              </div>
              <p className="text-lg leading-relaxed">
                {t.restaurant.bar.description}
              </p>
            </FadeInSection>
          </FadeInSection>

          {/* Right Column - Image Carousel */}
          <FadeInSection direction="right" className="relative">
            <div 
              className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
              onClick={() => openLightbox(carouselIndex)}
            >
              {/* Zoom Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-4">
                  <ZoomIn className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Carousel Images */}
              {restaurantImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === carouselIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${t.restaurant.lounge.title} - ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}

              {/* Overlay with text */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 to-gray-800/80 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Coffee className="w-24 h-24 mx-auto mb-4 text-[#D4AF37]" />
                  <h3 className="text-3xl font-serif font-bold mb-2">{t.restaurant.lounge.title}</h3>
                  <p className="text-gray-300">{t.restaurant.lounge.subtitle}</p>
                </div>
              </div>

              {/* Navigation Buttons */}
              {restaurantImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      prevImage()
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      nextImage()
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {restaurantImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation()
                          setCarouselIndex(index)
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === carouselIndex
                            ? 'bg-[#D4AF37] w-8'
                            : 'bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Image Counter */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm z-10">
                    {carouselIndex + 1} / {restaurantImages.length}
                  </div>
                </>
              )}
            </div>
          </FadeInSection>
        </div>

        {/* Additional Information */}
        <FadeInSection direction="up" className="mt-16 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              {t.restaurant.reserve.title}
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t.restaurant.reserve.description}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <FadeInSection delay={100} className="text-center p-6 bg-gray-50 rounded-xl">
              <Utensils className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">{t.restaurant.features.fineDining.title}</h4>
              <p className="text-gray-600 text-sm">{t.restaurant.features.fineDining.description}</p>
            </FadeInSection>
            <FadeInSection delay={200} className="text-center p-6 bg-gray-50 rounded-xl">
              <Clock className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">{t.restaurant.features.flexibleHours.title}</h4>
              <p className="text-gray-600 text-sm">{t.restaurant.features.flexibleHours.description}</p>
            </FadeInSection>
            <FadeInSection delay={300} className="text-center p-6 bg-gray-50 rounded-xl">
              <Coffee className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">{t.restaurant.features.loungeBar.title}</h4>
              <p className="text-gray-600 text-sm">{t.restaurant.features.loungeBar.description}</p>
            </FadeInSection>
          </div>
        </FadeInSection>
      </div>

      {/* Restaurant Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-[#D4AF37] transition-colors z-50"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            <img
              src={restaurantImages[lightboxIndex]}
              alt={`${t.restaurant.lounge.title} - ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {restaurantImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevLightboxImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextLightboxImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full z-10">
                  {lightboxIndex + 1} / {restaurantImages.length}
                </div>
              </>
            )}
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
              <h3 className="text-lg font-semibold text-white mb-4">{t.restaurant.footer.ourRooms}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/rooms/standard" className="hover:text-[#D4AF37] transition-colors">Standard Room</Link></li>
                <li><Link href="/rooms/family" className="hover:text-[#D4AF37] transition-colors">Family Room</Link></li>
                <li><Link href="/rooms/premium" className="hover:text-[#D4AF37] transition-colors">Premium Suite</Link></li>
                <li><Link href="/rooms/superior" className="hover:text-[#D4AF37] transition-colors">Superior Room</Link></li>
              </ul>
            </div>
            
            {/* Other Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t.restaurant.footer.otherLinks}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/restaurant" className="hover:text-[#D4AF37] transition-colors">{t.nav.restaurant}</Link></li>
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
                          alert(t.restaurant.footer.menuNotAvailable)
                        }
                      } catch (error) {
                        console.error('Error fetching menu:', error)
                        alert(t.restaurant.footer.failedToLoad)
                      }
                    }}
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    {t.nav.menu}
                  </a>
                </li>
                <li><Link href="/#about" className="hover:text-[#D4AF37] transition-colors">{t.nav.about}</Link></li>
                <li><Link href="/#contact" className="hover:text-[#D4AF37] transition-colors">{t.nav.contact}</Link></li>
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


'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Users, Phone, Mail, MapPin, Menu, X, Star, ChevronRight, ChevronLeft, Send, Bed, Home, ZoomIn } from 'lucide-react'
import { formatPrice } from '@/lib/formatPrice'
import { getImageUrl, getApiUrl, getBackendUrl } from '@/lib/backend-url'
import toast from 'react-hot-toast'
import FadeInSection from '@/components/FadeInSection'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/i18n'

interface Room {
  id: number
  name: string
  description: string
  price_per_night: number | string
  main_image: string
  room_type_name: string
  max_adults: number
  max_children: number
}

export default function HomePage() {
  const { language, setLanguage } = useLanguage()
  const t = translations[language]
  
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submittingContact, setSubmittingContact] = useState(false)
  const [experienceCarouselIndex, setExperienceCarouselIndex] = useState(0)
  const [experienceLightboxOpen, setExperienceLightboxOpen] = useState(false)
  const [experienceLightboxIndex, setExperienceLightboxIndex] = useState(0)

  // Hotel images for experience carousel
  const hotelImages = [
    '/hotel_img/BGRK3368.JPG',
    '/hotel_img/BGRK3409.JPG',
    '/hotel_img/BGRK3409 (1).JPG',
    '/hotel_img/IMGM8778.JPG',
    '/hotel_img/IMGM8809.JPG',
    '/hotel_img/IMGM8827.JPG',
  ]

  const nextExperienceImage = () => {
    setExperienceCarouselIndex((prev) => (prev + 1) % hotelImages.length)
  }

  const prevExperienceImage = () => {
    setExperienceCarouselIndex((prev) => (prev - 1 + hotelImages.length) % hotelImages.length)
  }

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setExperienceCarouselIndex((prev) => (prev + 1) % hotelImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [hotelImages.length])

  // Lightbox functions for experience carousel
  const openExperienceLightbox = (index: number) => {
    setExperienceLightboxIndex(index)
    setExperienceLightboxOpen(true)
  }

  const closeExperienceLightbox = () => {
    setExperienceLightboxOpen(false)
  }

  const nextExperienceLightboxImage = () => {
    setExperienceLightboxIndex((prev) => (prev + 1) % hotelImages.length)
  }

  const prevExperienceLightboxImage = () => {
    setExperienceLightboxIndex((prev) => (prev - 1 + hotelImages.length) % hotelImages.length)
  }

  // Smooth scroll for anchor links
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileMenuOpen(false)
    }
  }

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmittingContact(true)
    
    try {
      // Simulate sending email (you would integrate with an email service here)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Message sent successfully! We will contact you soon.')
      setContactForm({ name: '', email: '', message: '' })
    } catch (error) {
      toast.error('Failed to send message. Please try calling us instead.')
    } finally {
      setSubmittingContact(false)
    }
  }

  // Menu handler - opens PDF directly
  const handleMenuClick = async (e: React.MouseEvent) => {
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
  }

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true)
      // Use Next.js API route instead of direct backend call to avoid CORS/mixed content issues
      const apiUrl = '/api/rooms?limit=4'
      console.log('🔍 Fetching rooms from:', apiUrl)
      
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      console.log('📦 Response data:', data)
      console.log('✅ Response status:', response.status)
      console.log('📊 Data keys:', data ? Object.keys(data) : 'null/undefined')
      
      // Handle different response formats
      if (data.success && data.rooms) {
        console.log('✅ Found rooms:', data.rooms.length)
        setRooms(data.rooms || [])
      } else if (Array.isArray(data)) {
        // If response is directly an array
        console.log('✅ Response is array, rooms:', data.length)
        setRooms(data)
      } else if (data.rooms && Array.isArray(data.rooms)) {
        // If rooms is at root level
        console.log('✅ Found rooms at root:', data.rooms.length)
        setRooms(data.rooms)
      } else {
        console.warn('⚠️ Unexpected response format:', data)
        setRooms([])
      }
    } catch (error) {
      console.error('❌ Error fetching rooms:', error)
      setRooms([])
    } finally {
      setLoadingRooms(false)
    }
  }

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      adults: adults.toString(),
      children: children.toString()
    })
    window.location.href = `/rooms?${params.toString()}`
  }


  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl md:text-3xl font-serif text-[#D4AF37] font-bold">
                  CROWN
                </span>
              <span className={`text-2xl md:text-3xl font-serif font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                Salamis Hotel
              </span>
            </Link>
            
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-[#D4AF37] font-medium transition-colors`}>
                {t.nav.home}
              </Link>
              <Link href="/rooms" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-[#D4AF37] font-medium transition-colors`}>
                {t.nav.rooms}
              </Link>
              <Link href="/restaurant" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-[#D4AF37] font-medium transition-colors`}>
                {t.nav.restaurant}
              </Link>
              <a 
                href="#" 
                onClick={handleMenuClick}
                className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-[#D4AF37] font-medium transition-colors cursor-pointer`}
              >
                {t.nav.menu}
              </a>
              <a href="#about" onClick={(e) => handleAnchorClick(e, 'about')} className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-[#D4AF37] font-medium transition-colors cursor-pointer`}>
                {t.nav.about}
              </a>
              <a href="#contact" onClick={(e) => handleAnchorClick(e, 'contact')} className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-[#D4AF37] font-medium transition-colors cursor-pointer`}>
                {t.nav.contact}
              </a>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`${scrolled ? 'text-gray-700' : 'text-white'} font-medium hover:text-[#D4AF37] transition-colors ${
                    language === 'en' ? 'font-bold' : ''
                  }`}
                >
                  English
                </button>
                <span className={scrolled ? 'text-gray-400' : 'text-white'}>|</span>
                <button
                  onClick={() => setLanguage('tr')}
                  className={`${scrolled ? 'text-gray-700' : 'text-white'} font-medium hover:text-[#D4AF37] transition-colors ${
                    language === 'tr' ? 'font-bold' : ''
                  }`}
                >
                  Turkish
                </button>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden ${scrolled ? 'text-gray-700' : 'text-white'}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 space-y-3 bg-white rounded-b-lg shadow-lg">
              <Link href="/" className="block text-gray-700 hover:text-[#D4AF37] py-2 px-4 hover:bg-gray-50 transition-colors">{t.nav.home}</Link>
              <Link href="/rooms" className="block text-gray-700 hover:text-[#D4AF37] py-2 px-4 hover:bg-gray-50 transition-colors">{t.nav.rooms}</Link>
              <Link href="/restaurant" className="block text-gray-700 hover:text-[#D4AF37] py-2 px-4 hover:bg-gray-50 transition-colors">{t.nav.restaurant}</Link>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  handleMenuClick(e)
                  setMobileMenuOpen(false)
                }}
                className="block text-gray-700 hover:text-[#D4AF37] py-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {t.nav.menu}
              </a>
              <a href="#about" onClick={(e) => handleAnchorClick(e, 'about')} className="block text-gray-700 hover:text-[#D4AF37] py-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer">{t.nav.about}</a>
              <a href="#contact" onClick={(e) => handleAnchorClick(e, 'contact')} className="block text-gray-700 hover:text-[#D4AF37] py-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer">{t.nav.contact}</a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
              <Image
            src="/hotel_img/IMGM8827.JPG"
            alt="Crown Salamis Hotel"
                fill
                className="object-cover"
            priority
              />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* Booking Widget Overlay */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-6 md:p-8">
            <FadeInSection direction="up" className="text-center mb-6">
              <h1 className="text-3xl md:text-5xl font-serif text-gray-900 mb-2">
                Living your experience
              </h1>
              {/* <h2 className="text-2xl md:text-4xl font-serif text-[#D4AF37] mb-2">
                Five Star Experience
              </h2> */}
              <p className="text-sm text-gray-600 mt-2">
                Required fields are followed by *
              </p>
            </FadeInSection>
            
            <form onSubmit={handleReservation} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.hero.checkIn} <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.hero.checkOut} <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.hero.adults}
                </label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.hero.children}
                </label>
                <select
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                >
                  {Array.from({ length: 11 }, (_, i) => i).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-4">
                <button
                  type="submit"
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {t.hero.checkAvailability}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <FadeInSection direction="up" className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-16 h-1 bg-[#D4AF37] mr-4"></div>
              <Star className="w-6 h-6 text-[#D4AF37]" />
              <div className="w-16 h-1 bg-[#D4AF37] ml-4"></div>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif text-gray-900 mb-2">
              Crown Salamis
            </h2>
            <h3 className="text-4xl md:text-6xl font-serif text-[#D4AF37] mb-8">
              Hotel
            </h3>
          </FadeInSection>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left Column - Text Content */}
            <FadeInSection direction="left" className="space-y-6">
              <div className="space-y-4">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  {t.about.description1}
                </p>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  {t.about.description2}
                </p>
              </div>
              
              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <MapPin className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t.about.features.location.title}</h4>
                    <p className="text-sm text-gray-600">{t.about.features.location.description}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Star className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t.about.features.beaches.title}</h4>
                    <p className="text-sm text-gray-600">{t.about.features.beaches.description}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Users className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t.about.features.team.title}</h4>
                    <p className="text-sm text-gray-600">{t.about.features.team.description}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Bed className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t.about.features.luxury.title}</h4>
                    <p className="text-sm text-gray-600">{t.about.features.luxury.description}</p>
                  </div>
                </div>
              </div>

              <Link 
                href="/rooms"
                className="inline-block mt-8 bg-[#D4AF37] hover:bg-[#B8941F] text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {t.about.learnMore}
              </Link>
            </FadeInSection>

            {/* Right Column - Visual Element with Carousel */}
            <FadeInSection direction="right" className="relative">
              <div 
                className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
                onClick={() => openExperienceLightbox(experienceCarouselIndex)}
              >
                {/* Carousel Images */}
                {hotelImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === experienceCarouselIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${t.about.experience.title} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}

                {/* Zoom Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full p-4">
                    <ZoomIn className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Overlay with text */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-gray-900/80 flex items-center justify-center p-8">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto bg-[#D4AF37]/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-[#D4AF37]/50">
                      <Star className="w-12 h-12 text-[#D4AF37]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl md:text-4xl font-serif text-white mb-2">
                        {t.about.experience.title}
                      </h3>
                      <p className="text-gray-200 text-lg">
                        {t.about.experience.subtitle}
                      </p>
                    </div>
                    <div className="flex justify-center space-x-4 pt-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[#D4AF37]">5★</div>
                        <div className="text-sm text-gray-300 mt-1">{t.about.experience.starService}</div>
                      </div>
                      <div className="w-px bg-gray-400"></div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[#D4AF37]">24/7</div>
                        <div className="text-sm text-gray-300 mt-1">{t.about.experience.support}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                {hotelImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        prevExperienceImage()
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        nextExperienceImage()
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {hotelImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation()
                            setExperienceCarouselIndex(index)
                          }}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === experienceCarouselIndex
                              ? 'bg-[#D4AF37] w-8'
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>

                    {/* Image Counter */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm z-10">
                      {experienceCarouselIndex + 1} / {hotelImages.length}
                    </div>
                  </>
                )}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Experience Lightbox Modal */}
      {experienceLightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
          onClick={closeExperienceLightbox}
        >
          <button
            onClick={closeExperienceLightbox}
            className="absolute top-4 right-4 text-white hover:text-[#D4AF37] transition-colors z-50"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            <img
              src={hotelImages[experienceLightboxIndex]}
              alt={`${t.about.experience.title} - ${experienceLightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {hotelImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevExperienceLightboxImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextExperienceLightboxImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full z-10">
                  {experienceLightboxIndex + 1} / {hotelImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Rooms Section - Black Background */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <FadeInSection direction="left" className="mb-6 md:mb-0">
              <p className="text-sm text-gray-400 mb-2">{t.rooms.feelComfort}</p>
              <h2 className="text-4xl md:text-6xl font-serif text-white mb-4">
                {t.rooms.title}
              </h2>
              <p className="text-gray-400 max-w-2xl">
                {t.rooms.description}
              </p>
            </FadeInSection>
            <FadeInSection direction="right">
              <Link 
                href="/rooms"
                className="border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-black transition-all duration-300"
              >
                {t.rooms.viewAll}
              </Link>
            </FadeInSection>
          </div>

          {loadingRooms ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">{t.rooms.noRooms}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rooms.map((room, index) => (
                <FadeInSection key={room.id} delay={index * 80}>
                  <Link href={`/rooms/${room.id}/book`} className="group block">
                    <div className="bg-gray-900 rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <div className="relative h-64">
                        <img
                          src={getImageUrl(room.main_image)}
                          alt={`${room.name} - ${room.room_type_name} at Crown Salamis Hotel`}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/imgtouse/1.JPG' // Fallback image
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-serif text-white mb-2">{room.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">
                          / {room.max_adults} {t.rooms.adults} {room.max_children > 0 ? `${room.max_children} ${t.rooms.children}` : ''}
                          {room.room_type_name && ` • ${room.room_type_name}`}
                        </p>
                        <p className="text-[#D4AF37] text-xl font-bold">
                          {formatPrice(room.price_per_night)} {t.rooms.pricePerNight}
                        </p>
                      </div>
                    </div>
                  </Link>
                </FadeInSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection direction="up" className="text-center mb-12">
            <p className="text-sm text-gray-600 mb-2">{t.services.subtitle}</p>
            <h2 className="text-4xl md:text-6xl font-serif text-gray-900 mb-4">
              {t.services.title}
            </h2>
          </FadeInSection>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {/* Room Service */}
            <FadeInSection delay={100} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bed className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.services.roomService.title}</h3>
              <p className="text-gray-600 text-sm">{t.services.roomService.description}</p>
            </FadeInSection>

            {/* Breakfast */}
            <FadeInSection delay={200} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.services.breakfast.title}</h3>
              <p className="text-gray-600 text-sm">{t.services.breakfast.description}</p>
            </FadeInSection>

            {/* Parking */}
            <FadeInSection delay={300} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.services.parking.title}</h3>
              <p className="text-gray-600 text-sm">{t.services.parking.description}</p>
            </FadeInSection>

            {/* High-Speed Internet */}
            <FadeInSection delay={400} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.services.wifi.title}</h3>
              <p className="text-gray-600 text-sm">{t.services.wifi.description}</p>
            </FadeInSection>

            {/* Transfer Service */}
            <FadeInSection delay={500} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChevronRight className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.services.transfer.title}</h3>
              <p className="text-gray-600 text-sm">{t.services.transfer.description}</p>
            </FadeInSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* The Food */}
            <FadeInSection direction="up" className="relative h-96 rounded-lg overflow-hidden group">
              <Image
                src="/hotel_img/IMGM8809.JPG"
                alt="The Food"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-2">the</p>
                  <h3 className="text-7xl md:text-9xl font-bold text-orange-500">food</h3>
                  <p className="text-white mt-4 text-lg">The Food By  an amazing Restaurant</p>
                </div>
              </div>
            </FadeInSection>

            {/* Rest well / Sleep well */}
            <FadeInSection direction="up" delay={150} className="relative h-96 rounded-lg overflow-hidden group">
                <Image
                src="/hotel_img/IMGM8778.JPG"
                alt="Rest well Sleep well"
                  fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 max-w-md">
                  <h3 className="text-4xl font-serif text-gray-900 mb-2">Rest well</h3>
                  <h3 className="text-5xl font-serif text-gray-900 mb-4">Sleep well</h3>
                  <p className="text-gray-600 mb-6">Make room for some adventure.</p>
                  <Link 
                    href="/rooms"
                    className="inline-block border-2 border-gray-900 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection direction="up" className="text-center mb-12">
            <p className="text-sm text-gray-600 mb-2">Make your stay memorable</p>
            <h2 className="text-4xl md:text-6xl font-serif text-gray-900 mb-4">
              {t.contact.haveQuestions}
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <FadeInSection direction="left" className="space-y-8">
              <div>
                <h3 className="text-2xl font-serif text-gray-900 mb-4">Talk</h3>
                <div className="space-y-2">
                  <a href="tel:+905428613030" className="block text-gray-700 hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    +90 542 861 3030
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-serif text-gray-900 mb-4">Meet</h3>
                <p className="text-gray-700 flex items-start gap-2">
                  <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                  <span>İsmet İnönü Bulvarı, No: 290<br />Gazimağusa / Kuzey Kıbrıs<br />(Famagusta / Northern Cyprus)</span>
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-serif text-gray-900 mb-4">Connect</h3>
                <a href="mailto:reservation@crownsalamishotel.com" className="text-gray-700 hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  reservation@crownsalamishotel.com
                </a>
              </div>
            </FadeInSection>

            {/* Contact Form */}
            <FadeInSection direction="right">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder={t.contact.name}
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder={t.contact.email}
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    placeholder={t.contact.message}
                    rows={6}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent resize-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingContact}
                  className="bg-[#D4AF37] hover:bg-[#B8941F] text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingContact ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>{t.contact.sending}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{t.contact.send}</span>
                    </>
                  )}
                </button>
              </form>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Hotel Info */}
            <div>
              <h3 className="text-2xl font-serif text-white mb-4">{t.footer.hotelName}</h3>
              <p className="text-gray-300 mb-4">
                {t.footer.description}
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
              <h3 className="text-lg font-semibold text-white mb-4">{t.footer.ourRooms}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/rooms/standard" className="hover:text-[#D4AF37] transition-colors">Standard Room</Link></li>
                <li><Link href="/rooms/family" className="hover:text-[#D4AF37] transition-colors">Family Room</Link></li>
                <li><Link href="/rooms/premium" className="hover:text-[#D4AF37] transition-colors">Premium Suite</Link></li>
                <li><Link href="/rooms/superior" className="hover:text-[#D4AF37] transition-colors">Superior Room</Link></li>
              </ul>
            </div>
            
            {/* Other Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t.footer.otherLinks}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#about" className="hover:text-[#D4AF37] transition-colors">{t.nav.about}</Link></li>
                <li><Link href="#contact" className="hover:text-[#D4AF37] transition-colors">{t.footer.opportunities}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>{t.footer.designedBy}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

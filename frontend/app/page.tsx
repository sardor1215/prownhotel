'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Users, Phone, Mail, MapPin, Menu, X, Star, ChevronRight, ChevronLeft, Send, Bed, Home, ZoomIn, Utensils, FileText, Info, Search, Car, Wifi, Coffee, Bike, Ship, Baby, Plane, Luggage, Moon, Shirt, Wind, Layout, Bell, GlassWater, Tv, Droplet, Waves, Building2, Ban, Cigarette, Globe, Dumbbell, Sparkles } from 'lucide-react'
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
  
  // Set default dates: today for check-in, tomorrow for check-out (1 night)
  const getToday = () => new Date().toISOString().split('T')[0]
  const getTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const [checkIn, setCheckIn] = useState(getToday())
  const [checkOut, setCheckOut] = useState(getTomorrow())
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
  const [videoLoaded, setVideoLoaded] = useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [gymCarouselIndex, setGymCarouselIndex] = useState(0)
  const [spaCarouselIndex, setSpaCarouselIndex] = useState(0)
  const [expandedFacility, setExpandedFacility] = useState<'gym' | 'spa' | null>(null)
  const [gymLightboxOpen, setGymLightboxOpen] = useState(false)
  const [gymLightboxIndex, setGymLightboxIndex] = useState(0)
  const [spaLightboxOpen, setSpaLightboxOpen] = useState(false)
  const [spaLightboxIndex, setSpaLightboxIndex] = useState(0)

  // CMS-driven images (loaded from content management system)
  const [hotelImages, setHotelImages] = useState<string[]>([])
  const [gymImages, setGymImages] = useState<string[]>([])
  const [spaImages, setSpaImages] = useState<string[]>([])

  // Helper function to get initial video URL using NEXT_PUBLIC_MEDIA_URL if available
  const getInitialVideoUrl = (): string => {
    const defaultPath = '/uploads/main_page_video_9db938646a.MP4'
    const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
    
    if (mediaUrl) {
      const baseUrl = mediaUrl.replace(/\/$/, '')
      const cleanPath = defaultPath.replace(/^\/+/, '')
      return `${baseUrl}/${cleanPath}`
    }
    
    return defaultPath
  }

  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string>(getInitialVideoUrl())

  // Helper function to resolve media URLs from CMS
  // Uses NEXT_PUBLIC_MEDIA_URL from .env for videos and images (except rooms)
  const resolveMediaUrl = React.useCallback((url: string | null | undefined): string | null => {
    if (!url) return null
    
    // If it's already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // Exclude rooms - rooms should use their own logic
    // If the URL contains /uploads/rooms/, use backend URL (rooms logic)
    if (url.includes('/uploads/rooms/') || url.includes('uploads/rooms/')) {
      if (url.startsWith('/uploads/')) {
        return `${getBackendUrl()}${url}`
      }
      if (!url.startsWith('/')) {
        return `${getBackendUrl()}/uploads/rooms/${url}`
      }
      return `${getBackendUrl()}${url}`
    }
    
    // Check if NEXT_PUBLIC_MEDIA_URL is set in environment
    const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
    
    if (mediaUrl) {
      // Remove trailing slash from media URL
      const baseUrl = mediaUrl.replace(/\/$/, '')
      
      // Remove leading slash from path
      const cleanPath = url.replace(/^\/+/, '')
      
      // Construct full URL
      return `${baseUrl}/${cleanPath}`
    }
    
    // Fallback to original behavior if NEXT_PUBLIC_MEDIA_URL is not set
    // If it starts with /uploads/, prepend backend URL
    if (url.startsWith('/uploads/')) {
      return `${getBackendUrl()}${url}`
    }
    
    // If it doesn't start with /, assume it's relative to uploads
    if (!url.startsWith('/')) {
      return `${getBackendUrl()}/uploads/${url}`
    }
    
    // For public paths, return as is
    return url
  }, [])

  const nextExperienceImage = () => {
    if (hotelImages.length === 0) return
    setExperienceCarouselIndex((prev) => (prev + 1) % hotelImages.length)
  }

  const prevExperienceImage = () => {
    if (hotelImages.length === 0) return
    setExperienceCarouselIndex((prev) => (prev - 1 + hotelImages.length) % hotelImages.length)
  }

  // Auto-play carousel
  useEffect(() => {
    if (hotelImages.length === 0) return
    const interval = setInterval(() => {
      setExperienceCarouselIndex((prev) => (prev + 1) % hotelImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [hotelImages.length])

  // Auto-play carousel for gym images
  useEffect(() => {
    if (gymImages.length === 0) return
    const interval = setInterval(() => {
      setGymCarouselIndex((prev) => (prev + 1) % gymImages.length)
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [gymImages.length])

  // Auto-play carousel for spa images
  useEffect(() => {
    if (spaImages.length === 0) return
    const interval = setInterval(() => {
      setSpaCarouselIndex((prev) => (prev + 1) % spaImages.length)
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [spaImages.length])

  // Lightbox functions for experience carousel
  const openExperienceLightbox = (index: number) => {
    setExperienceLightboxIndex(index)
    setExperienceLightboxOpen(true)
  }

  const closeExperienceLightbox = () => {
    setExperienceLightboxOpen(false)
  }

  const nextExperienceLightboxImage = () => {
    if (hotelImages.length === 0) return
    setExperienceLightboxIndex((prev) => (prev + 1) % hotelImages.length)
  }

  const prevExperienceLightboxImage = () => {
    if (hotelImages.length === 0) return
    setExperienceLightboxIndex((prev) => (prev - 1 + hotelImages.length) % hotelImages.length)
  }

  // Lightbox functions for gym images
  const openGymLightbox = React.useCallback((index: number) => {
    setGymLightboxIndex(index)
    setGymLightboxOpen(true)
  }, [])

  const closeGymLightbox = React.useCallback(() => {
    setGymLightboxOpen(false)
  }, [])

  const nextGymLightboxImage = React.useCallback(() => {
    setGymLightboxIndex((prev) => (prev + 1) % gymImages.length)
  }, [gymImages.length])

  const prevGymLightboxImage = React.useCallback(() => {
    setGymLightboxIndex((prev) => (prev - 1 + gymImages.length) % gymImages.length)
  }, [gymImages.length])

  // Lightbox functions for spa images
  const openSpaLightbox = React.useCallback((index: number) => {
    setSpaLightboxIndex(index)
    setSpaLightboxOpen(true)
  }, [])

  const closeSpaLightbox = React.useCallback(() => {
    setSpaLightboxOpen(false)
  }, [])

  const nextSpaLightboxImage = React.useCallback(() => {
    setSpaLightboxIndex((prev) => (prev + 1) % spaImages.length)
  }, [spaImages.length])

  const prevSpaLightboxImage = React.useCallback(() => {
    setSpaLightboxIndex((prev) => (prev - 1 + spaImages.length) % spaImages.length)
  }, [spaImages.length])

  // Keyboard navigation for lightboxes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gymLightboxOpen) {
        if (e.key === 'Escape') {
          closeGymLightbox()
        } else if (e.key === 'ArrowLeft') {
          prevGymLightboxImage()
        } else if (e.key === 'ArrowRight') {
          nextGymLightboxImage()
        }
      }
      if (spaLightboxOpen) {
        if (e.key === 'Escape') {
          closeSpaLightbox()
        } else if (e.key === 'ArrowLeft') {
          prevSpaLightboxImage()
        } else if (e.key === 'ArrowRight') {
          nextSpaLightboxImage()
        }
      }
    }

    if (gymLightboxOpen || spaLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [gymLightboxOpen, spaLightboxOpen, closeGymLightbox, closeSpaLightbox, prevGymLightboxImage, nextGymLightboxImage, prevSpaLightboxImage, nextSpaLightboxImage])

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
        const menuUrl = data.menu.type === 'link'
          ? data.menu.url
          : `${getBackendUrl()}${data.menu.url}`

        // Ensure URL is valid before opening
        try {
          const finalUrl = new URL(menuUrl, window.location.origin).toString()
          window.open(finalUrl, '_blank')
        } catch {
          toast.error('Invalid menu URL')
        }
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

  // Load video when component mounts or video URL changes
  useEffect(() => {
    if (videoRef.current) {
      // Reload video when URL changes
      videoRef.current.load()
      setVideoLoaded(true)
    }
  }, [backgroundVideoUrl])

  // Auto-update check-out when check-in changes to ensure it's at least 1 night
  useEffect(() => {
    if (checkIn) {
      const checkInDate = new Date(checkIn)
      const checkOutDate = checkOut ? new Date(checkOut) : null
      
      // If check-out is before or equal to check-in, set it to next day
      if (!checkOutDate || checkOutDate <= checkInDate) {
        const nextDay = new Date(checkInDate)
        nextDay.setDate(nextDay.getDate() + 1)
        const nextDayStr = nextDay.toISOString().split('T')[0]
        if (nextDayStr !== checkOut) {
          setCheckOut(nextDayStr)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn]) // Only depend on checkIn to avoid loops

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true)
      // Use Next.js API route instead of direct backend call to avoid CORS/mixed content issues
      // NOTE: Rooms are NOT managed by CMS - they use the rooms API
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

  // Fetch background video from CMS
  const fetchBackgroundVideo = React.useCallback(async () => {
    try {
      const response = await fetch('/api/content/home/hero')
      const data = await response.json()
      if (data.success && data.content) {
        const videoContent = data.content.find((item: any) => item.key === 'background_video' && item.type === 'video')
        if (videoContent) {
          const videoUrl = videoContent.image_url 
            ? resolveMediaUrl(videoContent.image_url)
            : videoContent.content 
            ? resolveMediaUrl(videoContent.content)
            : null
          if (videoUrl) {
            setBackgroundVideoUrl(videoUrl)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching background video:', error)
      // Keep default video if fetch fails
    }
  }, [resolveMediaUrl])

  // Default hotel images (used if CMS doesn't provide images)
  const defaultHotelImages = [
    '/uploads/IMGM_8778_79604f0f92.JPG',
    '/uploads/BGRK_3409_4f9061db39.JPG',
    '/uploads/IMGM_8827_291acf5436.JPG',
    '/uploads/IMGM_8809_ff83595150.JPG',
    '/uploads/BGRK_3368_d4949620de.JPG'
  ]

  // Fetch experience images from CMS (home/about section)
  const fetchExperienceImages = React.useCallback(async () => {
    try {
      const response = await fetch('/api/content/home/about')
      const data = await response.json()
      if (data.success && data.content) {
        const imageItems = data.content.filter((item: any) => item.type === 'image' && item.is_active)
        
        // Sort by display_order
        imageItems.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        
        const images: string[] = []
        imageItems.forEach((item: any) => {
          // Handle images array
          if (item.images && Array.isArray(item.images)) {
            item.images.forEach((img: string) => {
              const resolvedUrl = resolveMediaUrl(img)
              if (resolvedUrl) images.push(resolvedUrl)
            })
          }
          // Handle single image_url
          if (item.image_url) {
            const resolvedUrl = resolveMediaUrl(item.image_url)
            if (resolvedUrl) images.push(resolvedUrl)
          }
        })
        
        // Use CMS images if available, otherwise use default images
        if (images.length > 0) {
          setHotelImages(images)
        } else {
          // Use default hotel images with media URL resolution
          const resolvedDefaultImages = defaultHotelImages
            .map(img => resolveMediaUrl(img))
            .filter((url): url is string => url !== null)
          setHotelImages(resolvedDefaultImages)
        }
      } else {
        // If API fails or returns no data, use default images
        const resolvedDefaultImages = defaultHotelImages
          .map(img => resolveMediaUrl(img))
          .filter((url): url is string => url !== null)
        setHotelImages(resolvedDefaultImages)
      }
    } catch (error) {
      console.error('Error fetching experience images:', error)
      // On error, use default images
      const resolvedDefaultImages = defaultHotelImages
        .map(img => resolveMediaUrl(img))
        .filter((url): url is string => url !== null)
      setHotelImages(resolvedDefaultImages)
    }
  }, [resolveMediaUrl])

  // Default gym images (used if CMS doesn't provide images)
  const defaultGymImages = [
    '/uploads/gym_1_96f12e90e7.jpg',
    '/uploads/gym_2_71273151d9.jpg',
    '/uploads/gym_3_ee89e9cacf.jpg',
    '/uploads/gym_4_8cdecd8170.jpg'
  ]

  // Fetch gym images from CMS (facilities/gym section)
  const fetchGymImages = React.useCallback(async () => {
    try {
      const response = await fetch('/api/content/facilities/gym')
      const data = await response.json()
      if (data.success && data.content) {
        const imageItems = data.content.filter((item: any) => item.type === 'image' && item.is_active)
        
        // Sort by display_order
        imageItems.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        
        const images: string[] = []
        imageItems.forEach((item: any) => {
          // Handle images array
          if (item.images && Array.isArray(item.images)) {
            item.images.forEach((img: string) => {
              const resolvedUrl = resolveMediaUrl(img)
              if (resolvedUrl) images.push(resolvedUrl)
            })
          }
          // Handle single image_url
          if (item.image_url) {
            const resolvedUrl = resolveMediaUrl(item.image_url)
            if (resolvedUrl) images.push(resolvedUrl)
          }
        })
        
        // Use CMS images if available, otherwise use default images
        if (images.length > 0) {
          setGymImages(images)
        } else {
          // Use default gym images with media URL resolution
          const resolvedDefaultImages = defaultGymImages
            .map(img => resolveMediaUrl(img))
            .filter((url): url is string => url !== null)
          setGymImages(resolvedDefaultImages)
        }
      } else {
        // If API fails or returns no data, use default images
        const resolvedDefaultImages = defaultGymImages
          .map(img => resolveMediaUrl(img))
          .filter((url): url is string => url !== null)
        setGymImages(resolvedDefaultImages)
      }
    } catch (error) {
      console.error('Error fetching gym images:', error)
      // On error, use default images
      const resolvedDefaultImages = defaultGymImages
        .map(img => resolveMediaUrl(img))
        .filter((url): url is string => url !== null)
      setGymImages(resolvedDefaultImages)
    }
  }, [resolveMediaUrl])

  // Default spa images (used if CMS doesn't provide images)
  const defaultSpaImages = [
    '/uploads/spa_1_00a1b0290f.jpg',
    '/uploads/spa_2_6e4153542a.jpg',
    '/uploads/spa_3_f1ec0e55a9.jpg',
    '/uploads/spa_4_57380f8288.jpg'
  ]

  // Fetch spa images from CMS (facilities/spa section)
  const fetchSpaImages = React.useCallback(async () => {
    try {
      const response = await fetch('/api/content/facilities/spa')
      const data = await response.json()
      if (data.success && data.content) {
        const imageItems = data.content.filter((item: any) => item.type === 'image' && item.is_active)
        
        // Sort by display_order
        imageItems.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        
        const images: string[] = []
        imageItems.forEach((item: any) => {
          // Handle images array
          if (item.images && Array.isArray(item.images)) {
            item.images.forEach((img: string) => {
              const resolvedUrl = resolveMediaUrl(img)
              if (resolvedUrl) images.push(resolvedUrl)
            })
          }
          // Handle single image_url
          if (item.image_url) {
            const resolvedUrl = resolveMediaUrl(item.image_url)
            if (resolvedUrl) images.push(resolvedUrl)
          }
        })
        
        // Use CMS images if available, otherwise use default images
        if (images.length > 0) {
          setSpaImages(images)
        } else {
          // Use default spa images with media URL resolution
          const resolvedDefaultImages = defaultSpaImages
            .map(img => resolveMediaUrl(img))
            .filter((url): url is string => url !== null)
          setSpaImages(resolvedDefaultImages)
        }
      } else {
        // If API fails or returns no data, use default images
        const resolvedDefaultImages = defaultSpaImages
          .map(img => resolveMediaUrl(img))
          .filter((url): url is string => url !== null)
        setSpaImages(resolvedDefaultImages)
      }
    } catch (error) {
      console.error('Error fetching spa images:', error)
      // On error, use default images
      const resolvedDefaultImages = defaultSpaImages
        .map(img => resolveMediaUrl(img))
        .filter((url): url is string => url !== null)
      setSpaImages(resolvedDefaultImages)
    }
  }, [resolveMediaUrl])

  // Fetch all CMS content on component mount
  useEffect(() => {
    fetchRooms()
    fetchBackgroundVideo()
    fetchExperienceImages()
    fetchGymImages()
    fetchSpaImages()
  }, [fetchBackgroundVideo, fetchExperienceImages, fetchGymImages, fetchSpaImages])

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
      {/* Navigation - Premium Design */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled 
          ? 'bg-white/95 shadow-2xl border-b border-gray-100' 
          : 'bg-gradient-to-b from-black/50 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <Link href="/" className="flex items-center group">
              <Image
                src="/iconfornav.png"
                alt="Crown Salamis Hotel Logo"
                width={180}
                height={60}
                className="object-contain h-12 md:h-16 group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                priority
              />
            </Link>
            
            <div className="hidden lg:flex items-center space-x-2">
              <Link href="/rooms" className={`${scrolled ? 'text-gray-700' : 'text-white drop-shadow-md'} hover:text-[#D4AF37] font-medium transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 backdrop-blur-sm group`}>
                <Bed className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:tracking-wider transition-all">{t.nav.rooms}</span>
              </Link>
              <Link href="/restaurant" className={`${scrolled ? 'text-gray-700' : 'text-white drop-shadow-md'} hover:text-[#D4AF37] font-medium transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 backdrop-blur-sm group`}>
                <Utensils className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:tracking-wider transition-all">{t.nav.restaurant}</span>
              </Link>
              <a 
                href="#facilities" 
                onClick={(e) => handleAnchorClick(e, 'facilities')}
                className={`${scrolled ? 'text-gray-700' : 'text-white drop-shadow-md'} hover:text-[#D4AF37] font-medium transition-all duration-300 cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 backdrop-blur-sm group`}
              >
                <Dumbbell className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:tracking-wider transition-all">{t.nav.facilities}</span>
              </a>
              <a 
                href="#" 
                onClick={handleMenuClick}
                className={`${scrolled ? 'text-gray-700' : 'text-white drop-shadow-md'} hover:text-[#D4AF37] font-medium transition-all duration-300 cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 backdrop-blur-sm group`}
              >
                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:tracking-wider transition-all">{t.nav.menu}</span>
              </a>
              <a href="#about" onClick={(e) => handleAnchorClick(e, 'about')} className={`${scrolled ? 'text-gray-700' : 'text-white drop-shadow-md'} hover:text-[#D4AF37] font-medium transition-all duration-300 cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 backdrop-blur-sm group`}>
                <Info className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:tracking-wider transition-all">{t.nav.about}</span>
              </a>
              <a href="#contact" onClick={(e) => handleAnchorClick(e, 'contact')} className={`${scrolled ? 'text-gray-700' : 'text-white drop-shadow-md'} hover:text-[#D4AF37] font-medium transition-all duration-300 cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 backdrop-blur-sm group`}>
                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:tracking-wider transition-all">{t.nav.contact}</span>
              </a>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setLanguage('en')}
                  className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                    language === 'en' 
                      ? 'bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/20 ring-2 ring-[#D4AF37] shadow-lg' 
                      : scrolled 
                        ? 'hover:bg-gray-100 hover:shadow-md' 
                        : 'hover:bg-white/20 backdrop-blur-sm'
                  }`}
                  title="English"
                  aria-label="Switch to English"
                >
                  <img 
                    src="/lang/united-kingdom.png" 
                    alt="English" 
                    className="w-6 h-6 object-cover rounded shadow-sm"
                  />
                </button>
                <button
                  onClick={() => setLanguage('tr')}
                  className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                    language === 'tr' 
                      ? 'bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/20 ring-2 ring-[#D4AF37] shadow-lg' 
                      : scrolled 
                        ? 'hover:bg-gray-100 hover:shadow-md' 
                        : 'hover:bg-white/20 backdrop-blur-sm'
                  }`}
                  title="Türkçe"
                  aria-label="Switch to Turkish"
                >
                  <img 
                    src="/lang/turkey.png" 
                    alt="Turkish" 
                    className="w-6 h-6 object-cover rounded shadow-sm"
                  />
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
              <Link href="/rooms" className="flex items-center gap-2 text-gray-700 hover:text-[#D4AF37] py-2 px-4 hover:bg-gray-50 transition-colors">
                <Bed className="w-4 h-4" />
                {t.nav.rooms}
              </Link>
              <Link href="/restaurant" className="flex items-center gap-2 text-gray-700 hover:text-[#D4AF37] py-2 px-4 hover:bg-gray-50 transition-colors">
                <Utensils className="w-4 h-4" />
                {t.nav.restaurant}
              </Link>
              <a 
                href="#facilities" 
                onClick={(e) => {
                  handleAnchorClick(e, 'facilities')
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-[#D4AF37] py-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                {t.nav.facilities}
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  handleMenuClick(e)
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-[#D4AF37] py-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                {t.nav.menu}
              </a>
              <a href="#about" onClick={(e) => handleAnchorClick(e, 'about')} className="flex items-center gap-2 text-gray-700 hover:text-[#D4AF37] py-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <Info className="w-4 h-4" />
                {t.nav.about}
              </a>
              <a href="#contact" onClick={(e) => handleAnchorClick(e, 'contact')} className="flex items-center gap-2 text-gray-700 hover:text-[#D4AF37] py-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <Phone className="w-4 h-4" />
                {t.nav.contact}
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Cinematic Treatment */}
      <section className="relative min-h-screen flex items-end justify-center overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover scale-105 transform transition-transform duration-[10000ms]"
            key={backgroundVideoUrl}
          >
            <source src={backgroundVideoUrl} type="video/mp4" />
          </video>
          {/* Premium Multi-layer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 via-transparent to-[#D4AF37]/10" />
        </div>
        
        {/* Booking Widget Overlay - Premium Glassmorphism */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 p-6 md:p-8 transform hover:scale-[1.01] transition-all duration-500">
            <FadeInSection direction="up" className="text-center mb-4">
              <div className="flex items-center justify-center mb-2">
              <Image
                  src="/logo.png"
                  alt="Crown Salamis Hotel Logo"
                  width={100}
                  height={100}
                  className="object-contain drop-shadow-2xl"
            priority
              />
        </div>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full mb-3" />
            </FadeInSection>
            
            <form onSubmit={handleReservation} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  {t.hero.checkIn} <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none z-10 group-focus-within:scale-110 transition-transform" />
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-3.5 text-sm font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none bg-white shadow-sm hover:shadow-md hover:border-[#D4AF37]/50 transition-all duration-300"
                  required
                />
                </div>
              </div>
              
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  {t.hero.checkOut} <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none z-10 group-focus-within:scale-110 transition-transform" />
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-3.5 text-sm font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none bg-white shadow-sm hover:shadow-md hover:border-[#D4AF37]/50 transition-all duration-300"
                  required
                />
                </div>
              </div>
              
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  {t.hero.adults}
                </label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-focus-within:text-[#D4AF37] group-focus-within:scale-110 transition-all" />
                <select
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value))}
                    className="w-full pl-12 pr-4 py-3.5 text-sm font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none appearance-none bg-white shadow-sm hover:shadow-md hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                </div>
              </div>
              
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  {t.hero.children}
                </label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-focus-within:text-[#D4AF37] group-focus-within:scale-110 transition-all" />
                  <select
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value))}
                    className="w-full pl-12 pr-4 py-3.5 text-sm font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none appearance-none bg-white shadow-sm hover:shadow-md hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer"
                  >
                    {Array.from({ length: 11 }, (_, i) => i).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="md:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-2 transform"
                >
                  <Search className="w-5 h-5" />
                  {t.hero.checkAvailability}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <FadeInSection direction="up" className="text-center mb-4">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-16 h-1 bg-[#D4AF37] mr-4"></div>
              <Star className="w-6 h-6 text-[#D4AF37]" />
              <div className="w-16 h-1 bg-[#D4AF37] ml-4"></div>
            </div>
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
                onClick={() => {
                  if (hotelImages.length > 0) {
                    openExperienceLightbox(experienceCarouselIndex)
                  }
                }}
              >
                {/* Carousel Images */}
                {hotelImages.length > 0 ? (
                  hotelImages.map((image, index) => (
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
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                    />
                  </div>
                  ))
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Loading images...</p>
                    </div>
                  </div>
                )}

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
                    {hotelImages.length > 1 && (
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
                    )}

                    {/* Image Counter */}
                    {hotelImages.length > 0 && (
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm z-10">
                      {experienceCarouselIndex + 1} / {hotelImages.length}
                    </div>
                    )}
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
            {hotelImages.length > 0 && hotelImages[experienceLightboxIndex] && (
            <img
              src={hotelImages[experienceLightboxIndex]}
              alt={`${t.about.experience.title} - ${experienceLightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              loading="lazy"
            />
            )}
            
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
                
                {hotelImages.length > 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full z-10">
                  {experienceLightboxIndex + 1} / {hotelImages.length}
                </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Facilities Section */}
      <section id="facilities" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <FadeInSection direction="up" className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-16 h-1 bg-[#D4AF37] mr-4"></div>
              <Star className="w-6 h-6 text-[#D4AF37]" />
              <div className="w-16 h-1 bg-[#D4AF37] ml-4"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
              {t.facilities.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.facilities.subtitle}
            </p>
          </FadeInSection>

          {/* Facilities Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gym Card */}
            <FadeInSection direction="left" className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full flex flex-col">
                <div 
                  className="relative h-80 overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (gymImages.length > 0) {
                      openGymLightbox(gymCarouselIndex)
                    }
                  }}
                >
                  {gymImages.length > 0 ? (
                    gymImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === gymCarouselIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Gym ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                    ))
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Dumbbell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Loading images...</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 group-hover:via-black/10 transition-all duration-300" />
                  <div className="absolute top-4 left-4 bg-[#D4AF37] text-white px-4 py-2 rounded-full flex items-center gap-2 z-10">
                    <Dumbbell className="w-5 h-5" />
                    <span className="font-semibold">{t.facilities.gym.title}</span>
                  </div>
                  {gymImages.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setGymCarouselIndex((prev) => (prev - 1 + gymImages.length) % gymImages.length)
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  )}
                  {gymImages.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setGymCarouselIndex((prev) => (prev + 1) % gymImages.length)
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  )}
                  {gymImages.length > 0 && (
                  <div className="absolute bottom-4 right-4 text-white text-sm bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full z-10">
                    {gymCarouselIndex + 1} / {gymImages.length}
                  </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-4">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-serif text-gray-900 mb-4">{t.facilities.gym.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                    {t.facilities.gym.description}
                  </p>
                  <button
                    onClick={() => setExpandedFacility(expandedFacility === 'gym' ? null : 'gym')}
                    className="flex items-center gap-2 text-[#D4AF37] font-semibold hover:text-[#B8941F] transition-colors cursor-pointer group"
                  >
                    <span>{expandedFacility === 'gym' ? t.facilities.closeDetails : t.facilities.exploreMore}</span>
                    <ChevronRight className={`w-5 h-5 transition-transform ${expandedFacility === 'gym' ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                  </button>
                </div>
                {expandedFacility === 'gym' && (
                  <div className="px-8 pb-8 border-t border-gray-200 pt-6 animate-[fadeIn_0.4s_ease-out]">
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {t.facilities.gym.details}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {t.facilities.gym.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-700">
                          <div className="w-2 h-2 bg-[#D4AF37] rounded-full flex-shrink-0"></div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FadeInSection>

            {/* Spa Card */}
            <FadeInSection direction="right" className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full flex flex-col">
                <div 
                  className="relative h-80 overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (spaImages.length > 0) {
                      openSpaLightbox(spaCarouselIndex)
                    }
                  }}
                >
                  {spaImages.length > 0 ? (
                    spaImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === spaCarouselIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Spa ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                    ))
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Loading images...</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 group-hover:via-black/10 transition-all duration-300" />
                  <div className="absolute top-4 left-4 bg-[#D4AF37] text-white px-4 py-2 rounded-full flex items-center gap-2 z-10">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">{t.facilities.spa.title}</span>
                  </div>
                  {spaImages.length > 0 && (
                    <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSpaCarouselIndex((prev) => (prev - 1 + spaImages.length) % spaImages.length)
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSpaCarouselIndex((prev) => (prev + 1) % spaImages.length)
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 right-4 text-white text-sm bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full z-10">
                    {spaCarouselIndex + 1} / {spaImages.length}
                  </div>
                    </>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-4">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-serif text-gray-900 mb-4">{t.facilities.spa.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                    {t.facilities.spa.description}
                  </p>
                  <button
                    onClick={() => setExpandedFacility(expandedFacility === 'spa' ? null : 'spa')}
                    className="flex items-center gap-2 text-[#D4AF37] font-semibold hover:text-[#B8941F] transition-colors cursor-pointer group"
                  >
                    <span>{expandedFacility === 'spa' ? t.facilities.closeDetails : t.facilities.exploreMore}</span>
                    <ChevronRight className={`w-5 h-5 transition-transform ${expandedFacility === 'spa' ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                  </button>
                </div>
                {expandedFacility === 'spa' && (
                  <div className="px-8 pb-8 border-t border-gray-200 pt-6 animate-[fadeIn_0.4s_ease-out]">
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {t.facilities.spa.details}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {t.facilities.spa.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-700">
                          <div className="w-2 h-2 bg-[#D4AF37] rounded-full flex-shrink-0"></div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Gym Lightbox */}
      {gymLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={closeGymLightbox}
        >
          <button
            onClick={closeGymLightbox}
            className="absolute top-4 right-4 text-white hover:text-[#D4AF37] transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            {gymImages.length > 0 && gymImages[gymLightboxIndex] && (
            <img
              src={gymImages[gymLightboxIndex]}
              alt={`Gym ${gymLightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              loading="lazy"
            />
            )}
            
            {gymImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevGymLightboxImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextGymLightboxImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full z-10">
                  {gymLightboxIndex + 1} / {gymImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Spa Lightbox */}
      {spaLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={closeSpaLightbox}
        >
          <button
            onClick={closeSpaLightbox}
            className="absolute top-4 right-4 text-white hover:text-[#D4AF37] transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            {spaImages.length > 0 && spaImages[spaLightboxIndex] && (
            <img
              src={spaImages[spaLightboxIndex]}
              alt={`Spa ${spaLightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              loading="lazy"
            />
            )}
            
            {spaImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevSpaLightboxImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextSpaLightboxImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-300 z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full z-10">
                  {spaLightboxIndex + 1} / {spaImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Rooms Section - Black Background */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection direction="up" className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-16 h-1 bg-[#D4AF37] mr-4"></div>
              <Star className="w-6 h-6 text-[#D4AF37]" />
              <div className="w-16 h-1 bg-[#D4AF37] ml-4"></div>
            </div>
          </FadeInSection>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
            <FadeInSection direction="left" className="mb-8 md:mb-0">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-0.5 bg-[#D4AF37]" />
                <p className="text-[#D4AF37] text-sm font-bold tracking-widest uppercase">{t.rooms.feelComfort}</p>
                <div className="w-12 h-0.5 bg-[#D4AF37]" />
              </div>
              <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 tracking-tight leading-tight">
                {t.rooms.title}
              </h2>
              <p className="text-gray-300 max-w-2xl text-lg leading-relaxed">
                {t.rooms.description}
              </p>
            </FadeInSection>
            <FadeInSection direction="right">
              <Link 
                href="/rooms"
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white font-bold px-8 py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-500 overflow-hidden"
              >
                <span className="relative z-10">{t.rooms.viewAll}</span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#B8941F] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {rooms.map((room, index) => (
                <FadeInSection key={room.id} delay={index * 80}>
                  <Link href={`/rooms/${room.id}/book`} className="group block h-full">
                    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-500 h-full flex flex-col transform hover:-translate-y-2 border border-gray-100">
                      <div className="relative h-72 flex-shrink-0 overflow-hidden">
                        <img
                          src={getImageUrl(room.main_image)}
                          alt={`${room.name} - ${room.room_type_name} at Crown Salamis Hotel`}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/imgtouse/1.JPG' // Fallback image
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-4 right-4 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                          BOOK NOW
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50">
                        <h3 className="text-2xl font-serif text-gray-900 mb-3 line-clamp-2 min-h-[3rem] group-hover:text-[#D4AF37] transition-colors duration-300">{room.name}</h3>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4 min-h-[1.5rem]">
                          <Users className="w-4 h-4 text-[#D4AF37]" />
                          <span>{room.max_adults} {t.rooms.adults} {room.max_children > 0 ? `• ${room.max_children} ${t.rooms.children}` : ''}</span>
                        </div>
                        {room.room_type_name && (
                          <div className="inline-flex items-center mb-4 px-3 py-1 bg-[#D4AF37]/10 rounded-full text-xs font-semibold text-[#D4AF37] w-fit">
                            {room.room_type_name}
                          </div>
                        )}
                        <div className="mt-auto pt-4 border-t border-gray-200">
                          <div className="flex items-baseline gap-2">
                            <p className="text-[#D4AF37] text-3xl font-bold">
                              {formatPrice(room.price_per_night)}
                            </p>
                            <span className="text-gray-500 text-sm">{t.rooms.pricePerNight}</span>
                          </div>
                        </div>
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
      <section className="pt-20 pb-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection direction="up" className="text-center mb-4">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-16 h-1 bg-[#D4AF37] mr-4"></div>
              <Star className="w-6 h-6 text-[#D4AF37]" />
              <div className="w-16 h-1 bg-[#D4AF37] ml-4"></div>
            </div>
          </FadeInSection>
          <FadeInSection direction="up" className="text-center mb-12">
            <p className="text-sm text-gray-600 mb-2">{t.services.subtitle}</p>
            <h2 className="text-4xl md:text-6xl font-serif text-gray-900 mb-4">
              {t.services.title}
            </h2>
          </FadeInSection>

          {/* Services Grid - Premium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {/* Room Service */}
            <FadeInSection delay={100} className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-[0_20px_50px_rgba(212,175,55,0.2)] transition-all duration-500 text-center h-full flex flex-col border border-gray-100 hover:border-[#D4AF37]/30 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Bed className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#D4AF37] transition-colors">{t.services.roomService.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.services.roomService.description}</p>
              </div>
            </FadeInSection>

            {/* Breakfast */}
            <FadeInSection delay={200} className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-[0_20px_50px_rgba(212,175,55,0.2)] transition-all duration-500 text-center h-full flex flex-col border border-gray-100 hover:border-[#D4AF37]/30 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Star className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#D4AF37] transition-colors">{t.services.breakfast.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.services.breakfast.description}</p>
              </div>
            </FadeInSection>

            {/* Parking */}
            <FadeInSection delay={300} className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-[0_20px_50px_rgba(212,175,55,0.2)] transition-all duration-500 text-center h-full flex flex-col border border-gray-100 hover:border-[#D4AF37]/30 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Home className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#D4AF37] transition-colors">{t.services.parking.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.services.parking.description}</p>
              </div>
            </FadeInSection>

            {/* High-Speed Internet */}
            <FadeInSection delay={400} className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-[0_20px_50px_rgba(212,175,55,0.2)] transition-all duration-500 text-center h-full flex flex-col border border-gray-100 hover:border-[#D4AF37]/30 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Phone className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#D4AF37] transition-colors">{t.services.wifi.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.services.wifi.description}</p>
              </div>
            </FadeInSection>

            {/* Transfer Service */}
            <FadeInSection delay={500} className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-[0_20px_50px_rgba(212,175,55,0.2)] transition-all duration-500 text-center h-full flex flex-col border border-gray-100 hover:border-[#D4AF37]/30 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <ChevronRight className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#D4AF37] transition-colors">{t.services.transfer.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.services.transfer.description}</p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Recommended By Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection direction="up" className="text-center mb-4">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-16 h-1 bg-[#D4AF37] mr-4"></div>
              <Star className="w-6 h-6 text-[#D4AF37]" />
              <div className="w-16 h-1 bg-[#D4AF37] ml-4"></div>
            </div>
          </FadeInSection>
          <FadeInSection direction="up" className="text-center mb-8">
            <p className="text-sm text-gray-600 mb-4">Trusted by travelers worldwide</p>
            <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-8">
              Recommended By
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              <div className="opacity-80 hover:opacity-100 transition-opacity">
              <Image
                  src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg"
                  alt="TripAdvisor"
                  width={200}
                  height={60}
                  className="h-12 md:h-16 w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <div className="opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center">
                <img
                  src="https://logos-world.net/wp-content/uploads/2020/06/Booking-Logo.png"
                  alt="Booking.com"
                  className="h-12 md:h-16 w-auto object-contain max-w-[200px]"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const fallback = document.createElement('span')
                      fallback.className = 'fallback-text text-xl md:text-2xl font-bold text-[#003580]'
                      fallback.textContent = 'Booking.com'
                      parent.appendChild(fallback)
                    }
                  }}
                />
                </div>
              </div>
            </FadeInSection>
        </div>
      </section>

      {/* Property Amenities & Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection direction="up" className="text-center mb-4">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-16 h-1 bg-[#D4AF37] mr-4"></div>
              <Star className="w-6 h-6 text-[#D4AF37]" />
              <div className="w-16 h-1 bg-[#D4AF37] ml-4"></div>
            </div>
          </FadeInSection>
          <FadeInSection direction="up" className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-serif text-gray-900 mb-4">
              {t.amenities.title}
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Property Amenities */}
            <FadeInSection direction="left" className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-[#D4AF37]" />
                {t.amenities.propertyAmenities}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.freeParking}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.freeWifi}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Coffee className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.freeBreakfast}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Bike className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.bicycleRental}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Ship className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.boating}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Baby className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.highchairs}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.airportTransport}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Luggage className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.baggageStorage}</span>
                </div>
              </div>
            </FadeInSection>

            {/* Room Features */}
            <FadeInSection direction="up" className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                <Bed className="w-6 h-6 text-[#D4AF37]" />
                {t.amenities.roomFeatures}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.blackoutCurtains}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shirt className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.bathrobes}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Wind className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.airConditioning}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Layout className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.desk}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.roomService}</span>
                </div>
                <div className="flex items-center gap-3">
                  <GlassWater className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.minibar}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Tv className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.cableTv}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Droplet className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.walkInShower}</span>
                </div>
              </div>
            </FadeInSection>

            {/* Room Types */}
            <FadeInSection direction="right" className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                <Home className="w-6 h-6 text-[#D4AF37]" />
                {t.amenities.roomTypes}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Waves className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.oceanView}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.cityView}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Ban className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.nonSmoking}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.familyRooms}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Cigarette className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-gray-700">{t.amenities.smokingRooms}</span>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="pt-8 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection direction="up" className="text-center mb-4">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-16 h-1 bg-[#D4AF37] mr-4"></div>
              <Star className="w-6 h-6 text-[#D4AF37]" />
              <div className="w-16 h-1 bg-[#D4AF37] ml-4"></div>
            </div>
          </FadeInSection>
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

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection direction="up" className="text-center mb-4">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-16 h-1 bg-[#D4AF37] mr-4"></div>
              <Star className="w-6 h-6 text-[#D4AF37]" />
              <div className="w-16 h-1 bg-[#D4AF37] ml-4"></div>
            </div>
          </FadeInSection>
          <FadeInSection direction="up" className="text-center mb-8">
            <h2 className="text-4xl md:text-6xl font-serif text-gray-900 mb-4">
              {language === 'tr' ? 'Konumumuz' : 'Our Location'}
            </h2>
            <p className="text-gray-600 mb-8">
              {language === 'tr' 
                ? 'Bizi ziyaret edin veya haritada konumumuzu görün'
                : 'Visit us or find our location on the map'}
            </p>
          </FadeInSection>
          <FadeInSection direction="up">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3262.49658379195!2d33.9128129!3d35.1442343!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14dfc9d8797fa619%3A0x9d7ba499cb3a2620!2sCrown%20Salamis%20Hotel!5e0!3m2!1sen!2s!4v1762468222319!5m2!1sen!2s"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Footer - Premium Design */}
      <footer className="relative bg-gradient-to-b from-gray-900 via-black to-black text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/imgtouse/1.JPG')] opacity-5 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-black/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
            {/* Hotel Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-serif text-[#D4AF37] mb-2 tracking-wider">{t.footer.hotelName}</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-[#D4AF37] to-transparent rounded-full mb-4" />
              </div>
              <p className="text-gray-300 leading-relaxed">
                {t.footer.description}
              </p>
              <div className="space-y-4 text-gray-400">
                <a href="tel:+905428613030" className="flex items-center gap-3 group hover:text-[#D4AF37] transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-all">
                    <Phone className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <span>+90 542 861 3030</span>
                </a>
                <a href="mailto:reservation@crownsalamishotel.com" className="flex items-center gap-3 group hover:text-[#D4AF37] transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-all">
                    <Mail className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <span className="break-all">reservation@crownsalamishotel.com</span>
                </a>
                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <span>İsmet İnönü Bulvarı, No: 290<br />Gazimağusa / Kuzey Kıbrıs</span>
                </div>
              </div>
            </div>
            
            {/* Our Rooms */}
            <div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{t.footer.ourRooms}</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-[#D4AF37] to-transparent rounded-full mb-6" />
              </div>
              <ul className="space-y-3">
                <li><Link href="/rooms/standard" className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-300 flex items-center gap-2 group"><ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />Standard Room</Link></li>
                <li><Link href="/rooms/family" className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-300 flex items-center gap-2 group"><ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />Family Room</Link></li>
                <li><Link href="/rooms/premium" className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-300 flex items-center gap-2 group"><ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />Premium Suite</Link></li>
                <li><Link href="/rooms/superior" className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-300 flex items-center gap-2 group"><ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />Superior Room</Link></li>
              </ul>
            </div>
            
            {/* Other Links */}
            <div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{t.footer.otherLinks}</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-[#D4AF37] to-transparent rounded-full mb-6" />
              </div>
              <ul className="space-y-3">
                <li><Link href="#about" className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-300 flex items-center gap-2 group"><ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />{t.nav.about}</Link></li>
                <li><Link href="#contact" className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-300 flex items-center gap-2 group"><ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />{t.footer.opportunities}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">{t.footer.designedBy}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                <span className="text-gray-500 text-sm">© {new Date().getFullYear()} Crown Salamis Hotel. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

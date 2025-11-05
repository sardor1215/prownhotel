'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, Loader2, Phone, Mail, MapPin } from 'lucide-react'
import { getBackendUrl } from '@/lib/backend-url'
import FadeInSection from '@/components/FadeInSection'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'

export default function MenuPage() {
  const [menuUrl, setMenuUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu')
      const data = await response.json()
      
      if (data.success && data.menu) {
        const pdfUrl = `${getBackendUrl()}${data.menu.url}`
        // Open PDF directly in a new tab
        window.open(pdfUrl, '_blank')
        // Also set the URL for fallback
        setMenuUrl(pdfUrl)
      } else {
        setError('No menu available')
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
      setError('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

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
              <Link href="/" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">Home</Link>
              <Link href="/rooms" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">Rooms</Link>
              <Link href="/restaurant" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">Restaurant</Link>
              <Link href="/menu" className="text-[#D4AF37] font-bold">Menu</Link>
              <a href="/#about" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">About Us</a>
              <a href="/#contact" className="text-gray-700 hover:text-[#D4AF37] font-medium transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="relative bg-black text-white py-24 overflow-hidden">
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
              Our Menu
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
              Discover our delicious selection of dishes and beverages
            </p>
          </FadeInSection>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Loading menu...</p>
          </div>
        ) : error ? (
          <FadeInSection direction="up" className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu Not Available</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8941F] text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </FadeInSection>
        ) : menuUrl ? (
          <FadeInSection direction="up" className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-serif font-bold text-white">Restaurant Menu</h2>
              </div>
              <a
                href={menuUrl}
                download
                className="inline-flex items-center gap-2 bg-white text-[#D4AF37] hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl transition"
              >
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </a>
            </div>
            <div className="p-6">
              <iframe
                src={menuUrl}
                className="w-full h-[800px] border-0 rounded-lg"
                title="Restaurant Menu"
              />
            </div>
          </FadeInSection>
        ) : null}
      </div>

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
                          window.open(`http://localhost:5000${data.menu.url}`, '_blank')
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


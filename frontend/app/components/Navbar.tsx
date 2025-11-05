'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, Menu, X as XIcon } from 'lucide-react'
import OrderNavigation from './OrderNavigation'

interface User {
  id: number
  name: string
  email: string
}

interface NavbarProps {
  isLoggedIn: boolean
  user: User | null
  onLogout: () => void
  cartItemCount: number
  onCartOpen: () => void
}

export default function Navbar({ 
  isLoggedIn, 
  user, 
  onLogout, 
  cartItemCount, 
  onCartOpen 
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Add function to toggle mobile menu
  const router = useRouter()
  const pathname = usePathname()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Close mobile menu when navigating to a new page
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  // Handle smooth scroll to contact section
  const handleContactClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    closeMobileMenu()
    
    if (pathname !== '/') {
      // If not on home page, navigate to home first
      router.push('/#contact')
    } else {
      // If on home page, scroll to contact section
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [pathname, router, closeMobileMenu])

  return (
    <>
      {/* Top Bar with Cart */}
      <div className="bg-primary text-white py-2 px-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl">ORBA SHOWER</Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/products" className="hover:text-accent transition-colors">Products</Link>
              <button 
                onClick={handleContactClick}
                className="hover:text-accent transition-colors text-left"
              >
                Contact
              </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mobile menu button - only visible on small screens */}
            <button 
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {isLoggedIn ? (
              <OrderNavigation 
                isLoggedIn={isLoggedIn}
                userName={user?.name}
                onLogout={onLogout}
              />
            ) : null}
            
            <button
              onClick={onCartOpen}
              className="relative bg-accent hover:bg-accent/90 px-4 py-1.5 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={closeMobileMenu} />
      )}

      {/* Mobile Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-primary shadow-xl transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 md:hidden`}>
        <div className="flex flex-col h-full">
          {/* Close button */}
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <span className="font-bold text-xl text-white">Menu</span>
            <button 
              onClick={closeMobileMenu}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <XIcon className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col p-4 space-y-4">
            <Link 
              href="/products" 
              className="text-white hover:text-accent transition-colors py-2 border-b border-white/10"
              onClick={closeMobileMenu}
            >
              Products
            </Link>
            <button 
              onClick={handleContactClick}
              className="w-full text-left text-white hover:text-accent transition-colors py-2 border-b border-white/10"
            >
              Contact
            </button>
          </nav>

          {/* User section for mobile */}
          {isLoggedIn && (
            <div className="mt-auto p-4 border-t border-white/10">
              <div className="text-white text-sm mb-2">
                Welcome, {user?.name}
              </div>
              <button 
                onClick={() => {
                  onLogout()
                  closeMobileMenu()
                }}
                className="w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm font-medium text-white"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

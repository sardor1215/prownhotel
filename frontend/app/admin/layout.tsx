'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Hotel,
  Calendar,
  Bed,
  Menu, 
  X, 
  LogOut,
  User,
  BarChart3,
  Settings,
  FileText,
  Loader2
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Reservations', href: '/admin/reservations', icon: Calendar },
  { name: 'Rooms', href: '/admin/rooms', icon: Hotel },
  { name: 'Room Types', href: '/admin/room-types', icon: Bed },
  { name: 'Menu', href: '/admin/menu', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, disabled: true },
  { name: 'Settings', href: '/admin/settings', icon: Settings, disabled: true },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const pathname = usePathname()

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('adminToken')
        
        if (!token) {
          // No token, redirect to login
          router.push(`/admin/login?from=${encodeURIComponent(pathname)}`)
          return
        }

        // Verify token with backend
        const verifyResponse = await fetch('/api/admin-auth/verify', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })

        if (!verifyResponse.ok) {
          // Token invalid, clear storage and redirect
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          router.push(`/admin/login?from=${encodeURIComponent(pathname)}`)
          return
        }

        const verifyData = await verifyResponse.json()
        
        if (!verifyData.valid || !verifyData.admin) {
          // Verification failed
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          router.push(`/admin/login?from=${encodeURIComponent(pathname)}`)
          return
        }

        // Auth is valid
        setCheckingAuth(false)
      } catch (error) {
        console.error('Auth check error:', error)
        // On error, redirect to login
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        router.push(`/admin/login?from=${encodeURIComponent(pathname)}`)
      }
    }

    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setCheckingAuth(false)
      return
    }

    checkAuth()
  }, [pathname, router])

  // Show loading state while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-zinc-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-60" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-zinc-900 shadow-2xl">
          {/* Header */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-zinc-800">
            <div>
              <h1 className="text-xl font-serif font-bold text-white tracking-wide">Crown Salamis Hotel</h1>
              <p className="text-xs text-amber-500 mt-0.5">Administration</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-zinc-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href === '/admin/dashboard' && pathname === '/admin')
              const isDisabled = item.disabled
              
              if (isDisabled) {
                return (
                  <div
                    key={item.name}
                    className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-zinc-500 cursor-not-allowed opacity-50"
                  >
                    <item.icon className="mr-3 h-5 w-5 text-zinc-500" />
                    {item.name}
                  </div>
                )
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-amber-500'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-zinc-800 p-4">
            <div className="flex items-center px-4 py-3 mb-2">
              <div className="bg-amber-600 rounded-full p-2 mr-3">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-zinc-400">Administrator</p>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('adminToken')
                localStorage.removeItem('adminUser')
                window.location.href = '/admin/login'
              }}
              className="flex w-full items-center px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-all"
            >
              <LogOut className="mr-3 h-5 w-5 text-zinc-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-zinc-900 shadow-2xl">
          {/* Header */}
          <div className="flex h-20 items-center px-6 border-b border-zinc-800">
            <div>
              <h1 className="text-xl font-serif font-bold text-white tracking-wide">Crown Salamis Hotel</h1>
              <p className="text-xs text-amber-500 mt-0.5">Administration</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href === '/admin/dashboard' && pathname === '/admin')
              const isDisabled = item.disabled
              
              if (isDisabled) {
                return (
                  <div
                    key={item.name}
                    className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-zinc-500 cursor-not-allowed opacity-50"
                  >
                    <item.icon className="mr-3 h-5 w-5 text-zinc-500" />
                    {item.name}
                  </div>
                )
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-amber-500'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-zinc-800 p-4">
            <div className="flex items-center px-4 py-3 mb-2">
              <div className="bg-amber-600 rounded-full p-2 mr-3">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-zinc-400">Administrator</p>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('adminToken')
                localStorage.removeItem('adminUser')
                window.location.href = '/admin/login'
              }}
              className="flex w-full items-center px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-all"
            >
              <LogOut className="mr-3 h-5 w-5 text-zinc-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b border-stone-200 bg-white px-6 shadow-sm">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-zinc-700 lg:hidden hover:text-zinc-900 transition"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 flex items-center justify-between lg:ml-0 ml-4">
            <div className="flex items-center space-x-2">
              <Hotel className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-zinc-600">Hotel Management System</span>
            </div>
            <Link
              href="/"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium transition"
            >
              View Website →
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 
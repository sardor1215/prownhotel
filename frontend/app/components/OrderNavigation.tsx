'use client'

import React from 'react'
import { Package, ShoppingCart, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OrderNavigationProps {
  isLoggedIn: boolean
  userName?: string
  onLogout: () => void
}

export default function OrderNavigation({ isLoggedIn, userName, onLogout }: OrderNavigationProps) {
  const router = useRouter()

  const handleMyOrders = () => {
    router.push('/my-orders')
  }

  const handleProfile = () => {
    // You can implement a profile page later
    console.log('Profile clicked')
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleMyOrders}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
      >
        <Package className="w-4 h-4" />
        <span className="hidden sm:inline">My Orders</span>
      </button>
      
      <div className="flex items-center gap-2 px-4 py-2 text-gray-700">
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">{userName || 'User'}</span>
      </div>
      
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  )
}

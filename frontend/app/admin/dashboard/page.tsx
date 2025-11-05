'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Hotel, Calendar, Users, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Plus } from 'lucide-react'

interface DashboardStats {
  totalRooms: number
  availableRooms: number
  occupiedRooms: number
  totalReservations: number
  pendingReservations: number
  confirmedReservations: number
  completedReservations: number
  cancelledReservations: number
  todayCheckIns: number
  todayCheckOuts: number
  totalRevenue: number
  monthlyRevenue: number
}

interface RecentReservation {
  id: number
  guest_name: string
  check_in_date: string
  check_out_date: string
  status: string
  total_amount: number
  created_at: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    completedReservations: 0,
    cancelledReservations: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  })
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch rooms
      const roomsResponse = await fetch('/api/admin/rooms', {
        credentials: 'include'
      })
      
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json()
        if (roomsData.success) {
          const available = roomsData.rooms.filter((r: any) => r.is_available).length
          setStats(prev => ({
            ...prev,
            totalRooms: roomsData.rooms.length,
            availableRooms: available,
            occupiedRooms: roomsData.rooms.length - available
          }))
        }
      }

      // Fetch reservations
      const reservationsResponse = await fetch('/api/reservations', {
        credentials: 'include'
      })
      
      if (reservationsResponse.ok) {
        const reservationsData = await reservationsResponse.json()
        if (reservationsData.success) {
          const reservations = reservationsData.reservations
          
          // Calculate stats
          const pending = reservations.filter((r: any) => r.status === 'pending').length
          const confirmed = reservations.filter((r: any) => r.status === 'confirmed').length
          const completed = reservations.filter((r: any) => r.status === 'completed').length
          const cancelled = reservations.filter((r: any) => r.status === 'cancelled').length
          
          // Calculate revenue
          const totalRevenue = reservations
            .filter((r: any) => r.status !== 'cancelled')
            .reduce((sum: number, r: any) => sum + parseFloat(r.total_amount || 0), 0)
          
          // Calculate monthly revenue (current month)
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()
          const monthlyRevenue = reservations
            .filter((r: any) => {
              const createdDate = new Date(r.created_at)
              return r.status !== 'cancelled' &&
                     createdDate.getMonth() === currentMonth &&
                     createdDate.getFullYear() === currentYear
            })
            .reduce((sum: number, r: any) => sum + parseFloat(r.total_amount || 0), 0)
          
          // Today's check-ins and check-outs
          const today = new Date().toISOString().split('T')[0]
          const todayCheckIns = reservations.filter((r: any) => r.check_in_date === today).length
          const todayCheckOuts = reservations.filter((r: any) => r.check_out_date === today).length
          
          setStats(prev => ({
            ...prev,
            totalReservations: reservations.length,
            pendingReservations: pending,
            confirmedReservations: confirmed,
            completedReservations: completed,
            cancelledReservations: cancelled,
            todayCheckIns,
            todayCheckOuts,
            totalRevenue,
            monthlyRevenue
          }))
          
          // Set recent reservations (last 5)
          setRecentReservations(reservations.slice(0, 5))
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: Hotel,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      subtitle: `${stats.availableRooms} available`
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingReservations,
      icon: Clock,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      subtitle: 'Awaiting confirmation'
    },
    {
      title: 'Confirmed Today',
      value: stats.confirmedReservations,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      subtitle: 'Active reservations'
    },
    {
      title: 'Monthly Revenue',
      value: `£${stats.monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      subtitle: 'This month'
    }
  ]

  const quickActions = [
    {
      title: 'New Reservation',
      description: 'Create a new booking',
      href: '/admin/reservations/new',
      icon: Calendar,
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Add Room',
      description: 'List a new room',
      href: '/admin/rooms/new',
      icon: Hotel,
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'View Reports',
      description: 'Analytics & insights',
      href: '/admin/analytics',
      icon: TrendingUp,
      color: 'from-purple-600 to-purple-700'
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800 border-green-200' },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    )
  }

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
        <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">Dashboard</h1>
        <p className="text-zinc-600">Welcome to Crown Salamis Hotel Management</p>
      </div>

      {/* Today's Activity */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 rounded-lg p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Today's Activity</h3>
            <div className="flex items-center gap-6 text-sm text-zinc-700">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-green-600" />
                <span><strong>{stats.todayCheckIns}</strong> Check-ins</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-red-600 rotate-180" />
                <span><strong>{stats.todayCheckOuts}</strong> Check-outs</span>
              </div>
            </div>
          </div>
          <Calendar className="w-8 h-8 text-amber-600" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.bgColor} rounded-lg p-3`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-zinc-900 mb-1">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={`bg-gradient-to-br ${action.color} rounded-lg p-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900 group-hover:text-amber-700 transition">{action.title}</h3>
                  <p className="text-sm text-zinc-600">{action.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reservations */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200">
            <div className="p-6 border-b border-stone-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold text-zinc-900">Recent Reservations</h2>
                <Link href="/admin/reservations" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  View all →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-stone-200">
              {recentReservations.length > 0 ? (
                recentReservations.map((reservation) => (
                  <Link key={reservation.id} href={`/admin/reservations/${reservation.id}`}>
                    <div className="p-6 hover:bg-stone-50 transition cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-zinc-900">{reservation.guest_name}</h3>
                          <p className="text-sm text-zinc-600 mt-1">
                            {new Date(reservation.check_in_date).toLocaleDateString()} - {new Date(reservation.check_out_date).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600">
                          Booked {new Date(reservation.created_at).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-zinc-900">
                          £{parseFloat(reservation.total_amount.toString()).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-600">No reservations yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="space-y-6">
          {/* Occupancy Rate */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Occupancy Rate</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-600">Occupied</span>
                  <span className="font-semibold text-zinc-900">{stats.occupiedRooms} / {stats.totalRooms}</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${stats.totalRooms > 0 ? (stats.occupiedRooms / stats.totalRooms) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t border-stone-200">
                <p className="text-2xl font-bold text-zinc-900">
                  {stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}%
                </p>
                <p className="text-sm text-zinc-600 mt-1">Current occupancy</p>
              </div>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Revenue Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-zinc-900">£{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="pt-4 border-t border-stone-200">
                <p className="text-sm text-zinc-600 mb-1">This Month</p>
                <p className="text-xl font-bold text-amber-600">£{stats.monthlyRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Reservation Status */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Booking Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-zinc-600">Confirmed</span>
                </div>
                <span className="font-semibold text-zinc-900">{stats.confirmedReservations}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm text-zinc-600">Pending</span>
                </div>
                <span className="font-semibold text-zinc-900">{stats.pendingReservations}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-zinc-600">Completed</span>
                </div>
                <span className="font-semibold text-zinc-900">{stats.completedReservations}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-zinc-600">Cancelled</span>
                </div>
                <span className="font-semibold text-zinc-900">{stats.cancelledReservations}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Calendar, Eye, Clock, CheckCircle, XCircle, AlertCircle, Filter, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

interface Reservation {
  id: number
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  special_requests?: string
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations', {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setReservations(data.reservations)
      } else {
        toast.error(data.error || 'Failed to fetch reservations')
      }
    } catch (error) {
      console.error('Error fetching reservations:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Reservation ${newStatus} successfully`)
        fetchReservations()
      } else {
        toast.error(data.error || 'Failed to update reservation')
      }
    } catch (error) {
      console.error('Error updating reservation:', error)
      toast.error('An error occurred')
    }
  }

  // Filter and sort reservations
  const filteredReservations = reservations
    .filter(reservation => {
      const matchesSearch = 
        reservation.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.guest_phone.includes(searchTerm)
      
      const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'check_in':
          return new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime()
        case 'amount_high':
          return b.total_amount - a.total_amount
        case 'amount_low':
          return a.total_amount - b.total_amount
        default:
          return 0
      }
    })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: 'Pending', 
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: Clock
      },
      confirmed: { 
        label: 'Confirmed', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      },
      completed: { 
        label: 'Completed', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle
      },
      cancelled: { 
        label: 'Cancelled', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle
      }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    )
  }

  const getStatusActions = (reservation: Reservation) => {
    const actions = []
    
    if (reservation.status === 'pending') {
      actions.push(
        <button
          key="confirm"
          onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
          className="text-xs font-medium text-green-700 hover:text-green-900 transition"
        >
          Confirm
        </button>
      )
      actions.push(
        <button
          key="cancel"
          onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
          className="text-xs font-medium text-red-700 hover:text-red-900 transition"
        >
          Cancel
        </button>
      )
    } else if (reservation.status === 'confirmed') {
      actions.push(
        <button
          key="complete"
          onClick={() => handleStatusUpdate(reservation.id, 'completed')}
          className="text-xs font-medium text-blue-700 hover:text-blue-900 transition"
        >
          Complete
        </button>
      )
      actions.push(
        <button
          key="cancel"
          onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
          className="text-xs font-medium text-red-700 hover:text-red-900 transition"
        >
          Cancel
        </button>
      )
    }
    
    return actions
  }

  const statusCounts = {
    all: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
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
        <div className="mb-6">
          <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">Reservations</h1>
          <p className="text-zinc-600">Manage guest bookings and reservations</p>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg border border-stone-200 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Reservations', count: statusCounts.all },
              { key: 'pending', label: 'Pending', count: statusCounts.pending },
              { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
              { key: 'completed', label: 'Completed', count: statusCounts.completed },
              { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-md font-medium text-sm transition ${
                  statusFilter === tab.key
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-stone-50'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  statusFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-100 text-zinc-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by guest name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="check_in">Check-in Date</option>
              <option value="amount_high">Amount (High to Low)</option>
              <option value="amount_low">Amount (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="bg-white rounded-lg border border-stone-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No reservations found</h3>
          <p className="text-zinc-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'No reservations have been made yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => {
            const checkIn = new Date(reservation.check_in_date)
            const checkOut = new Date(reservation.check_out_date)
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
            
            return (
              <div key={reservation.id} className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-zinc-900">{reservation.guest_name}</h3>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <div className="space-y-1 text-sm text-zinc-600">
                        <p>📧 {reservation.guest_email}</p>
                        <p>📱 {reservation.guest_phone}</p>
                      </div>
                    </div>
                    <Link
                      href={`/admin/reservations/${reservation.id}`}
                      className="flex items-center gap-2 bg-stone-100 hover:bg-amber-50 text-zinc-700 hover:text-amber-700 font-medium px-4 py-2 rounded-lg transition border border-stone-200 hover:border-amber-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </Link>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-lg mb-4">
                    <div>
                      <p className="text-xs text-zinc-600 mb-1">Check-in</p>
                      <p className="font-semibold text-zinc-900">{checkIn.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 mb-1">Check-out</p>
                      <p className="font-semibold text-zinc-900">{checkOut.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 mb-1">Guests</p>
                      <p className="font-semibold text-zinc-900">
                        {reservation.adults} Adult{reservation.adults !== 1 ? 's' : ''}
                        {reservation.children > 0 && `, ${reservation.children} Child${reservation.children !== 1 ? 'ren' : ''}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 mb-1">Total Amount</p>
                      <p className="font-bold text-amber-600 text-lg">
                        £{parseFloat(reservation.total_amount.toString()).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {reservation.special_requests && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Special Requests:</p>
                      <p className="text-sm text-blue-800">{reservation.special_requests}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                    <div className="text-xs text-zinc-500">
                      Booked on {new Date(reservation.created_at).toLocaleDateString()} at {new Date(reservation.created_at).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusActions(reservation)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

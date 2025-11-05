'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, Mail, Phone, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/formatPrice'
import { getApiUrl } from '@/lib/backend-url'

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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  special_requests?: string
  created_at: string
  updated_at: string
  rooms: Array<{
    room_id: number
    room_name: string
    price_per_night: number | string
    nights: number
    subtotal: number | string
  }>
}

export default function ReservationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchReservation()
    }
  }, [params.id])

  const fetchReservation = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(getApiUrl(`/api/reservations/${params.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setReservation(data.reservation)
      } else {
        toast.error('Failed to fetch reservation')
        router.push('/admin/reservations')
      }
    } catch (error) {
      console.error('Error fetching reservation:', error)
      toast.error('An error occurred')
      router.push('/admin/reservations')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!reservation) return

    try {
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(getApiUrl(`/api/reservations/${reservation.id}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Reservation ${newStatus} successfully`)
        fetchReservation()
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('An error occurred')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading reservation...</p>
        </div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Reservation not found</p>
          <Link href="/admin/reservations" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Back to Reservations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/reservations"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reservation Details</h1>
                <p className="text-gray-600 mt-1">Reservation #{reservation.id}</p>
              </div>
            </div>
            {getStatusBadge(reservation.status)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Guest Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Guest Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-3">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guest Name</p>
                  <p className="font-semibold text-gray-900">{reservation.guest_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-3">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{reservation.guest_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 rounded-full p-3">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">{reservation.guest_phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 rounded-full p-3">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="font-semibold text-gray-900">
                    {reservation.adults} adults, {reservation.children} children
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Check-in Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <p className="font-semibold text-gray-900">{formatDate(reservation.check_in_date)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Check-out Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <p className="font-semibold text-gray-900">{formatDate(reservation.check_out_date)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Duration</p>
                <p className="font-semibold text-gray-900">
                  {calculateNights(reservation.check_in_date, reservation.check_out_date)} nights
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Total Amount</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">£{reservation.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rooms */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rooms Booked</h2>
            <div className="space-y-3">
              {reservation.rooms.map((room, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{room.room_name}</h3>
                    <span className="text-gray-600">Room ID: {room.room_id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Nights</p>
                      <p className="font-semibold text-gray-900">{room.nights}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Price per Night</p>
                      <p className="font-semibold text-gray-900">{formatPrice(room.price_per_night)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Subtotal</p>
                      <p className="font-semibold text-gray-900">{formatPrice(room.subtotal)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Requests */}
          {reservation.special_requests && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Special Requests</h2>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{reservation.special_requests}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Timestamps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Created At</p>
                <p className="font-semibold text-gray-900">{formatDate(reservation.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="font-semibold text-gray-900">{formatDate(reservation.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              {reservation.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirm Reservation
                </button>
              )}

              {reservation.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Completed
                </button>
              )}

              {reservation.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                >
                  <XCircle className="w-5 h-5" />
                  Cancel Reservation
                </button>
              )}

              <Link
                href="/admin/reservations"
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Reservations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



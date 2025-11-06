'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Calendar, Users, Mail, Phone, Home } from 'lucide-react'
import { formatPrice } from '@/lib/formatPrice'
import { getApiUrl } from '@/lib/backend-url'
import { formatDate } from '@/lib/utils'

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
  status: string
  created_at: string
  rooms: Array<{
    room_name: string
    price_per_night: number | string
    nights: number
    subtotal: number | string
  }>
}

export default function ReservationConfirmationPage() {
  const params = useParams()
  const reservationId = params.id as string

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (reservationId) {
      fetchReservation()
    }
  }, [reservationId])

  const fetchReservation = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/reservations/${reservationId}`))
      const data = await response.json()
      
      if (data.success) {
        setReservation(data.reservation)
      }
    } catch (error) {
      console.error('Error fetching reservation:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading reservation details...</p>
        </div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Reservation not found</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              <span className="text-blue-600">CROWN</span> Salamis Hotel
            </Link>
          </div>
        </div>
      </nav>

      {/* Confirmation Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600">
            Your reservation has been successfully created
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Confirmation Number: <span className="font-semibold">#{reservation.id}</span>
          </p>
        </div>

        {/* Reservation Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reservation Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="flex items-start space-x-3 mb-4">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-semibold">{formatDate(reservation.check_in_date)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-semibold">{formatDate(reservation.check_out_date)}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start space-x-3 mb-4">
                <Users className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Guests</p>
                  <p className="font-semibold">{reservation.adults} Adults, {reservation.children} Children</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Home className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                    {reservation.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mb-8">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Guest Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{reservation.guest_email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{reservation.guest_phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Room Details</h3>
            {reservation.rooms.map((room, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{room.room_name}</h4>
                  <span className="font-bold text-blue-600">{formatPrice(room.subtotal)}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatPrice(room.price_per_night)} per night × {room.nights} nights
                </p>
              </div>
            ))}

            <div className="border-t mt-4 pt-4 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total Amount</span>
              <span className="text-3xl font-bold text-blue-600">{formatPrice(reservation.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>A confirmation email has been sent to {reservation.guest_email}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Our team will review your reservation and confirm within 24 hours</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>You can cancel free of charge up to 24 hours before check-in</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Payment will be collected at the hotel upon check-in</span>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-3">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about your reservation, please don&apos;t hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:+905338372457" className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">
              <Phone className="w-5 h-5" />
              <span>Call Us</span>
            </a>
            <a href="mailto:info@crownsalamishotel.com" className="flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg transition">
              <Mail className="w-5 h-5" />
              <span>Email Us</span>
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <Home className="w-5 h-5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  )
}



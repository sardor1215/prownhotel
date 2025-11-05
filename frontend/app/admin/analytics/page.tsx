'use client'

import React from 'react'
import { TrendingUp, DollarSign, Calendar, Users, BarChart3 } from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">Analytics</h1>
        <p className="text-zinc-600">View detailed reports and insights</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200 p-12 text-center">
        <div className="bg-amber-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-10 h-10 text-amber-600" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-3">Analytics Dashboard</h2>
        <p className="text-zinc-600 max-w-2xl mx-auto mb-8">
          Comprehensive analytics and reporting features are coming soon. Track revenue trends, occupancy rates, guest demographics, and more.
        </p>
        
        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 border border-stone-200">
            <div className="bg-blue-50 rounded-lg p-3 w-fit mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Revenue Reports</h3>
            <p className="text-sm text-zinc-600">Track income and trends</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-stone-200">
            <div className="bg-green-50 rounded-lg p-3 w-fit mx-auto mb-3">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Booking Analysis</h3>
            <p className="text-sm text-zinc-600">Reservation patterns</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-stone-200">
            <div className="bg-purple-50 rounded-lg p-3 w-fit mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Guest Insights</h3>
            <p className="text-sm text-zinc-600">Demographics & behavior</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-stone-200">
            <div className="bg-orange-50 rounded-lg p-3 w-fit mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Performance</h3>
            <p className="text-sm text-zinc-600">Key metrics & KPIs</p>
          </div>
        </div>
      </div>
    </div>
  )
}

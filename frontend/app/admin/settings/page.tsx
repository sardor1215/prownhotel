'use client'

import React from 'react'
import { Settings, User, Lock, Bell, Globe, Shield } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">Settings</h1>
        <p className="text-zinc-600">Manage your account and application settings</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-gradient-to-br from-stone-50 to-white rounded-xl border border-stone-200 p-12 text-center">
        <div className="bg-stone-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Settings className="w-10 h-10 text-zinc-600" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-3">Settings Panel</h2>
        <p className="text-zinc-600 max-w-2xl mx-auto mb-8">
          Comprehensive settings management is coming soon. Configure your profile, security, notifications, and more.
        </p>
        
        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 border border-stone-200">
            <div className="bg-blue-50 rounded-lg p-3 w-fit mx-auto mb-3">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Profile Settings</h3>
            <p className="text-sm text-zinc-600">Update your information</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-stone-200">
            <div className="bg-red-50 rounded-lg p-3 w-fit mx-auto mb-3">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Security</h3>
            <p className="text-sm text-zinc-600">Password & authentication</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-stone-200">
            <div className="bg-green-50 rounded-lg p-3 w-fit mx-auto mb-3">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Notifications</h3>
            <p className="text-sm text-zinc-600">Email & alerts</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-stone-200">
            <div className="bg-purple-50 rounded-lg p-3 w-fit mx-auto mb-3">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Preferences</h3>
            <p className="text-sm text-zinc-600">Language & region</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-stone-200">
            <div className="bg-orange-50 rounded-lg p-3 w-fit mx-auto mb-3">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Privacy</h3>
            <p className="text-sm text-zinc-600">Data & permissions</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-stone-200">
            <div className="bg-amber-50 rounded-lg p-3 w-fit mx-auto mb-3">
              <Settings className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Advanced</h3>
            <p className="text-sm text-zinc-600">System configuration</p>
          </div>
        </div>
      </div>
    </div>
  )
}



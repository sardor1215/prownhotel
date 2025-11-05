'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'

// Using environment variables directly in the component
export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get redirect URL from query params or default to dashboard
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('from') || '/admin/dashboard';
      
      console.log('Admin login attempt:', {
        email: formData.email,
        redirectTo,
        hasRedirectFromParams: !!params.get('from')
      });
      
      // Use the frontend API route to avoid CORS issues
      console.log('Calling frontend API route for login...');
      
      const response = await fetch('/api/admin-auth/login', {
        method: 'POST',
        credentials: 'include', // This is crucial for sending/receiving cookies
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      console.log('Login response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if the response is ok first
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Login failed with status:', response.status, errorText);
        throw new Error('Login failed. Please check your credentials.');
      }

      // Try to parse the response
      let data;
      try {
        data = await response.json();
        console.log('Login response data:', data);
      } catch (jsonError) {
        console.error('Failed to parse login response as JSON:', jsonError);
        // If we can't parse the response but the status was ok, 
        // the login might have succeeded anyway. Let's try to verify.
      }

      // Since login was successful, just redirect to dashboard
      if (data && data.success && data.admin) {
        // Store admin user data in localStorage
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        
        // Also store token in localStorage for direct backend calls
        if (data.token) {
          localStorage.setItem('adminToken', data.token);
          console.log('Stored admin token in localStorage');
        } else {
          console.warn('No token in login response, authentication may fail');
        }
        
        console.log('Stored admin user in localStorage:', data.admin);
        
        // Wait a moment to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Use router.push for client-side navigation
        console.log('Login successful, redirecting to:', redirectTo);
        
        // Force a hard navigation to ensure cookies are included
        window.location.href = redirectTo;
        return;
      }
      
      // If login failed, show error
      if (data && data.error) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      // If we don't have admin data from login response, try to verify via same-origin API route
      const verifyResponse = await fetch('/api/admin-auth/verify', {
        credentials: 'include', // Include cookies
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Verify response status:', verifyResponse.status);
      
      if (!verifyResponse.ok) {
        throw new Error('Authentication verification failed. Please try logging in again.');
      }

      const verifyData = await verifyResponse.json();
      console.log('Verify response data:', verifyData);

      if (verifyData.admin) {
        // Store admin user data in localStorage
        localStorage.setItem('adminUser', JSON.stringify(verifyData.admin));
        
        // Try to get token from response if available
        if (verifyData.token) {
          localStorage.setItem('adminToken', verifyData.token);
        }
        
        console.log('Stored admin user in localStorage:', verifyData.admin);
        
        // Use router.push for client-side navigation
        console.log('Login successful, redirecting to:', redirectTo);
        router.push(redirectTo);
        return;
      }
      
      throw new Error('Authentication verification failed: No admin data received');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-10 border border-stone-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-amber-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border-2 border-amber-200">
            <Lock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-zinc-900 mb-2">Admin Access</h1>
          <p className="text-zinc-600">Crown Salamis Hotel</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-zinc-900 placeholder-zinc-400"
                placeholder="admin@hotel.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-zinc-900 placeholder-zinc-400"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-stone-200 text-center">
          <p className="text-sm text-zinc-500">
            Crown Salamis Hotel Management System
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Secure Admin Access
          </p>
        </div>
      </div>
    </div>
  )
}

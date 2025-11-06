'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Users, Bed, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getApiUrl } from '@/lib/backend-url'
import { formatDate } from '@/lib/utils'

interface RoomType {
  id: number
  name: string
  slug: string
  description: string | null
  max_adults: number
  max_children: number
  created_at: string
}

export default function AdminRoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_adults: 2,
    max_children: 0
  })
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        resetForm()
      }
    }

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [showModal])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        resetForm()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showModal])

  // Helper function to get auth token
  const getAuthToken = async (): Promise<string | null> => {
    // First try localStorage
    let token = localStorage.getItem('adminToken');
    
    if (token) {
      return token;
    }
    
    // If not in localStorage, try to verify and get token from backend
    try {
      const verifyResponse = await fetch('/api/admin-auth/verify', {
        credentials: 'include'
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        // Token should be in response, but if not, we'll need to get it another way
        // For now, return null and let the backend handle cookie-based auth
        return null; // Backend will use cookie
      }
    } catch (error) {
      console.error('Error verifying auth:', error);
    }
    
    return null;
  }

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch(getApiUrl('/api/room-types'), {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setRoomTypes(data.roomTypes)
      } else {
        toast.error(data.error || 'Failed to fetch room types')
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Room type name is required')
      return
    }

    try {
      // Get token from localStorage (set during login)
      let token = localStorage.getItem('adminToken');
      
      // If no token, try to get it or use cookie-based auth
      if (!token) {
        // Try to verify and see if we can get token
        const verifyResponse = await fetch('/api/admin-auth/verify', {
          credentials: 'include'
        });
        
        if (!verifyResponse.ok) {
          toast.error('Not authenticated. Please login again.')
          window.location.href = '/admin/login'
          return
        }
        // Backend will use cookie for auth if no token
      }

      const url = editingId 
        ? getApiUrl(`/api/admin/room-types/${editingId}`)
        : getApiUrl('/api/admin/room-types')
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Add Authorization header only if we have a token
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        credentials: 'include', // Important: sends cookies
        headers,
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(editingId ? 'Room type updated successfully' : 'Room type created successfully')
        fetchRoomTypes()
        resetForm()
      } else {
        toast.error(data.error || 'Failed to save room type')
      }
    } catch (error) {
      console.error('Error saving room type:', error)
      toast.error('An error occurred')
    }
  }

  const handleEdit = (roomType: RoomType) => {
    setFormData({
      name: roomType.name,
      description: roomType.description || '',
      max_adults: roomType.max_adults,
      max_children: roomType.max_children
    })
    setEditingId(roomType.id)
    setShowModal(true)
  }

  const handleAddNew = () => {
    resetForm()
    setShowModal(true)
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will affect all rooms with this type.`)) {
      return
    }

    try {
      // Get token from localStorage (set during login)
      let token = localStorage.getItem('adminToken');
      
      // If no token, verify auth via cookie
      if (!token) {
        const verifyResponse = await fetch('/api/admin-auth/verify', {
          credentials: 'include'
        });
        
        if (!verifyResponse.ok) {
          toast.error('Not authenticated. Please login again.')
          window.location.href = '/admin/login'
          return
        }
      }

      const headers: HeadersInit = {};
      
      // Add Authorization header only if we have a token
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(getApiUrl(`/api/admin/room-types/${id}`), {
        method: 'DELETE',
        credentials: 'include', // Important: sends cookies
        headers
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Room type deleted successfully')
        fetchRoomTypes()
      } else {
        toast.error(data.error || 'Failed to delete room type')
      }
    } catch (error) {
      console.error('Error deleting room type:', error)
      toast.error('An error occurred')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      max_adults: 2,
      max_children: 0
    })
    setEditingId(null)
    setShowModal(false)
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">Room Types</h1>
            <p className="text-zinc-600">Manage room categories and their default settings</p>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold px-6 py-3 rounded-lg transition shadow-lg shadow-amber-900/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add Room Type</span>
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={resetForm}></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              ref={modalRef}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-stone-200">
                <h2 className="text-2xl font-serif font-bold text-zinc-900">
                  {editingId ? 'Edit Room Type' : 'Add New Room Type'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-zinc-400 hover:text-zinc-600 transition p-2 hover:bg-stone-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">
                        Room Type Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Standard Room, Premium Suite"
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                        required
                        autoFocus
                      />
                    </div>

                    {/* Max Adults */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">
                        Max Adults <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.max_adults}
                        onChange={(e) => setFormData({ ...formData, max_adults: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                        required
                      />
                    </div>

                    {/* Max Children */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">
                        Max Children
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.max_children}
                        onChange={(e) => setFormData({ ...formData, max_children: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                      />
                    </div>

                    {/* Total Capacity Display */}
                    <div className="md:col-span-2">
                      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg px-4 py-4">
                        <p className="text-sm text-amber-900 mb-1 font-semibold">Total Capacity</p>
                        <p className="text-3xl font-bold text-amber-700">
                          {formData.max_adults + formData.max_children} Guests
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe this room type..."
                      rows={4}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 mt-6 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-stone-300 text-zinc-700 font-medium rounded-lg hover:bg-stone-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold px-8 py-3 rounded-lg transition shadow-lg shadow-amber-900/20"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingId ? 'Update' : 'Create'} Room Type</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Room Types List */}
      {roomTypes.length === 0 ? (
        <div className="bg-white rounded-lg border border-stone-200 p-12 text-center">
          <Bed className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No room types found</h3>
          <p className="text-zinc-600 mb-6">Get started by creating your first room type</p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Room Type</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomTypes.map((roomType) => (
            <div key={roomType.id} className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 border-b border-amber-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-bold text-zinc-900 mb-1">{roomType.name}</h3>
                    <p className="text-sm text-zinc-600">Slug: {roomType.slug}</p>
                  </div>
                  <div className="bg-amber-200 rounded-lg p-2">
                    <Bed className="w-5 h-5 text-amber-700" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Description */}
                {roomType.description && (
                  <p className="text-sm text-zinc-600 mb-6 line-clamp-3">{roomType.description}</p>
                )}

                {/* Capacity */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-zinc-500" />
                      <p className="text-xs font-semibold text-zinc-600 uppercase">Adults</p>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900">{roomType.max_adults}</p>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-zinc-500" />
                      <p className="text-xs font-semibold text-zinc-600 uppercase">Children</p>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900">{roomType.max_children}</p>
                  </div>
                </div>

                {/* Total Capacity */}
                <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
                  <p className="text-xs font-semibold text-amber-900 mb-1">Total Capacity</p>
                  <p className="text-xl font-bold text-amber-700">
                    {roomType.max_adults + roomType.max_children} Guests
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-stone-200">
                  <button
                    onClick={() => handleEdit(roomType)}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-2.5 rounded-lg transition border border-amber-200"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(roomType.id, roomType.name)}
                    className="p-2.5 bg-stone-100 hover:bg-red-50 text-zinc-600 hover:text-red-700 rounded-lg transition border border-stone-200 hover:border-red-200"
                    title="Delete room type"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Created Date */}
                <div className="mt-4 pt-4 border-t border-stone-200">
                  <p className="text-xs text-zinc-500">
                    Created {formatDate(roomType.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

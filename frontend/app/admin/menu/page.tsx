'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Trash2, FileText, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getBackendUrl } from '@/lib/backend-url'

export default function AdminMenuPage() {
  const [menu, setMenu] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/admin/menu', {
        credentials: 'include',
        headers
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/admin/login'
          return
        }
        throw new Error('Failed to fetch menu')
      }

      const data = await response.json()
      if (data.success) {
        setMenu(data.menu)
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
      toast.error('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setUploading(true)

    try {
      const token = localStorage.getItem('adminToken')
      const formData = new FormData()
      formData.append('menu', file)

      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Menu uploaded successfully!')
        setMenu(data.menu)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Error uploading menu:', error)
      toast.error(error.message || 'Failed to upload menu')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the current menu?')) {
      return
    }

    setDeleting(true)

    try {
      const token = localStorage.getItem('adminToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/admin/menu', {
        method: 'DELETE',
        credentials: 'include',
        headers
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Menu deleted successfully')
        setMenu(null)
      } else {
        throw new Error(data.error || 'Delete failed')
      }
    } catch (error: any) {
      console.error('Error deleting menu:', error)
      toast.error(error.message || 'Failed to delete menu')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">Menu Management</h1>
            <p className="text-zinc-600">Upload and manage the restaurant menu PDF</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-zinc-900">Upload Menu PDF</h2>
            <p className="text-sm text-zinc-600">Upload a PDF file for the restaurant menu (max 10MB)</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-amber-400 transition-colors">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="menu-upload"
          />
          <label
            htmlFor="menu-upload"
            className={`inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold px-8 py-4 rounded-lg transition cursor-pointer ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Choose PDF File</span>
              </>
            )}
          </label>
          <p className="text-sm text-zinc-500 mt-4">Only PDF files are accepted</p>
        </div>
      </div>

      {/* Current Menu */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-zinc-600">Loading menu information...</p>
        </div>
      ) : menu ? (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-zinc-900 mb-1">Current Menu</h3>
                <p className="text-sm text-zinc-600 mb-2">Filename: {menu.filename}</p>
                {menu.uploadedAt && (
                  <p className="text-xs text-zinc-500">
                    Uploaded: {new Date(parseInt(menu.uploadedAt)).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`${getBackendUrl()}${menu.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-zinc-700 font-medium px-4 py-2 rounded-lg transition"
              >
                <Download className="w-4 h-4" />
                <span>View</span>
              </a>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <iframe
              src={`${getBackendUrl()}${menu.url}`}
              className="w-full h-[600px]"
              title="Menu Preview"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Menu Uploaded</h3>
          <p className="text-zinc-600 mb-6">
            Upload a PDF file to display the restaurant menu on the website.
          </p>
        </div>
      )}
    </div>
  )
}


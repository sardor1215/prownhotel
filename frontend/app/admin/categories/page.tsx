'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ArrowLeft, Loader2, Save, X } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface Category {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  })

  // Check if user is authenticated
  useEffect(() => {
    // Check if admin user exists in localStorage (set during login)
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      router.push('/admin/login?from=' + encodeURIComponent('/admin/categories'));
      return;
    }
  }, [router]);

  // Fetch categories
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      // Use Next.js API proxy route to include HttpOnly cookies
      const response = await fetch('/api/admin-panel/categories', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('adminUser');
        router.push('/admin/login?from=' + encodeURIComponent('/admin/categories'));
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (editingCategory) {
      setEditingCategory({
        ...editingCategory,
        [name]: value
      })
    } else {
      setNewCategory({
        ...newCategory,
        [name]: value
      })
    }
  }

  // Helper function to generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      // Use Next.js API proxy routes
      const url = editingCategory 
        ? `/api/admin-panel/categories/${editingCategory.id}`
        : '/api/admin-panel/categories'

      const method = editingCategory ? 'PUT' : 'POST'
      
      // Generate slug from name
      const categoryData = editingCategory 
        ? { ...editingCategory, slug: generateSlug(editingCategory.name) }
        : { ...newCategory, slug: generateSlug(newCategory.name) }

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(categoryData)
      })

      if (response.ok) {
        await fetchCategories()
        if (!editingCategory) {
          setNewCategory({ name: '', description: '' })
        }
        setEditingCategory(null)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      setError('Failed to save category')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      // Use Next.js API proxy route
      const response = await fetch(`/api/admin-panel/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        await fetchCategories()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      setError('Failed to delete category')
    }
  }

  const startEditing = (category: Category) => {
    setEditingCategory({ ...category })
  }

  const cancelEditing = () => {
    setEditingCategory(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add/Edit Category Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editingCategory ? editingCategory.name : newCategory.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Shower Cabins"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={editingCategory ? editingCategory.description : newCategory.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter a brief description"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingCategory ? (
                      'Update Category'
                    ) : (
                      'Add Category'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Categories List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">All Categories</h2>
              </div>
              {categories.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No categories found. Add your first category to get started.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <li key={category.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          {category.description && (
                            <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(category)}
                            className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                            title="Edit category"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
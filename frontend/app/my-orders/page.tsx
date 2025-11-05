'use client'

import React, { useState, useEffect } from 'react'
import { Package, Calendar, DollarSign, Eye, X, AlertCircle, Loader2 } from 'lucide-react'

interface Order {
  id: number
  total_amount: number
  status: string
  shipping_address: string
  payment_method: string
  created_at: string
  item_count: number
}

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
  main_image: string
}

interface OrderDetails extends Order {
  customer_name: string
  customer_email: string
  notes: string
  items: OrderItem[]
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchOrders()
  }, [currentPage])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to view your orders')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders)
      setTotalPages(data.pagination.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrderDetails = async (orderId: number) => {
    try {
      setIsLoadingDetails(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch order details')
      }

      const data = await response.json()
      setSelectedOrder(data.order)
    } catch (err) {
      console.error('Error fetching order details:', err)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const cancelOrder = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to cancel order')
      }

      // Refresh orders list
      fetchOrders()
      setSelectedOrder(null)
    } catch (err) {
      console.error('Error cancelling order:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your shower cabin orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <a
              href="/shop"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Total: </span>
                      <span className="font-semibold">${Number(order.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{order.item_count} item(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Payment: </span>
                      <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => fetchOrderDetails(order.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSelectedOrder(null)} />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id} Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoadingDetails ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
                  <p className="text-gray-600">Loading order details...</p>
                </div>
              ) : (
                <div className="p-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold mb-3">Order Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-600">Status:</span> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                          </span>
                        </div>
                        <div><span className="text-gray-600">Order Date:</span> {formatDate(selectedOrder.created_at)}</div>
                        <div><span className="text-gray-600">Payment Method:</span> {selectedOrder.payment_method.replace('_', ' ')}</div>
                        <div><span className="text-gray-600">Total Amount:</span> <span className="font-semibold">${Number(selectedOrder.total_amount).toFixed(2)}</span></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Customer Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-600">Name:</span> {selectedOrder.customer_name}</div>
                        <div><span className="text-gray-600">Email:</span> {selectedOrder.customer_email}</div>
                        <div><span className="text-gray-600">Shipping Address:</span> {selectedOrder.shipping_address}</div>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Notes</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <img
                            src={item.main_image || '/images/placeholder-shower.svg'}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                            <p className="text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${Number(item.price).toFixed(2)} each</p>
                            <p className="text-gray-600">${(Number(item.price) * item.quantity).toFixed(2)} total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedOrder.status === 'pending' && (
                    <div className="mt-6 pt-6 border-t">
                      <button
                        onClick={() => cancelOrder(selectedOrder.id)}
                        className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Cancel This Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

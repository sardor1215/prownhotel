'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { formatPrice } from '@/lib/format';
import { get, put } from '@/lib/api-utils';
import { API_URL } from '@/lib/api-config';
import { 
  ArrowLeft, 
  Package, 
  User, 
  Mail as MailIcon, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  Truck,
  Check,
  X,
  AlertCircle,
  Edit,
  Save,
  Mail,
  MailOpen
} from 'lucide-react';
import { getImageUrl } from '../../../utils/image';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  product_price: number | string;
  subtotal: number | string;
  price?: number | string;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

const isOrderStatus = (status: string): status is OrderStatus => {
  return ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].includes(status);
};

interface Order {
  id: number;
  email: string;
  phone: string;
  total_amount: number | string;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
  shipping_address: string;
  payment_method: string;
  customer_name: string;
  customer_email: string;
  notes?: string;
  is_read: boolean;
  items: OrderItem[];
}

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [error, setError] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  
  const handleStatusChange = (status: string) => {
    if (isOrderStatus(status)) {
      setNewStatus(status);
    } else {
      console.warn(`Invalid status received: ${status}`);
      setNewStatus('pending'); // Default to 'pending' if invalid status
    }
  };
  const [updating, setUpdating] = useState(false);

  // Parse and normalize order data from API with type safety
  const parseOrderData = (data: unknown): Order | null => {
    if (!data || typeof data !== 'object') return null;
    
    try {
      const orderData = data as Record<string, unknown>;
      
      // Parse items array with type safety
      const parseOrderItem = (item: unknown) => {
        if (!item || typeof item !== 'object') return null;
        const itemData = item as Record<string, unknown>;
        
        return {
          id: typeof itemData.id === 'number' ? itemData.id : 0,
          product_id: typeof itemData.product_id === 'number' ? itemData.product_id : 0,
          product_name: typeof itemData.product_name === 'string' ? itemData.product_name : '',
          product_image: typeof itemData.product_image === 'string' ? itemData.product_image : undefined,
          quantity: typeof itemData.quantity === 'number' ? itemData.quantity :
                   typeof itemData.quantity === 'string' ? parseInt(itemData.quantity, 10) || 0 : 0,
          product_price: typeof itemData.product_price === 'number' ? itemData.product_price :
                        typeof itemData.product_price === 'string' ? parseFloat(itemData.product_price) || 0 : 0,
          price: typeof itemData.price === 'number' ? itemData.price :
                typeof itemData.price === 'string' ? parseFloat(itemData.price) || 0 : 0,
          subtotal: typeof itemData.subtotal === 'number' ? itemData.subtotal :
                   typeof itemData.subtotal === 'string' ? parseFloat(itemData.subtotal) || 0 : 0
        };
      };

      // Parse the main order data
      const parsedOrder: Order = {
        id: typeof orderData.id === 'number' ? orderData.id : 0,
        email: typeof orderData.email === 'string' ? orderData.email : '',
        phone: typeof orderData.phone === 'string' ? orderData.phone : '',
        total_amount: typeof orderData.total_amount === 'number' ? orderData.total_amount :
                     typeof orderData.total_amount === 'string' ? parseFloat(orderData.total_amount) || 0 : 0,
        status: 'pending', // Will be set based on validation
        created_at: typeof orderData.created_at === 'string' ? orderData.created_at : new Date().toISOString(),
        updated_at: typeof orderData.updated_at === 'string' ? orderData.updated_at : undefined,
        shipping_address: typeof orderData.shipping_address === 'string' ? orderData.shipping_address : '',
        payment_method: typeof orderData.payment_method === 'string' ? orderData.payment_method : '',
        customer_name: typeof orderData.customer_name === 'string' ? orderData.customer_name : '',
        customer_email: typeof orderData.customer_email === 'string' ? orderData.customer_email : '',
        notes: typeof orderData.notes === 'string' ? orderData.notes : undefined,
        is_read: Boolean(orderData.is_read),
        items: Array.isArray(orderData.items) ?
          orderData.items.map(parseOrderItem).filter((item): item is NonNullable<typeof item> => item !== null) : []
      };
      
      // Validate and set status
      if (typeof orderData.status === 'string' && isOrderStatus(orderData.status)) {
        parsedOrder.status = orderData.status;
      }
      
      return parsedOrder;
    } catch (error) {
      console.error('Error parsing order data:', error);
      return null;
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const getStatusBadge = (status: OrderStatus) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium inline-flex items-center';
    switch (status) {
      case 'completed':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="inline w-4 h-4 mr-1" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <XCircle className="inline w-4 h-4 mr-1" />
            Cancelled
          </span>
        );
      case 'processing':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            <Loader2 className="inline w-4 h-4 mr-1 animate-spin" />
            Processing
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <Clock className="inline w-4 h-4 mr-1" />
            Pending
          </span>
        );
    }
  };



  const saveNotes = async () => {
    if (!order) return;
    
    setSavingNotes(true);
    setError('');
    
    try {
      await put(`/admin/orders/${order.id}/notes`, { notes });
      setOrder(prev => prev ? { ...prev, notes } : null);
      setEditingNotes(false);
    } catch (error) {
      console.error('Error saving notes:', error);
      setError('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const fetchOrder = async () => {
    try {
      const data = await get<{ order: Order }>(`/admin/orders/${orderId}`);
      const parsedOrder = parseOrderData(data.order);
      
      if (parsedOrder) {
        setOrder(parsedOrder);
        setNotes(parsedOrder.notes || '');
        setNewStatus(parsedOrder.status);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const data = await get<{ order: Order }>(`/admin/orders/${orderId}`);
      const parsedOrder = parseOrderData(data.order);
      if (parsedOrder) {
        setOrder(parsedOrder);
        setNewStatus(parsedOrder.status);
      } else {
        setError('Failed to parse order data');
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const refreshOrder = async () => {
    try {
      const data = await get<{ order: Order }>(`/admin/orders/${orderId}`);
      const parsedOrder = parseOrderData(data.order);
      if (parsedOrder) {
        setOrder(parsedOrder);
        // Ensure the status is valid before setting it
        if (isOrderStatus(parsedOrder.status)) {
          setNewStatus(parsedOrder.status);
        } else {
          console.warn(`Invalid status from server: ${parsedOrder.status}, defaulting to 'pending'`);
          setNewStatus('pending');
        }
      } else {
        setError('Failed to parse order data');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async () => {
    if (!order || !newStatus) return;
    
    setUpdating(true);
    setError('');
    
    try {
      await put(`/admin/orders/${order.id}/status`, { status: newStatus });
      setOrder(prev => prev ? { 
        ...prev, 
        status: newStatus,
        updated_at: new Date().toISOString()
      } : null);
      setIsEditingStatus(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption?.color || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
              <p className="text-gray-600">Order details and management</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Ordered on: {new Date(order.created_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }).replace(',', '')}
                  </p>
                </div>
                {!isEditingStatus && (
                  <button
                    onClick={() => setIsEditingStatus(true)}
                    className="text-primary-600 hover:text-primary-700 flex items-center gap-1 self-start"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              {isEditingStatus ? (
                <div className="flex items-center gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => handleStatusChange(e.target.value as string)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={updateOrderStatus}
                    disabled={updating}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    {updating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingStatus(false)
                      setNewStatus(order.status)
                    }}
                    className="text-gray-600 hover:text-gray-700 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {statusOptions.find(opt => opt.value === order.status)?.label || order.status}
                </span>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white border rounded-lg overflow-hidden flex-shrink-0">
                        {item.product_image ? (
                          <>
                            <div className="hidden">
                              Debug - Product Image: {JSON.stringify(item.product_image)}
                            </div>
                            <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg overflow-hidden">
                              <img 
                                src={getImageUrl(item.product_image)}
                                alt={item.product_name}
                                className="max-w-full max-h-full w-auto h-auto object-contain"
                                style={{ width: 'auto', height: 'auto' }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  console.error('Error loading image:', target.src);
                                  target.src = '/images/placeholder-shower.svg';
                                }}
                                onLoad={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  console.log('Image loaded successfully:', img.src, 'Dimensions:', img.naturalWidth, 'x', img.naturalHeight);
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(Number(item.subtotal) || 0, '₺')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(Number(item.product_price) || 0, '₺')} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-lg font-bold text-primary-600">{formatPrice(order.total_amount, '₺')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  main_image: string

}

export interface OrderData {
  email: string
  phone: string
  notes: string
  items: { product_id: number; quantity: number }[]
}

export interface SimpleOrderData {
  email: string
  phone: string
  notes: string
  items: { 
    product_id: number
    quantity: number
    product_name?: string
    price?: number
    subtotal?: number
  }[]
  total: number
}

// Get authentication token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// Cart API functions (for authenticated users)
export const cartApi = {
  async getCart(): Promise<{ cart: CartItem[]; total: number; itemCount: number }> {
    const token = getAuthToken()
    if (!token) throw new Error('Authentication required')

    const response = await fetch(`${API_BASE_URL}/api/orders/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch cart')
    }

    return response.json()
  },

  async addToCart(productId: number, quantity: number): Promise<void> {
    const token = getAuthToken()
    if (!token) throw new Error('Authentication required')

    const response = await fetch(`${API_BASE_URL}/api/orders/cart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: productId,
        quantity
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add to cart')
    }
  },

  async updateCartItem(cartId: number, quantity: number): Promise<void> {
    const token = getAuthToken()
    if (!token) throw new Error('Authentication required')

    const response = await fetch(`${API_BASE_URL}/api/orders/cart/${cartId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity })
    })

    if (!response.ok) {
      throw new Error('Failed to update cart item')
    }
  },

  async removeFromCart(cartId: number): Promise<void> {
    const token = getAuthToken()
    if (!token) throw new Error('Authentication required')

    const response = await fetch(`${API_BASE_URL}/api/orders/cart/${cartId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to remove item from cart')
    }
  },

  async checkout(orderData: OrderData): Promise<{ orderId: number; total: number }> {
    const token = getAuthToken()
    if (!token) throw new Error('Authentication required')

    const response = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shipping_address: `${orderData.email} - ${orderData.phone}`,
        payment_method: 'bank_transfer', // Default payment method
        notes: orderData.notes
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create order')
    }

    return response.json()
  }
}

// Simple cart API functions (for non-authenticated users)
export const simpleCartApi = {
  async submitOrder(orderData: SimpleOrderData): Promise<{ message: string; orderId: string }> {
    // Enrich items with product details
    const enrichedData = {
      ...orderData,
      items: orderData.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        product_name: item.product_name || `Product ${item.product_id}`,
        price: item.price || 0,
        subtotal: (item.price || 0) * item.quantity
      }))
    };

    const response = await fetch(`${API_BASE_URL}/cart/submit-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(enrichedData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit order')
    }

    return response.json()
  }
}

// Order management API functions
export const orderApi = {
  async getMyOrders(page: number = 1, limit: number = 10) {
    const token = getAuthToken()
    if (!token) throw new Error('Authentication required')

    const response = await fetch(`${API_BASE_URL}/api/orders/my-orders?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch orders')
    }

    return response.json()
  },

  async getOrderDetails(orderId: number) {
    const token = getAuthToken()
    if (!token) throw new Error('Authentication required')

    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch order details')
    }

    return response.json()
  },

  async cancelOrder(orderId: number) {
    const token = getAuthToken()
    if (!token) throw new Error('Authentication required')

    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to cancel order')
    }

    return response.json()
  }
}

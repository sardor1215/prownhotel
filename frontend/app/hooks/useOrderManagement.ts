'use client'

import { useState, useEffect } from 'react'
import { cartApi, simpleCartApi, orderApi } from '../utils/orderApi'

import { Product } from '../products/types'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  main_image: string
  cart_id?: number // For authenticated users
}

interface OrderData {
  email: string
  phone: string
  notes: string
  items: { product_id: number; quantity: number }[]
}

export function useOrderManagement() {
  // Initialize cart state with localStorage data immediately
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (!token) {
        // For guest users, load cart from localStorage immediately
        const guestCart = localStorage.getItem('guest_cart')
        if (guestCart) {
          try {
            return JSON.parse(guestCart)
          } catch {
            return []
          }
        }
      }
    }
    return []
  })
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token')
    }
    return false
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check authentication status and load authenticated cart if needed
  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    
    if (token) {
      // Load cart for authenticated users
      loadAuthenticatedCart()
    }
  }, [])

  // Persist guest cart to localStorage on change
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems))
    }
  }, [cartItems, isAuthenticated])

  const loadAuthenticatedCart = async () => {
    try {
      setIsLoading(true)
      const cartData = await cartApi.getCart()
      setCartItems(cartData.cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        main_image: item.main_image,
        cart_id: item.id // Store cart_id for updates/deletions
      })))
    } catch (err) {
      console.error('Error loading cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cart')
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      setError(null)
      
      if (isAuthenticated) {
        // Authenticated user: use backend cart
        await cartApi.addToCart(product.id, quantity)
        await loadAuthenticatedCart() // Reload cart
      } else {
        // Non-authenticated user: use local cart
        setCartItems(prev => {
          const existingItem = prev.find(item => item.id === product.id)
          if (existingItem) {
            return prev.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          } else {
            return [...prev, {
              id: product.id,
              name: product.name,
              price: product.price,
              quantity,
              main_image: product.main_image
            }]
          }
        })
      }
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart')
      return false
    }
  }

  const updateCartQuantity = async (id: number, quantity: number) => {
    try {
      setError(null)
      
      if (isAuthenticated) {
        const item = cartItems.find(item => item.id === id)
        if (item?.cart_id) {
          await cartApi.updateCartItem(item.cart_id, quantity)
          await loadAuthenticatedCart()
        }
      } else {
        setCartItems(prev =>
          prev.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart')
    }
  }

  const removeFromCart = async (id: number) => {
    try {
      setError(null)
      
      if (isAuthenticated) {
        const item = cartItems.find(item => item.id === id)
        if (item?.cart_id) {
          await cartApi.removeFromCart(item.cart_id)
          await loadAuthenticatedCart()
        }
      } else {
        setCartItems(prev => prev.filter(item => item.id !== id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from cart')
    }
  }

  const submitOrder = async (orderData: OrderData) => {
    try {
      setError(null)
      setIsLoading(true)
      
      if (isAuthenticated) {
        // Authenticated user: use checkout endpoint
        const result = await cartApi.checkout(orderData)
        setCartItems([]) // Clear cart on success
        return { success: true, orderId: result.orderId.toString(), total: result.total }
      } else {
        // Non-authenticated user: use simple order submission
        // Calculate total from cart items
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const simpleOrderData = {
          ...orderData,
          total,
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            product_name: item.name,
            price: item.price,
            subtotal: item.price * item.quantity
          }))
        };
        const result = await simpleCartApi.submitOrder(simpleOrderData);
        setCartItems([]); // Clear cart on success
        return { success: true, orderId: result.orderId, message: result.message };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit order')
      return { success: false, error: err instanceof Error ? err.message : 'Failed to submit order' }
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  return {
    cartItems,
    isAuthenticated,
    isLoading,
    error,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    submitOrder,
    clearCart,
    getCartTotal,
    getCartItemCount,
    refreshCart: isAuthenticated ? loadAuthenticatedCart : () => {}
  }
}

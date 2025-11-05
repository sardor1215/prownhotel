import { useState, useEffect } from 'react';
import { Product } from '../app/products/types';

interface CartItem extends Product {
  quantity: number;
}

export function useOrderManagement() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse cart from localStorage', err);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      setError(null);
      
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);
        
        if (existingItem) {
          // Update quantity if item already in cart
          return prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item to cart
          return [...prevCart, { ...product, quantity }];
        }
      });
      
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart');
      return false;
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const submitOrder = async (orderData: {
    email: string;
    phone: string;
    notes: string;
    items: { 
      product_id: number; 
      quantity: number;
      product_name?: string;
      price?: number;
    }[];
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Enrich items with product details from the cart
      const itemsWithDetails = orderData.items.map(item => {
        const cartItem = cart.find(ci => ci.id === item.product_id);
        return {
          ...item,
          product_name: cartItem?.name || '',
          price: cartItem?.price || 0,
          subtotal: (cartItem?.price || 0) * item.quantity
        };
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          items: itemsWithDetails,
          total: getCartTotal(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      const data = await response.json();
      
      // Clear cart on successful order
      if (data.success) {
        clearCart();
      }
      
      return data;
    } catch (err: unknown) {
      console.error('Order submission error:', err);
      setError('Failed to submit order. Please try again.');
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cart,
    isCartOpen,
    isCheckoutOpen,
    isLoading,
    error,
    cartItemCount: getCartItemCount(),
    cartTotal: getCartTotal(),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    submitOrder,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    openCheckout: () => setIsCheckoutOpen(true),
    closeCheckout: () => setIsCheckoutOpen(false),
  };
}

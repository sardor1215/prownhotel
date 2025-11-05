'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import { X } from 'lucide-react';

import { useOrderManagement } from '../hooks/useOrderManagement';
import { Pagination } from '../components/ui/Pagination';
import Navbar from '../components/Navbar';
import Cart from '../components/Cart';
import CheckoutForm from '../components/CheckoutForm';
import { Product, User, ViewMode, SortOption } from './types';
import { ProductFilters } from './components/ProductFilters';
import { ProductList } from './components/ProductList';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    getCartItemCount, 
    submitOrder 
  } = useOrderManagement();

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        setSearchTerm(searchValue);
        setCurrentPage(1);
      }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          per_page: PRODUCTS_PER_PAGE.toString(),
          ...(searchTerm && { q: searchTerm }),
          ...(selectedCategory && { category: selectedCategory }),
          sort: sortBy,
        });

        const response = await fetch(`${API_BASE_URL}/products?${params}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(Math.ceil(data.total / PRODUCTS_PER_PAGE));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory, sortBy]);

  // Update URL with search and filter parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'name-asc') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '/';
    window.history.replaceState({}, '', newUrl);
  }, [searchTerm, selectedCategory, sortBy, currentPage]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Authentication functions
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  const handleSubmitOrder = async (orderData: {
    email: string;
    phone: string;
    notes: string;
    items: { product_id: number; quantity: number }[];
  }) => {
    try {
      await submitOrder(orderData);
      setIsCheckoutOpen(false);
      setNotification({
        message: 'Your order has been placed successfully!',
        type: 'success',
      });
    } catch (error) {
      setNotification({
        message: 'Failed to place order. Please try again.',
        type: 'error',
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    try {
      setIsAddingToCart(product.id);
      addToCart(product);
      
      setNotification({
        message: `${product.name} added to cart`,
        type: 'success',
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        message: 'Failed to add item to cart',
        type: 'error',
      });
    } finally {
      setTimeout(() => setIsAddingToCart(null), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
        cartItemCount={getCartItemCount()}
        onCartOpen={() => setIsCartOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        {notification && (
          <div className={`mb-6 p-4 rounded-md ${
            notification.type === 'error' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {notification.message}
          </div>
        )}

        <ProductFilters
          searchTerm={searchTerm}
          viewMode={viewMode}
          sortBy={sortBy}
          productsCount={products.length}
          categories={categories}
          selectedCategory={selectedCategory}
          onSearchChange={handleSearchChange}
          onViewModeChange={setViewMode}
          onSortChange={handleSortChange}
          onCategoryChange={handleCategoryChange}
          onResetFilters={resetFilters}
        />

        <ProductList
          products={products}
          loading={loading}
          error={error}
          viewMode={viewMode}
          isAddingToCart={isAddingToCart}
          onAddToCart={handleAddToCart}
        />

        {!loading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Form */}
      <CheckoutForm
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSubmitOrder={handleSubmitOrder}
        items={cartItems}
      />
    </div>
  );
}

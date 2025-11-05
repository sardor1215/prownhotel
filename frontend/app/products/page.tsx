'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, AlertCircle, ShoppingCart, X, Filter as FilterIcon } from 'lucide-react';
import { Pagination } from '../../components/Pagination';
import { ProductsGridSkeleton } from '../../components/ProductsGridSkeleton';
import { ProductCard } from '../components/products/ProductCard';
import { CategorySidebar } from '../components/products/CategorySidebar';
import Navbar from '../components/Navbar';
import Cart from '../components/Cart';
import CheckoutForm from '../components/CheckoutForm';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { Product } from './types';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Cart management
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    getCartItemCount, 
    submitOrder 
  } = useOrderManagement();
  
  const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);

  // Authentication functions
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.reload();
  };

  const handleSubmitOrder = async (orderData: {
    email: string;
    phone: string;
    notes: string;
    items: { product_id: number; quantity: number }[];
  }) => {
    const result = await submitOrder(orderData);
    if (result.success) {
      setIsCheckoutOpen(false);
      setNotification({ message: `Order submitted successfully! Order ID: ${result.orderId}`, type: 'success' });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setNotification({ message: `Failed to submit order: ${result.error}`, type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (isAddingToCart === product.id) return;
    
    setIsAddingToCart(product.id);
    try {
      const success = await addToCart({
        ...product
      });
      
      if (success) {
        setNotification({ message: `${product.name} sepete eklendi`, type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({ message: 'Ürün sepete eklenemedi', type: 'error' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification({ message: 'Sepete eklenirken bir hata oluştu', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsAddingToCart(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); 
      } else {
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, currentPage]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin-panel/categories`);
        if (response.ok) {
          const data = await response.json();
          // Extract categories array from the response and map to names
          setCategories(data.categories.map((cat: { name: string }) => cat.name));
        } else {
          console.error('Categories response not ok:', response.status, response.statusText);
        }
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        setError('Kategoriler yüklenirken bir hata oluştu');
        setNotification({ message: 'Kategoriler yüklenirken bir hata oluştu', type: 'error' });
        setTimeout(() => setNotification(null), 3000);
      }
    };

    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: PRODUCTS_PER_PAGE.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Ürünler yüklenirken bir hata oluştu');
      setNotification({ message: 'Ürünler yüklenirken bir hata oluştu', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
        cartItemCount={getCartItemCount()}
        onCartOpen={() => setIsCartOpen(true)}
      />

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}

      {/* Page Title */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tüm Ürünler</h1>
          <p className="text-gray-600">Premium duş çözümlerimizin tamamını keşfedin</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Category Sidebar */}
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            products={products}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />
          
          {/* Products Grid */}
          <div className="flex-1">
            {/* View Toggle and Filter */}
            <div className="flex justify-between items-center mb-6">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FilterIcon className="w-4 h-4" />
                <span>Filtreler</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden md:inline">Görünüm</span>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                    aria-label="Grid view"
                  >
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                      <div className="bg-gray-600 rounded-sm"></div>
                      <div className="bg-gray-600 rounded-sm"></div>
                      <div className="bg-gray-600 rounded-sm"></div>
                      <div className="bg-gray-600 rounded-sm"></div>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                    aria-label="List view"
                  >
                    <div className="w-4 h-4 flex flex-col justify-between">
                      <div className="h-1 w-full bg-gray-600 rounded-sm"></div>
                      <div className="h-1 w-full bg-gray-600 rounded-sm"></div>
                      <div className="h-1 w-3/4 bg-gray-600 rounded-sm"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Error State */}
            {error ? (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 text-lg font-medium mb-2">Bir hata oluştu</p>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => {
                    setError(null);
                    fetchProducts();
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : loading ? (
              <ProductsGridSkeleton count={PRODUCTS_PER_PAGE} />
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium mb-2">Ürün bulunamadı</p>
                <p className="text-gray-400 text-sm">Arama kriterlerinizi değiştirmeyi deneyin</p>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleAddToCart}
                      isAddingToCart={isAddingToCart === product.id}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Cart Component */}
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
        items={cartItems}
        onSubmitOrder={handleSubmitOrder}
      />
    </div>
  );
}

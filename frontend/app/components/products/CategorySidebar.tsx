'use client';

import { useState, useEffect } from 'react';
import { X, Filter as FilterIcon, Search } from 'lucide-react';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

interface CategorySidebarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  products: any[];
  isOpen?: boolean;
  onClose?: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function CategorySidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  products,
  isOpen = false,
  onClose = () => {},
}: CategorySidebarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [totalProductsCount, setTotalProductsCount] = useState(0);

  // Fetch category counts independently
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        // Fetch all products to get accurate counts
        const response = await fetch(`${API_BASE_URL}/products?limit=1000`);
        if (response.ok) {
          const data = await response.json();
          const allProducts = data.products || [];
          
          // Calculate counts from all products
          const counts = categories.reduce((acc, category) => {
            const count = allProducts.filter((p: any) => p.category_name === category).length;
            return { ...acc, [category]: count };
          }, {} as Record<string, number>);
          
          setCategoryCounts(counts);
          setTotalProductsCount(allProducts.length);
        }
      } catch (error) {
        console.error('Error fetching category counts:', error);
      }
    };

    if (categories.length > 0) {
      fetchCategoryCounts();
    }
  }, [categories]);

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.category-sidebar') && !target.closest('.filter-button')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile, onClose]);

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
            <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white p-4 overflow-y-auto category-sidebar">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filtreler</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    onCategoryChange('');
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === ''
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>Tüm Ürünler</span>
                    <span className="text-sm text-gray-500">{totalProductsCount}</span>
                  </div>
                </button>

                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      onCategoryChange(category);
                      onClose();
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="truncate">{category}</span>
                      <span className="text-sm text-gray-500">{categoryCounts[category] || 0}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop view
  return (
    <div className="w-64 shrink-0 pr-6">
      <div className="sticky top-24 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Kategoriler</h3>
        
        <div>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-1">
            <button
              onClick={() => onCategoryChange('')}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                selectedCategory === ''
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>Tüm Ürünler</span>
                <span className="text-sm text-gray-500">{totalProductsCount}</span>
              </div>
            </button>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="truncate">{category}</span>
                  <span className="text-sm text-gray-500">{categoryCounts[category] || 0}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategorySidebar;

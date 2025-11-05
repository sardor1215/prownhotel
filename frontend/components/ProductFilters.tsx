'use client';

import { Search, Grid, List, X } from 'lucide-react';
import { ViewMode, SortOption } from '../app/products/types';

interface ProductFiltersProps {
  searchTerm: string;
  viewMode: ViewMode;
  sortBy: SortOption;
  productsCount: number;
  categories: string[];
  selectedCategory: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: SortOption) => void;
  onCategoryChange: (category: string) => void;
  onResetFilters: () => void;
}

export function ProductFilters({
  searchTerm,
  viewMode,
  sortBy,
  productsCount,
  categories,
  selectedCategory,
  onSearchChange,
  onViewModeChange,
  onSortChange,
  onCategoryChange,
  onResetFilters,
}: ProductFiltersProps) {
  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'rating-desc', label: 'Highest Rated' },
  ] as const;

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Our Products</h1>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={onSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            {productsCount} {productsCount === 1 ? 'product' : 'products'} found
          </span>
          
          {(searchTerm || selectedCategory) && (
            <button
              onClick={onResetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Reset filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category:
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 border border-gray-300 rounded-md p-1">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
              title="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

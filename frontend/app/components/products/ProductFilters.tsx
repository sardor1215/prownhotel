import React from 'react';
import { Search, Filter } from 'lucide-react';

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  currentView: 'grid' | 'list';
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  onViewChange,
  currentView,
}) => {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Ürün ara..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm text-gray-600 whitespace-nowrap">Filtreler</span>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-sm border border-gray-300 rounded px-3 py-2 bg-white min-w-[180px]"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">Görünüm</span>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => onViewChange('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                currentView === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
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
              onClick={() => onViewChange('list')}
              className={`p-1.5 rounded-md transition-colors ${
                currentView === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
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
    </div>
  );
};

export default ProductFilters;

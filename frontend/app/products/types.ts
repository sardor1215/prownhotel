export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  main_image: string;
  category_name: string;
  average_rating: number;
  review_count: number;
  specifications?: Record<string, any>;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export type ViewMode = 'grid' | 'list';

export const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
  { value: 'rating-desc', label: 'Highest Rated' },
] as const;

export type SortOption = typeof SORT_OPTIONS[number]['value'];

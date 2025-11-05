export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  main_image: string;
  category_name: string;
  average_rating: number;
  review_count: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface OrderData {
  email: string;
  phone: string;
  notes: string;
  items: { product_id: number; quantity: number }[];
}

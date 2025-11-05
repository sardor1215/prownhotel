"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, PlusCircle, Eye, Pencil, Trash } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number | string;
  main_image: string;
  category_id: number | null;
  category_name: string | null;
  specifications?: any;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Redirect this page away to dashboard (page deprecated)
  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  // Render nothing while redirecting
  return null;

  // Verify session via backend using cookie-based auth
  const checkAuth = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE_URL}/admin-auth/verify`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data?.valid && data?.admin) {
        setAdminUser(data.admin);
      } else {
        router.push('/admin/login');
      }
    } catch (e) {
      router.push('/admin/login');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching products from: /api/admin-panel/products");
      const res = await fetch('/api/admin-panel/products', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include'
      });

      console.log("Response status:", res.status);
      
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
          console.error("Error response:", errorData);
        } catch (e) {
          console.error("Failed to parse error response");
          errorData = { message: res.statusText };
        }
        
        console.error("Failed to fetch products:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData
        });
        
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        
        throw new Error(errorData.message || `Failed to fetch products: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Products data received:", data);
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error in fetchProducts:", err);
      // Show error to user with proper type checking
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      alert(`Error loading products: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (adminUser) fetchProducts();
  }, [adminUser]);

  // Unreachable legacy UI removed; page intentionally blank
  // (Keeping code minimal to effectively delete this page)
}

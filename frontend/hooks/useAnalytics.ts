import { useState, useEffect, useCallback } from 'react';
import { handleApiResponse, handleApiError } from '@/lib/api-utils';
import { 
  ProductSales, 
  VisitorStats, 
  SalesStats, 
  TimeFilter 
} from '@/types/analytics';

interface AnalyticsData {
  productSales: ProductSales[];
  visitorStats: VisitorStats[];
  salesStats: SalesStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalytics(timeFilter: TimeFilter = 'weekly'): AnalyticsData {
  const [productSales, setProductSales] = useState<ProductSales[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats[]>([]);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      } as const;

      // Create a function to handle each API request with proper typing
      const fetchWithRetry = async <T>(
        endpoint: string,
        options: RequestInit
      ): Promise<T> => {
        try {
          const response = await fetch(endpoint, options);
          return await handleApiResponse<T>(response);
        } catch (error) {
          console.error(`Error fetching ${endpoint}:`, error);
          throw error;
        }
      };

      // Fetch all data in parallel with retry logic
      const [productSalesData, visitorStatsData, salesStatsData] = await Promise.allSettled([
        fetchWithRetry<ProductSales[]>(
          `/api/admin/analytics?path=product-sales&period=${timeFilter}`, 
          { headers }
        ),
        fetchWithRetry<VisitorStats[]>(
          `/api/admin/analytics?path=visitors&period=${timeFilter}`, 
          { headers }
        ),
        fetchWithRetry<SalesStats>(
          `/api/admin/analytics/overview?period=${timeFilter}`, 
          { headers }
        )
      ]);

      // Process the results
      const errors: string[] = [];
      
      if (productSalesData.status === 'fulfilled') {
        setProductSales(productSalesData.value);
      } else {
        errors.push('Failed to load product sales data');
        console.error('Product sales error:', productSalesData.reason);
      }

      if (visitorStatsData.status === 'fulfilled') {
        setVisitorStats(visitorStatsData.value);
      } else {
        errors.push('Failed to load visitor statistics');
        console.error('Visitor stats error:', visitorStatsData.reason);
      }

      if (salesStatsData.status === 'fulfilled') {
        setSalesStats(salesStatsData.value);
      } else {
        errors.push('Failed to load sales statistics');
        console.error('Sales stats error:', salesStatsData.reason);
      }

      if (errors.length > 0) {
        throw new Error(errors.join('; '));
      }
    } catch (err) {
      console.error('Error in fetchAnalyticsData:', err);
      try {
        await handleApiError(err);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load analytics data');
      }
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    productSales,
    visitorStats,
    salesStats,
    loading,
    error,
    refetch: fetchAnalyticsData
  };
}

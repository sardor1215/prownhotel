'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Loader2, 
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { useAnalytics } from '@/hooks/useAnalytics';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

type TimeFilter = 'daily' | 'weekly' | 'monthly';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  loading = false,
}: {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  loading?: boolean;
}) => (
  <Card className="flex-1 min-w-[200px]">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="w-4 h-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-8 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          {change !== undefined && (
            <div 
              className={`text-xs mt-1 flex items-center ${
                change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {change >= 0 ? (
                <ArrowUp className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(change)}% from last period
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

const TimeFilterButtons = ({
  activeFilter,
  onFilterChange,
  loading = false,
}: {
  activeFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
  loading?: boolean;
}) => (
  <div className="flex items-center space-x-2">
    {(['daily', 'weekly', 'monthly'] as const).map((filter) => (
      <Button
        key={filter}
        variant={activeFilter === filter ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange(filter)}
        disabled={loading}
        className="capitalize"
      >
        {filter}
      </Button>
    ))}
    <Button
      variant="outline"
      size="sm"
      onClick={() => onFilterChange(activeFilter)}
      disabled={loading}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  </div>
);

export function AnalyticsDashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('weekly');
  const { 
    productSales, 
    visitorStats, 
    salesStats, 
    loading, 
    error, 
    refetch 
  } = useAnalytics(timeFilter);

  // Format data for charts
  const salesChartData = useMemo(() => {
    if (!visitorStats?.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: visitorStats.map(stat => {
        const date = new Date(stat.date);
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }),
      datasets: [
        {
          label: 'Visitors',
          data: visitorStats.map(stat => stat.visitors || 0),
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Page Views',
          data: visitorStats.map(stat => stat.page_views || 0),
          borderColor: 'rgba(236, 72, 153, 1)',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y1',
        },
      ],
    };
  }, [visitorStats]);

  const topProductsData = useMemo(() => {
    if (!productSales?.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const topProducts = [...productSales]
      .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
      .slice(0, 5);

    return {
      labels: topProducts.map(p => p.name || 'Unknown'),
      datasets: [
        {
          label: 'Sales Count',
          data: topProducts.map(p => p.sales_count || 0),
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(14, 165, 233, 0.7)'
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(14, 165, 233, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [productSales]);

  const lineChartOptions = useMemo<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          drawOnChartArea: false,
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }), []);

  const barChartOptions = useMemo<ChartOptions<'bar'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        beginAtZero: true,
        grid: {
          drawOnChartArea: true,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }), []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Error loading analytics</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={refetch} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your store's performance and customer insights
          </p>
        </div>
        <TimeFilterButtons
          activeFilter={timeFilter}
          onFilterChange={setTimeFilter}
          loading={loading}
        />
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={salesStats ? formatCurrency(salesStats.total_revenue) : 'N/A'}
          change={salesStats?.growth_rate}
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={salesStats ? formatNumber(salesStats.total_orders) : 'N/A'}
          change={salesStats?.growth_rate}
          icon={ShoppingCart}
          loading={loading}
        />
        <StatCard
          title="Avg. Order Value"
          value={salesStats ? formatCurrency(salesStats.avg_order_value) : 'N/A'}
          change={salesStats?.growth_rate}
          icon={BarChart3}
          loading={loading}
        />
        <StatCard
          title="Total Visitors"
          value={visitorStats?.length ? formatNumber(visitorStats.reduce((sum, stat) => sum + (stat.visitors || 0), 0)) : 'N/A'}
          icon={Users}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
            <CardDescription>Visitor and page view trends</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Line data={salesChartData} options={lineChartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products by units sold</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Bar data={topProductsData} options={barChartOptions} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : productSales?.length ? (
            <div className="border rounded-md">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Quantity</div>
                <div className="col-span-3 text-right">Revenue</div>
              </div>
              {productSales.slice(0, 5).map((product) => (
                <div key={product.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0">
                  <div className="col-span-5 font-medium">{product.name}</div>
                  <div className="col-span-2 text-right">
                    {formatCurrency(product.total_revenue / (product.sales_count || 1))}
                  </div>
                  <div className="col-span-2 text-right">
                    {formatNumber(product.sales_count)}
                  </div>
                  <div className="col-span-3 text-right font-medium">
                    {formatCurrency(product.total_revenue)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No order data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsDashboard;

export interface ProductSales {
  id: number;
  name: string;
  sales_count: number;
  total_revenue: number;
  category: string;
}

export interface VisitorStats {
  date: string;
  visitors: number;
  page_views: number;
  unique_visitors: number;
}

export interface SalesStats {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  growth_rate: number;
  top_products: Array<{
    id: number;
    name: string;
    sales_count: number;
  }>;
}

export type TimeFilter = 'daily' | 'weekly' | 'monthly';

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    tension?: number;
    fill?: boolean;
    yAxisID?: string;
  }>;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      position?: 'top' | 'bottom' | 'left' | 'right' | 'chartArea' | { [key: string]: number };
      labels?: {
        color?: string;
        font?: {
          size?: number;
          weight?: string | number;
        };
        padding?: number;
        usePointStyle?: boolean;
        boxWidth?: number;
      };
    };
    title?: {
      display?: boolean;
      text?: string;
      color?: string;
      font?: {
        size?: number;
        weight?: string | number;
      };
      padding?: {
        top?: number;
        bottom?: number;
      };
    };
    tooltip?: {
      enabled?: boolean;
      mode?: 'point' | 'nearest' | 'index' | 'dataset' | 'x' | 'y' | 'point';
      intersect?: boolean;
      backgroundColor?: string;
      titleColor?: string;
      bodyColor?: string;
      borderColor?: string;
      borderWidth?: number;
      padding?: number;
      displayColors?: boolean;
      callbacks?: {
        label?: (context: any) => string | string[];
        title?: (context: any) => string | string[];
      };
    };
  };
  scales?: {
    x?: {
      grid?: {
        display?: boolean;
        color?: string;
        borderColor?: string;
        borderWidth?: number;
        drawBorder?: boolean;
        drawOnChartArea?: boolean;
        drawTicks?: boolean;
        tickLength?: number;
      };
      ticks?: {
        color?: string;
        font?: {
          size?: number;
          weight?: string | number;
        };
        maxRotation?: number;
        minRotation?: number;
        padding?: number;
      };
    };
    y?: {
      beginAtZero?: boolean;
      grid?: {
        display?: boolean;
        color?: string;
        borderColor?: string;
        borderWidth?: number;
        drawBorder?: boolean;
        drawOnChartArea?: boolean;
        drawTicks?: boolean;
        tickLength?: number;
      };
      ticks?: {
        color?: string;
        font?: {
          size?: number;
          weight?: string | number;
        };
        padding?: number;
        callback?: (value: any) => string;
      };
      title?: {
        display?: boolean;
        text?: string | string[];
        color?: string;
        font?: {
          size?: number;
          weight?: string | number;
        };
      };
    };
  };
  interaction?: {
    intersect?: boolean;
    mode?: 'point' | 'nearest' | 'index' | 'dataset' | 'x' | 'y' | 'point';
  };
}

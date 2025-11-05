import { ChartData, ChartOptions } from '@/types/analytics';
import { TimeFilter } from '@/types/analytics';

const CHART_COLORS = {
  primary: 'rgba(99, 102, 241, 1)',
  primaryLight: 'rgba(99, 102, 241, 0.2)',
  secondary: 'rgba(236, 72, 153, 1)',
  secondaryLight: 'rgba(236, 72, 153, 0.2)',
  success: 'rgba(16, 185, 129, 1)',
  successLight: 'rgba(16, 185, 129, 0.2)',
  warning: 'rgba(245, 158, 11, 1)',
  warningLight: 'rgba(245, 158, 11, 0.2)',
  info: 'rgba(14, 165, 233, 1)',
  infoLight: 'rgba(14, 165, 233, 0.2)',
  gray: 'rgba(156, 163, 175, 1)',
  grayLight: 'rgba(243, 244, 246, 1)',
} as const;

export const getChartOptions = (timeFilter: TimeFilter): ChartOptions => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: CHART_COLORS.gray,
        font: {
          size: 12,
          weight: '500',
        },
        padding: 20,
        usePointStyle: true,
        boxWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: 'white',
      titleColor: CHART_COLORS.gray,
      bodyColor: 'black',
      borderColor: CHART_COLORS.grayLight,
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          return `${label}: ${value.toLocaleString()}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: CHART_COLORS.gray,
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: CHART_COLORS.grayLight,
        drawBorder: false,
      },
      ticks: {
        color: CHART_COLORS.gray,
        font: {
          size: 11,
        },
        padding: 8,
        callback: (value) => {
          if (typeof value === 'number') {
            return value >= 1000 ? `${value / 1000}k` : value;
          }
          return value;
        },
      },
    },
  },
});

export const getSalesChartData = (visitorStats: any[], timeFilter: TimeFilter): ChartData => {
  if (!visitorStats?.length) {
    return {
      labels: [],
      datasets: [],
    };
  }

  return {
    labels: visitorStats.map((stat) => {
      const date = new Date(stat.date);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      switch (timeFilter) {
        case 'daily':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'weekly':
          return `Week ${getISOWeekNumber(date)}, ${date.getFullYear()}`;
        case 'monthly':
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        default:
          return date.toLocaleDateString();
      }
    }),
    datasets: [
      {
        label: 'Visitors',
        data: visitorStats.map((stat) => stat.visitors || 0),
        borderColor: CHART_COLORS.primary,
        backgroundColor: CHART_COLORS.primaryLight,
        tension: 0.3,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Page Views',
        data: visitorStats.map((stat) => stat.page_views || 0),
        borderColor: CHART_COLORS.secondary,
        backgroundColor: CHART_COLORS.secondaryLight,
        tension: 0.3,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  };
};

export const getTopProductsChartData = (productSales: any[]): ChartData => {
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
    labels: topProducts.map((product) => product.name || 'Unknown'),
    datasets: [
      {
        label: 'Sales Count',
        data: topProducts.map((product) => product.sales_count || 0),
        backgroundColor: [
          CHART_COLORS.primaryLight,
          CHART_COLORS.secondaryLight,
          CHART_COLORS.successLight,
          CHART_COLORS.warningLight,
          CHART_COLORS.infoLight,
        ],
        borderColor: [
          CHART_COLORS.primary,
          CHART_COLORS.secondary,
          CHART_COLORS.success,
          CHART_COLORS.warning,
          CHART_COLORS.info,
        ],
        borderWidth: 1,
      },
    ],
  };
};

// Function to get ISO week number
function getISOWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  // January 4 is always in week 1
  const week1 = new Date(d.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

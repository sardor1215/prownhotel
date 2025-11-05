/**
 * Format a number as currency
 */
export function formatCurrency(amount: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number = 0): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format a date string
 */
export function formatDate(dateString: string, formatStr = 'MMM d, yyyy'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Truncate text to a certain length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

/**
 * Calculate percentage change between two numbers
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

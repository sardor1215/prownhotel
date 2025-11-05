/**
 * Safely formats a number to a string with 2 decimal places
 * Handles null, undefined, and string inputs
 */
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

/**
 * Formats a number as currency with the specified symbol
 */
export const formatPrice = (value: number | string | null | undefined, currency: string = '$'): string => {
  return `${currency}${formatCurrency(value)}`;
};

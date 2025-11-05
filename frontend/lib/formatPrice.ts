/**
 * Format price in British Pounds
 * @param price - The price value (number or string)
 * @returns Formatted price string with £ symbol
 */
export function formatPrice(price: number | string | undefined | null): string {
  if (price === undefined || price === null || price === '') {
    return '£0.00'
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numPrice)) {
    return '£0.00'
  }

  // Format as British pounds with 2 decimal places
  return `£${numPrice.toFixed(2)}`
}

/**
 * Format price with currency symbol inline
 * @param price - The price value (number or string)
 * @returns Formatted price string with £ symbol
 */
export function formatPriceGBP(price: number | string | undefined | null): string {
  return formatPrice(price)
}



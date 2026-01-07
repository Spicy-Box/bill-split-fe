/**
 * Format currency value with Vietnamese locale, no decimal places (rounded up)
 * @param value - The numeric value to format
 * @returns Formatted string with no decimal places
 */
export function formatCurrency(value: number): string {
  // Round up to nearest integer
  const rounded = Math.ceil(value);
  return rounded.toLocaleString("vi-VN");
}

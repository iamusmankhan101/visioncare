/**
 * Formats a price value with the PKR currency symbol
 * @param {number} price - The price value to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted price with PKR currency
 */
const formatPrice = (price, decimals = 0) => {
  if (typeof price !== 'number') {
    // Try to convert to number if it's not already
    price = parseFloat(price) || 0;
  }
  
  return `PKR ${price.toFixed(decimals)}`;
};

export default formatPrice;
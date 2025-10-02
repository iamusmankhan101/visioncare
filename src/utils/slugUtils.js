/**
 * Utility functions for creating and handling URL slugs
 */

/**
 * Generate a URL-friendly slug from a product name
 * @param {string} name - Product name
 * @returns {string} - URL-friendly slug
 */
export const generateSlug = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

/**
 * Generate a unique slug using only the product name (no ID)
 * @param {string} name - Product name
 * @param {number|string} id - Product ID (kept for backward compatibility but not used in URL)
 * @returns {string} - URL-friendly slug based on product name only
 */
export const generateUniqueSlug = (name, id) => {
  if (!name) {
    console.warn('generateUniqueSlug: Missing product name', { name, id });
    return 'unknown-product';
  }
  
  // Generate slug from name only (no ID appended)
  const slug = generateSlug(name);
  
  // If slug is empty after processing, use fallback
  if (!slug) {
    return 'product';
  }
  
  return slug;
};

/**
 * Extract product ID from a slug that includes ID
 * @param {string} slug - URL slug with ID
 * @returns {string|number|null} - Extracted product ID or null if not found
 */
export const extractIdFromSlug = (slug) => {
  if (!slug) return null;
  
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Try to parse as number first (for numeric IDs)
  const numericId = parseInt(lastPart);
  if (!isNaN(numericId)) {
    return numericId;
  }
  
  // If not a number, return as string (for ObjectIds, UUIDs, etc.)
  if (lastPart && lastPart.length > 0) {
    return lastPart;
  }
  
  return null;
};

/**
 * Check if a product matches a given slug
 * @param {Object} product - Product object
 * @param {string} slug - URL slug to match
 * @returns {boolean} - Whether the product matches the slug
 */
export const productMatchesSlug = (product, slug) => {
  if (!product || !slug) return false;
  
  // Generate slug from product name and compare
  const productSlug = generateUniqueSlug(product.name);
  if (productSlug === slug) return true;
  
  // Fallback: try to match by name directly (case-insensitive)
  if (product.name) {
    const normalizedProductName = product.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    const normalizedSlug = slug.toLowerCase();
    if (normalizedProductName === normalizedSlug) return true;
  }
  
  // Legacy support: try to extract ID from slug and match (for old URLs)
  const extractedId = extractIdFromSlug(slug);
  if (extractedId) {
    const productId = product.id || product._id;
    if (productId) {
      return extractedId === productId || 
             extractedId === String(productId) || 
             String(extractedId) === String(productId);
    }
  }
  
  return false;
};

/**
 * Find product by slug from a list of products
 * @param {Array} products - Array of product objects
 * @param {string} slug - URL slug to find
 * @returns {Object|null} - Found product or null
 */
export const findProductBySlug = (products, slug) => {
  if (!products || !Array.isArray(products) || !slug) return null;
  
  return products.find(product => productMatchesSlug(product, slug)) || null;
};

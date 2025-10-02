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
 * Generate a unique slug by appending product ID if needed
 * @param {string} name - Product name
 * @param {number|string} id - Product ID (can be number, string, or ObjectId)
 * @returns {string} - Unique URL-friendly slug
 */
export const generateUniqueSlug = (name, id) => {
  if (!name || (!id && id !== 0)) {
    console.warn('generateUniqueSlug: Missing name or id', { name, id });
    return 'unknown-product';
  }
  
  const baseSlug = generateSlug(name);
  
  // Handle different ID formats
  let idString = id;
  if (typeof id === 'object' && id.toString) {
    idString = id.toString(); // For ObjectId or other objects
  } else if (typeof id !== 'string') {
    idString = String(id); // Convert numbers to strings
  }
  
  return `${baseSlug}-${idString}`;
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
  
  // Get product ID (try both id and _id fields)
  const productId = product.id || product._id;
  if (!productId) return false;
  
  // Try to match by generated slug
  const productSlug = generateUniqueSlug(product.name, productId);
  if (productSlug === slug) return true;
  
  // Fallback: try to extract ID from slug and match
  const extractedId = extractIdFromSlug(slug);
  if (!extractedId) return false;
  
  // Try different ID comparison strategies
  return extractedId === productId || 
         extractedId === String(productId) || 
         String(extractedId) === String(productId);
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

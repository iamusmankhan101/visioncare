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
 * @param {number} id - Product ID
 * @returns {string} - Unique URL-friendly slug
 */
export const generateUniqueSlug = (name, id) => {
  const baseSlug = generateSlug(name);
  return `${baseSlug}-${id}`;
};

/**
 * Extract product ID from a slug that includes ID
 * @param {string} slug - URL slug with ID
 * @returns {number|null} - Extracted product ID or null if not found
 */
export const extractIdFromSlug = (slug) => {
  if (!slug) return null;
  
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  const id = parseInt(lastPart);
  
  return isNaN(id) ? null : id;
};

/**
 * Check if a product matches a given slug
 * @param {Object} product - Product object
 * @param {string} slug - URL slug to match
 * @returns {boolean} - Whether the product matches the slug
 */
export const productMatchesSlug = (product, slug) => {
  if (!product || !slug) return false;
  
  // Try to match by generated slug
  const productSlug = generateUniqueSlug(product.name, product.id);
  if (productSlug === slug) return true;
  
  // Fallback: try to extract ID from slug and match
  const extractedId = extractIdFromSlug(slug);
  return extractedId === product.id;
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

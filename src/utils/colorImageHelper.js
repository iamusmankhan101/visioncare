// Helper utility to work with color-specific images

/**
 * Creates a colorImages object for a product
 * @param {Object} colorImageMap - Object mapping color names to image URLs
 * @returns {Object} - Formatted colorImages object
 */
export const createColorImages = (colorImageMap) => {
  const colorImages = {};
  
  Object.keys(colorImageMap).forEach(colorName => {
    const imageUrl = colorImageMap[colorName];
    if (imageUrl) {
      // Support both single images and arrays of images
      colorImages[colorName] = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
    }
  });
  
  return colorImages;
};

/**
 * Example usage for testing:
 * 
 * const colorImages = createColorImages({
 *   'Black': 'https://example.com/black-glasses.jpg',
 *   'Brown': 'https://example.com/brown-glasses.jpg',
 *   'Gold': 'https://example.com/gold-glasses.jpg'
 * });
 * 
 * // Then use this in your product data:
 * const productData = {
 *   name: 'Stylish Glasses',
 *   colors: ['Black', 'Brown', 'Gold'],
 *   colorImages: colorImages
 * };
 */

/**
 * Validates color images structure
 * @param {Object} colorImages - The colorImages object to validate
 * @param {Array} colors - Array of color names that should have images
 * @returns {Object} - Validation result with missing colors
 */
export const validateColorImages = (colorImages, colors) => {
  const missing = [];
  const present = [];
  
  if (!colorImages || typeof colorImages !== 'object') {
    return { valid: false, missing: colors, present: [] };
  }
  
  colors.forEach(color => {
    if (colorImages[color] && colorImages[color].length > 0) {
      present.push(color);
    } else {
      missing.push(color);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing,
    present,
    coverage: `${present.length}/${colors.length} colors have images`
  };
};

/**
 * Sample color images for testing
 */
export const sampleColorImages = {
  'Black': ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400'],
  'Brown': ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400'],
  'Gold': ['https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400'],
  'Silver': ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400'],
  'Blue': ['https://images.unsplash.com/photo-1577803645773-f96470509666?w=400'],
  'Red': ['https://images.unsplash.com/photo-1594736797933-d0c6b7d3a4b1?w=400']
};

/**
 * Debug function to log color image information
 */
export const debugColorImages = (product) => {
  console.group('🔍 Color Images Debug for:', product.name);
  
  console.log('📋 Product colors:', product.colors?.map(c => c.name) || []);
  console.log('🎨 ColorImages object:', product.colorImages);
  
  if (product.colors && product.colorImages) {
    const validation = validateColorImages(product.colorImages, product.colors.map(c => c.name));
    console.log('✅ Validation:', validation);
    
    product.colors.forEach((color, index) => {
      const hasImage = product.colorImages[color.name];
      console.log(`[${index}] ${color.name}:`, hasImage ? '✅ Has image' : '❌ No image', color.image);
    });
  }
  
  console.groupEnd();
};

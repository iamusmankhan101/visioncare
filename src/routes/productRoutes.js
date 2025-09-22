const express = require('express');
const router = express.Router();

// Utility functions for slug handling
const generateSlug = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

const generateUniqueSlug = (name, id) => {
  const baseSlug = generateSlug(name);
  return `${baseSlug}-${id}`;
};

const extractIdFromSlug = (slug) => {
  if (!slug) return null;
  
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  const id = parseInt(lastPart);
  
  return isNaN(id) ? null : id;
};

const productMatchesSlug = (product, slug) => {
  if (!product || !slug) return false;
  
  // Try to match by generated slug
  const productSlug = generateUniqueSlug(product.name, product.id);
  if (productSlug === slug) return true;
  
  // Fallback: try to extract ID from slug and match
  const extractedId = extractIdFromSlug(slug);
  return extractedId === product.id;
};

// Mock product data with dynamic colors
const products = [
  {
    id: 1,
    name: 'Classic Aviator Sunglasses',
    price: 89.99,
    category: 'sunglasses',
    brand: 'EyeWear Pro',
    image: '/images/sunglasses.webp',
    featured: true,
    bestSeller: false,
    colors: []
  },
  {
    id: 2,
    name: 'Modern Reading Glasses',
    price: 45.99,
    category: 'eyeglasses',
    brand: 'Vision Plus',
    image: '/images/SP-113-Black-Golden-Thum-4.jpeg',
    featured: false,
    bestSeller: true,
    colors: []
  },
  {
    id: 3,
    name: 'Designer Frame Collection',
    price: 129.99,
    category: 'eyeglasses',
    brand: 'Luxury Vision',
    image: '/images/mt6567.avif',
    featured: true,
    bestSeller: true,
    colors: []
  }
];

// GET /api/products - Get all products
router.get('/', (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// GET /api/products/slug/:slug - Get single product by slug
router.get('/slug/:slug', (req, res) => {
  try {
    const slug = req.params.slug;
    const product = products.find(p => productMatchesSlug(p, slug));
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// GET /api/products/:id - Get single product (legacy support)
router.get('/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// POST /api/products - Create new product
router.post('/', (req, res) => {
  try {
    const newProduct = {
      id: products.length + 1,
      ...req.body
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update the product
    products[productIndex] = {
      ...products[productIndex],
      ...req.body,
      id: productId // Ensure ID doesn't change
    };
    
    res.json(products[productIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Remove the product
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;

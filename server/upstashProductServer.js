const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const upstashService = require('./upstashService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5004;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup (SQLite as fallback)
const dbPath = path.join(__dirname, 'products.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    originalPrice REAL,
    image TEXT,
    gallery TEXT,
    category TEXT,
    brand TEXT,
    material TEXT,
    shape TEXT,
    color TEXT,
    size TEXT,
    status TEXT DEFAULT 'active',
    description TEXT,
    features TEXT,
    specifications TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Hybrid storage service (Upstash + SQLite fallback)
class HybridProductService {
  async saveProduct(product) {
    // Try Upstash first
    const upstashResult = await upstashService.saveProduct(product);
    
    // Always save to SQLite as backup
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO products 
        (id, name, price, originalPrice, image, gallery, category, brand, material, shape, color, size, status, description, features, specifications, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run([
        product.id,
        product.name,
        product.price,
        product.originalPrice || null,
        product.image || null,
        JSON.stringify(product.gallery || []),
        product.category || null,
        product.brand || null,
        product.material || null,
        product.shape || null,
        product.color || null,
        product.size || null,
        product.status || 'active',
        product.description || null,
        JSON.stringify(product.features || []),
        JSON.stringify(product.specifications || {}),
      ], function(err) {
        if (err) {
          console.error('SQLite save error:', err);
          reject(err);
        } else {
          console.log(`✅ Product ${product.id} saved to both Upstash and SQLite`);
          resolve(product);
        }
      });
      
      stmt.finalize();
    });
  }

  async getProduct(productId) {
    // Try Upstash first
    const upstashProduct = await upstashService.getProduct(productId);
    if (upstashProduct) {
      return upstashProduct;
    }

    // Fallback to SQLite
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          // Parse JSON fields
          if (row.gallery) row.gallery = JSON.parse(row.gallery);
          if (row.features) row.features = JSON.parse(row.features);
          if (row.specifications) row.specifications = JSON.parse(row.specifications);
          resolve(row);
        } else {
          resolve(null);
        }
      });
    });
  }

  async getAllProducts() {
    // Try Upstash first
    const upstashProducts = await upstashService.getAllProducts();
    if (upstashProducts.length > 0) {
      return upstashProducts;
    }

    // Fallback to SQLite
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM products ORDER BY updatedAt DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parse JSON fields for each product
          const products = rows.map(row => {
            if (row.gallery) row.gallery = JSON.parse(row.gallery);
            if (row.features) row.features = JSON.parse(row.features);
            if (row.specifications) row.specifications = JSON.parse(row.specifications);
            return row;
          });
          resolve(products);
        }
      });
    });
  }

  async updateProduct(productId, updates) {
    // Try Upstash first
    const upstashResult = await upstashService.updateProduct(productId, updates);
    
    // Update SQLite as backup
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(productId);
      
      db.run(
        `UPDATE products SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            console.log(`✅ Product ${productId} updated in both Upstash and SQLite`);
            resolve({ id: productId, ...updates });
          }
        }
      );
    });
  }

  async deleteProduct(productId) {
    // Try Upstash first
    const upstashResult = await upstashService.deleteProduct(productId);
    
    // Delete from SQLite as backup
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(`✅ Product ${productId} deleted from both Upstash and SQLite`);
          resolve(true);
        }
      });
    });
  }
}

const productService = new HybridProductService();

// Routes
app.get('/api/health', async (req, res) => {
  const upstashHealth = await upstashService.healthCheck();
  res.json({
    status: 'OK',
    message: 'Upstash Product API Server is running',
    upstash: upstashHealth,
    timestamp: new Date().toISOString()
  });
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json({
      success: true,
      data: products,
      count: products.length,
      source: products.length > 0 ? 'database' : 'empty'
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await productService.getProduct(req.params.id);
    if (product) {
      res.json({
        success: true,
        data: product
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

// Create new product
app.post('/api/products', async (req, res) => {
  try {
    const productData = {
      id: req.body.id || `prod_${Date.now()}`,
      ...req.body
    };

    const product = await productService.saveProduct(productData);
    
    // Increment product counter
    await upstashService.incrementCounter('stats:products:total');
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      message: error.message
    });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.id; // Don't allow ID updates
    
    const product = await productService.updateProduct(req.params.id, updates);
    
    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      message: error.message
    });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const success = await productService.deleteProduct(req.params.id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      message: error.message
    });
  }
});

// Search products
app.get('/api/products/search/:query', async (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const allProducts = await productService.getAllProducts();
    
    const filteredProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
    
    res.json({
      success: true,
      data: filteredProducts,
      count: filteredProducts.length,
      query: req.params.query
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search products',
      message: error.message
    });
  }
});

// Get products by category
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const allProducts = await productService.getAllProducts();
    const categoryProducts = allProducts.filter(product => 
      product.category?.toLowerCase() === req.params.category.toLowerCase()
    );
    
    res.json({
      success: true,
      data: categoryProducts,
      count: categoryProducts.length,
      category: req.params.category
    });
  } catch (error) {
    console.error('Error fetching category products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category products',
      message: error.message
    });
  }
});

// Analytics endpoints
app.get('/api/analytics/stats', async (req, res) => {
  try {
    const totalProducts = await upstashService.getCounter('stats:products:total');
    const allProducts = await productService.getAllProducts();
    
    const stats = {
      totalProducts: Math.max(totalProducts, allProducts.length),
      activeProducts: allProducts.filter(p => p.status === 'active').length,
      categories: [...new Set(allProducts.map(p => p.category).filter(Boolean))].length,
      brands: [...new Set(allProducts.map(p => p.brand).filter(Boolean))].length,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Upstash Product Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛍️ Products API: http://localhost:${PORT}/api/products`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});

module.exports = app;

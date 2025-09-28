const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5004;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database setup
const dbPath = path.join(__dirname, 'products.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          category TEXT,
          material TEXT,
          shape TEXT,
          style TEXT,
          frameColor TEXT,
          description TEXT,
          image TEXT,
          gallery TEXT, -- JSON string for gallery images
          colors TEXT, -- JSON string for color options
          features TEXT, -- JSON string for features array
          lensTypes TEXT, -- JSON string for lens types
          sizes TEXT, -- JSON string for sizes
          discount TEXT, -- JSON string for discount object
          status TEXT DEFAULT 'In Stock',
          featured BOOLEAN DEFAULT 0,
          bestSeller BOOLEAN DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating products table:', err);
          reject(err);
        } else {
          console.log('✅ Products table created/verified');
          resolve();
        }
      });
    });
  });
};

// Helper function to serialize JSON fields
const serializeProduct = (product) => {
  return {
    ...product,
    gallery: JSON.stringify(product.gallery || []),
    colors: JSON.stringify(product.colors || []),
    features: JSON.stringify(product.features || []),
    lensTypes: JSON.stringify(product.lensTypes || []),
    sizes: JSON.stringify(product.sizes || []),
    discount: JSON.stringify(product.discount || { hasDiscount: false, discountPercentage: 0 })
  };
};

// Helper function to deserialize JSON fields
const deserializeProduct = (product) => {
  try {
    return {
      ...product,
      gallery: JSON.parse(product.gallery || '[]'),
      colors: JSON.parse(product.colors || '[]'),
      features: JSON.parse(product.features || '[]'),
      lensTypes: JSON.parse(product.lensTypes || '[]'),
      sizes: JSON.parse(product.sizes || '[]'),
      discount: JSON.parse(product.discount || '{"hasDiscount":false,"discountPercentage":0}'),
      featured: Boolean(product.featured),
      bestSeller: Boolean(product.bestSeller)
    };
  } catch (error) {
    console.error('Error deserializing product:', error);
    return product;
  }
};

// API Routes

// GET /api/products - Get all products
app.get('/api/products', (req, res) => {
  console.log('📦 GET /api/products - Fetching all products');
  
  db.all('SELECT * FROM products ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    
    const products = rows.map(deserializeProduct);
    console.log(`✅ Found ${products.length} products`);
    res.json(products);
  });
});

// GET /api/products/:id - Get single product
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  console.log(`📦 GET /api/products/${id} - Fetching single product`);
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = deserializeProduct(row);
    console.log(`✅ Found product: ${product.name}`);
    res.json(product);
  });
});

// POST /api/products - Create new product
app.post('/api/products', (req, res) => {
  console.log('📦 POST /api/products - Creating new product');
  console.log('Product data:', req.body.name);
  
  const productData = serializeProduct(req.body);
  
  const {
    name, price, category, material, shape, style, frameColor,
    description, image, gallery, colors, features, lensTypes,
    sizes, discount, status, featured, bestSeller
  } = productData;
  
  const sql = `
    INSERT INTO products (
      name, price, category, material, shape, style, frameColor,
      description, image, gallery, colors, features, lensTypes,
      sizes, discount, status, featured, bestSeller
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    name, price, category, material, shape, style, frameColor,
    description, image, gallery, colors, features, lensTypes,
    sizes, discount, status || 'In Stock', featured ? 1 : 0, bestSeller ? 1 : 0
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error creating product:', err);
      return res.status(500).json({ error: 'Failed to create product' });
    }
    
    // Fetch the created product
    db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created product:', err);
        return res.status(500).json({ error: 'Product created but failed to fetch' });
      }
      
      const product = deserializeProduct(row);
      console.log(`✅ Created product: ${product.name} (ID: ${product.id})`);
      res.status(201).json(product);
    });
  });
});

// PUT /api/products/:id - Update product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  console.log(`📦 PUT /api/products/${id} - Updating product`);
  
  const productData = serializeProduct(req.body);
  
  const {
    name, price, category, material, shape, style, frameColor,
    description, image, gallery, colors, features, lensTypes,
    sizes, discount, status, featured, bestSeller
  } = productData;
  
  const sql = `
    UPDATE products SET
      name = ?, price = ?, category = ?, material = ?, shape = ?, style = ?,
      frameColor = ?, description = ?, image = ?, gallery = ?, colors = ?,
      features = ?, lensTypes = ?, sizes = ?, discount = ?, status = ?,
      featured = ?, bestSeller = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  const params = [
    name, price, category, material, shape, style, frameColor,
    description, image, gallery, colors, features, lensTypes,
    sizes, discount, status || 'In Stock', featured ? 1 : 0, bestSeller ? 1 : 0, id
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ error: 'Failed to update product' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Fetch the updated product
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching updated product:', err);
        return res.status(500).json({ error: 'Product updated but failed to fetch' });
      }
      
      const product = deserializeProduct(row);
      console.log(`✅ Updated product: ${product.name} (ID: ${product.id})`);
      res.json(product);
    });
  });
});

// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  console.log(`📦 DELETE /api/products/${id} - Deleting product`);
  
  // First fetch the product to return it
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching product for deletion:', err);
      return res.status(500).json({ error: 'Failed to fetch product for deletion' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = deserializeProduct(row);
    
    // Now delete the product
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting product:', err);
        return res.status(500).json({ error: 'Failed to delete product' });
      }
      
      console.log(`✅ Deleted product: ${product.name} (ID: ${product.id})`);
      res.json({ 
        message: 'Product deleted successfully', 
        product: product 
      });
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Product API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log('🚀 Product API Server started successfully!');
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💾 Database: ${dbPath}`);
      console.log('📋 Available endpoints:');
      console.log('   GET    /api/products     - Get all products');
      console.log('   GET    /api/products/:id - Get single product');
      console.log('   POST   /api/products     - Create new product');
      console.log('   PUT    /api/products/:id - Update product');
      console.log('   DELETE /api/products/:id - Delete product');
      console.log('   GET    /api/health       - Health check');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});

startServer();

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.ADMIN_PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, '../src/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database for admin operations');
    initializeTables();
  }
});

// Initialize database tables
function initializeTables() {
  // Stores table
  db.run(`
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      owner_id INTEGER,
      theme TEXT DEFAULT 'modern',
      primary_color TEXT DEFAULT '#007bff',
      secondary_color TEXT DEFAULT '#6c757d',
      logo TEXT,
      currency TEXT DEFAULT 'USD',
      timezone TEXT DEFAULT 'UTC',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Vendors table
  db.run(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      company TEXT,
      website TEXT,
      description TEXT,
      status TEXT DEFAULT 'pending',
      commission_rate REAL DEFAULT 0.15,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Enhanced products table for multi-vendor
  db.run(`
    CREATE TABLE IF NOT EXISTS vendor_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id INTEGER,
      store_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      cost_price REAL,
      sku TEXT UNIQUE,
      category TEXT,
      brand TEXT,
      frame_colors TEXT,
      product_image TEXT,
      product_gallery TEXT,
      images TEXT,
      inventory_quantity INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 10,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES vendors (id),
      FOREIGN KEY (store_id) REFERENCES stores (id)
    )
  `);

  // Add new columns if they don't exist (for existing databases)
  db.run(`ALTER TABLE vendor_products ADD COLUMN frame_colors TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding frame_colors column:', err.message);
    }
  });

  db.run(`ALTER TABLE vendor_products ADD COLUMN product_image TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding product_image column:', err.message);
    }
  });

  db.run(`ALTER TABLE vendor_products ADD COLUMN product_gallery TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding product_gallery column:', err.message);
    }
  });

  // Enhanced orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      vendor_id INTEGER,
      store_id INTEGER,
      customer_email TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT,
      billing_address TEXT,
      subtotal REAL NOT NULL,
      tax_amount REAL DEFAULT 0,
      shipping_amount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      fulfillment_status TEXT DEFAULT 'pending',
      tracking_number TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES vendors (id),
      FOREIGN KEY (store_id) REFERENCES stores (id)
    )
  `);

  // Order items table
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      product_sku TEXT,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      variant_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES admin_orders (id),
      FOREIGN KEY (product_id) REFERENCES vendor_products (id)
    )
  `);

  // Add variant_info column if it doesn't exist (for existing databases)
  db.run(`
    ALTER TABLE admin_order_items ADD COLUMN variant_info TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding variant_info column:', err.message);
    }
  });

  // Inventory tracking table
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
      quantity INTEGER NOT NULL,
      reason TEXT,
      reference_id INTEGER, -- order_id for sales, purchase_id for restocks
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES vendor_products (id)
    )
  `);

  // Analytics table
  db.run(`
    CREATE TABLE IF NOT EXISTS analytics_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER,
      vendor_id INTEGER,
      metric_type TEXT NOT NULL, -- 'sales', 'orders', 'customers', 'revenue'
      metric_value REAL NOT NULL,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores (id),
      FOREIGN KEY (vendor_id) REFERENCES vendors (id)
    )
  `);

  console.log('Database tables initialized successfully');
}

// ==================== STORE MANAGEMENT ROUTES ====================

// Get all stores
app.get('/api/stores', (req, res) => {
  db.all('SELECT * FROM stores ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new store
app.post('/api/stores', (req, res) => {
  const {
    name,
    description,
    owner_id,
    theme,
    primary_color,
    secondary_color,
    logo,
    currency,
    timezone
  } = req.body;

  const sql = `
    INSERT INTO stores (name, description, owner_id, theme, primary_color, secondary_color, logo, currency, timezone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [name, description, owner_id, theme, primary_color, secondary_color, logo, currency, timezone], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Get the created store
    db.get('SELECT * FROM stores WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(row);
    });
  });
});

// Update store
app.put('/api/stores/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  values.push(id);

  const sql = `UPDATE stores SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  db.run(sql, values, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.get('SELECT * FROM stores WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row);
    });
  });
});

// ==================== VENDOR MANAGEMENT ROUTES ====================

// Get all vendors
app.get('/api/vendors', (req, res) => {
  const sql = `
    SELECT v.*, 
           COUNT(vp.id) as product_count,
           COALESCE(SUM(ao.total), 0) as revenue
    FROM vendors v
    LEFT JOIN vendor_products vp ON v.id = vp.vendor_id
    LEFT JOIN admin_orders ao ON v.id = ao.vendor_id AND ao.payment_status = 'completed'
    GROUP BY v.id
    ORDER BY v.created_at DESC
  `;

  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new vendor
app.post('/api/vendors', (req, res) => {
  const { name, email, phone, company, website, description } = req.body;

  const sql = `
    INSERT INTO vendors (name, email, phone, company, website, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [name, email, phone, company, website, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.get('SELECT * FROM vendors WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(row);
    });
  });
});

// Update vendor status
app.patch('/api/vendors/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run('UPDATE vendors SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.get('SELECT * FROM vendors WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row);
    });
  });
});

// ==================== PRODUCT MANAGEMENT ROUTES ====================

// Get all products
app.get('/api/products', (req, res) => {
  const { vendor_id, store_id, category, status } = req.query;
  
  let sql = `
    SELECT vp.*, v.name as vendor_name, s.name as store_name
    FROM vendor_products vp
    LEFT JOIN vendors v ON vp.vendor_id = v.id
    LEFT JOIN stores s ON vp.store_id = s.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (vendor_id) {
    sql += ' AND vp.vendor_id = ?';
    params.push(vendor_id);
  }
  
  if (store_id) {
    sql += ' AND vp.store_id = ?';
    params.push(store_id);
  }
  
  if (category) {
    sql += ' AND vp.category = ?';
    params.push(category);
  }
  
  if (status) {
    sql += ' AND vp.status = ?';
    params.push(status);
  }
  
  sql += ' ORDER BY vp.created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new product
app.post('/api/products', (req, res) => {
  const {
    vendor_id,
    store_id,
    name,
    description,
    price,
    cost_price,
    sku,
    category,
    brand,
    images,
    inventory_quantity,
    low_stock_threshold
  } = req.body;

  const sql = `
    INSERT INTO vendor_products (
      vendor_id, store_id, name, description, price, cost_price, sku, 
      category, brand, images, inventory_quantity, low_stock_threshold
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    vendor_id, store_id, name, description, price, cost_price, sku,
    category, brand, JSON.stringify(images), inventory_quantity, low_stock_threshold
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Log initial inventory
    if (inventory_quantity > 0) {
      db.run(`
        INSERT INTO inventory_movements (product_id, movement_type, quantity, reason)
        VALUES (?, 'in', ?, 'Initial stock')
      `, [this.lastID, inventory_quantity]);
    }
    
    db.get('SELECT * FROM vendor_products WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(row);
    });
  });
});

// Update product inventory
app.patch('/api/products/:id/inventory', (req, res) => {
  const { id } = req.params;
  const { quantity, movement_type, reason } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Update product inventory
    const updateSql = movement_type === 'in' 
      ? 'UPDATE vendor_products SET inventory_quantity = inventory_quantity + ? WHERE id = ?'
      : 'UPDATE vendor_products SET inventory_quantity = inventory_quantity - ? WHERE id = ?';
    
    db.run(updateSql, [quantity, id], function(err) {
      if (err) {
        db.run('ROLLBACK');
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Log inventory movement
      db.run(`
        INSERT INTO inventory_movements (product_id, movement_type, quantity, reason)
        VALUES (?, ?, ?, ?)
      `, [id, movement_type, quantity, reason], function(err) {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }
        
        db.run('COMMIT');
        
        db.get('SELECT * FROM vendor_products WHERE id = ?', [id], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(row);
        });
      });
    });
  });
});

// ==================== ORDER MANAGEMENT ROUTES ====================

// Get all orders
app.get('/api/orders', (req, res) => {
  const { page = 1, limit = 20, status, vendor_id } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = `
    SELECT ao.*, v.name as vendor_name, s.name as store_name,
           COUNT(aoi.id) as item_count
    FROM admin_orders ao
    LEFT JOIN vendors v ON ao.vendor_id = v.id
    LEFT JOIN stores s ON ao.store_id = s.id
    LEFT JOIN admin_order_items aoi ON ao.id = aoi.order_id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (status) {
    sql += ' AND ao.fulfillment_status = ?';
    params.push(status);
  }
  
  if (vendor_id) {
    sql += ' AND ao.vendor_id = ?';
    params.push(vendor_id);
  }
  
  sql += ' GROUP BY ao.id ORDER BY ao.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(sql, params, (err, orders) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM admin_orders WHERE 1=1';
    const countParams = [];
    
    if (status) {
      countSql += ' AND fulfillment_status = ?';
      countParams.push(status);
    }
    
    if (vendor_id) {
      countSql += ' AND vendor_id = ?';
      countParams.push(vendor_id);
    }
    
    db.get(countSql, countParams, async (err, countResult) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Fetch items for each order
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        return new Promise((resolve, reject) => {
          const itemsSql = `
            SELECT * FROM admin_order_items 
            WHERE order_id = ? 
            ORDER BY id ASC
          `;
          
          db.all(itemsSql, [order.id], (err, items) => {
            if (err) {
              console.error('Error fetching items for order', order.id, ':', err);
              resolve({ ...order, items: [] });
            } else {
              // Parse variant_info JSON for each item
              const parsedItems = items.map(item => ({
                ...item,
                variant_info: item.variant_info ? JSON.parse(item.variant_info) : {}
              }));
              resolve({ ...order, items: parsedItems });
            }
          });
        });
      }));
      
      res.json({
        orders: ordersWithItems,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(countResult.total / limit),
          totalItems: countResult.total,
          itemsPerPage: parseInt(limit)
        }
      });
    });
  });
});

// Create new order
app.post('/api/orders', (req, res) => {
  const {
    order_number,
    customer_email,
    customer_name,
    customer_phone,
    shipping_address,
    billing_address,
    subtotal,
    shipping_amount,
    tax_amount,
    discount_amount,
    total,
    payment_method,
    payment_status,
    fulfillment_status,
    notes,
    items
  } = req.body;

  // Insert order into admin_orders table
  const orderSql = `
    INSERT INTO admin_orders (
      order_number, customer_email, customer_name, customer_phone,
      shipping_address, billing_address, subtotal, shipping_amount,
      tax_amount, discount_amount, total, payment_method,
      payment_status, fulfillment_status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(orderSql, [
    order_number, customer_email, customer_name, customer_phone,
    shipping_address, billing_address, subtotal, shipping_amount,
    tax_amount, discount_amount, total, payment_method,
    payment_status || 'pending', fulfillment_status || 'pending', notes
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const orderId = this.lastID;

    // Insert order items if provided
    if (items && items.length > 0) {
      const itemSql = `
        INSERT INTO admin_order_items (
          order_id, product_id, product_name, product_sku,
          quantity, unit_price, total_price, variant_info
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const itemPromises = items.map(item => {
        return new Promise((resolve, reject) => {
          db.run(itemSql, [
            orderId,
            item.product_id || 0, // Default product_id if not provided
            item.product_name,
            item.product_sku,
            item.quantity,
            item.unit_price,
            item.total_price,
            item.variant_info || '{}'
          ], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
        });
      });

      Promise.all(itemPromises)
        .then(() => {
          res.status(201).json({
            id: orderId,
            order_number,
            message: 'Order created successfully'
          });
        })
        .catch(err => {
          res.status(500).json({ error: 'Failed to create order items: ' + err.message });
        });
    } else {
      res.status(201).json({
        id: orderId,
        order_number,
        message: 'Order created successfully'
      });
    }
  });
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, tracking_number } = req.body;

  const sql = `
    UPDATE admin_orders 
    SET fulfillment_status = ?, tracking_number = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;

  db.run(sql, [status, tracking_number, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.get('SELECT * FROM admin_orders WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row);
    });
  });
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;

  // First delete order items
  const deleteItemsSql = 'DELETE FROM admin_order_items WHERE order_id = ?';
  
  db.run(deleteItemsSql, [id], function(err) {
    if (err) {
      res.status(500).json({ error: 'Failed to delete order items: ' + err.message });
      return;
    }

    // Then delete the order
    const deleteOrderSql = 'DELETE FROM admin_orders WHERE id = ?';
    
    db.run(deleteOrderSql, [id], function(err) {
      if (err) {
        res.status(500).json({ error: 'Failed to delete order: ' + err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.json({ 
        success: true, 
        message: 'Order deleted successfully',
        deletedOrderId: id,
        deletedItems: true
      });
    });
  });
});

// ==================== ANALYTICS ROUTES ====================

// Get dashboard analytics
app.get('/api/analytics/dashboard', (req, res) => {
  const { store_id, vendor_id, date_range = '30d' } = req.query;
  
  let dateFilter = '';
  if (date_range === '7d') {
    dateFilter = "AND created_at >= date('now', '-7 days')";
  } else if (date_range === '30d') {
    dateFilter = "AND created_at >= date('now', '-30 days')";
  } else if (date_range === '90d') {
    dateFilter = "AND created_at >= date('now', '-90 days')";
  }

  const queries = {
    totalRevenue: `
      SELECT COALESCE(SUM(total), 0) as value 
      FROM admin_orders 
      WHERE payment_status = 'completed' ${dateFilter}
      ${store_id ? 'AND store_id = ?' : ''}
      ${vendor_id ? 'AND vendor_id = ?' : ''}
    `,
    totalOrders: `
      SELECT COUNT(*) as value 
      FROM admin_orders 
      WHERE 1=1 ${dateFilter}
      ${store_id ? 'AND store_id = ?' : ''}
      ${vendor_id ? 'AND vendor_id = ?' : ''}
    `,
    totalCustomers: `
      SELECT COUNT(DISTINCT customer_email) as value 
      FROM admin_orders 
      WHERE 1=1 ${dateFilter}
      ${store_id ? 'AND store_id = ?' : ''}
      ${vendor_id ? 'AND vendor_id = ?' : ''}
    `,
    averageOrderValue: `
      SELECT COALESCE(AVG(total), 0) as value 
      FROM admin_orders 
      WHERE payment_status = 'completed' ${dateFilter}
      ${store_id ? 'AND store_id = ?' : ''}
      ${vendor_id ? 'AND vendor_id = ?' : ''}
    `
  };

  const params = [];
  if (store_id) params.push(store_id);
  if (vendor_id) params.push(vendor_id);

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, params, (err, row) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = 0;
      } else {
        results[key] = row.value;
      }
      
      completed++;
      if (completed === total) {
        res.json(results);
      }
    });
  });
});

// Get sales data for charts
app.get('/api/analytics/sales', (req, res) => {
  const { store_id, vendor_id, date_range = '7d' } = req.query;
  
  let dateFormat = '%Y-%m-%d';
  let dateRange = "date('now', '-7 days')";
  
  if (date_range === '30d') {
    dateRange = "date('now', '-30 days')";
  } else if (date_range === '90d') {
    dateRange = "date('now', '-90 days')";
  }

  const sql = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as orders,
      COALESCE(SUM(total), 0) as revenue
    FROM admin_orders
    WHERE created_at >= ${dateRange}
      AND payment_status = 'completed'
      ${store_id ? 'AND store_id = ?' : ''}
      ${vendor_id ? 'AND vendor_id = ?' : ''}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  const params = [];
  if (store_id) params.push(store_id);
  if (vendor_id) params.push(vendor_id);

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// ==================== INVENTORY ROUTES ====================

// Get low stock products
app.get('/api/inventory/low-stock', (req, res) => {
  const sql = `
    SELECT vp.*, v.name as vendor_name
    FROM vendor_products vp
    LEFT JOIN vendors v ON vp.vendor_id = v.id
    WHERE vp.inventory_quantity <= vp.low_stock_threshold
    ORDER BY vp.inventory_quantity ASC
  `;

  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get inventory movements
app.get('/api/inventory/movements', (req, res) => {
  const { product_id, limit = 50 } = req.query;
  
  let sql = `
    SELECT im.*, vp.name as product_name, vp.sku
    FROM inventory_movements im
    LEFT JOIN vendor_products vp ON im.product_id = vp.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (product_id) {
    sql += ' AND im.product_id = ?';
    params.push(product_id);
  }
  
  sql += ' ORDER BY im.created_at DESC LIMIT ?';
  params.push(parseInt(limit));

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Admin Backend API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Admin Backend API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;

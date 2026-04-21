const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database paths
const oldDbPath = path.join(__dirname, '../src/database.sqlite');
const newDbPath = path.join(__dirname, '../src/database.sqlite'); // Same database, different tables

console.log('Starting product migration...');

// Open database connection
const db = new sqlite3.Database(oldDbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database');
    migrateProducts();
  }
});

function migrateProducts() {
  // First, check if old products table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='products'", (err, row) => {
    if (err) {
      console.error('Error checking for products table:', err);
      return;
    }
    
    if (!row) {
      console.log('No existing products table found. Creating sample data...');
      createSampleData();
      return;
    }
    
    console.log('Found existing products table. Migrating data...');
    
    // Get all products from old table
    db.all('SELECT * FROM products', (err, products) => {
      if (err) {
        console.error('Error fetching products:', err);
        return;
      }
      
      console.log(`Found ${products.length} products to migrate`);
      
      if (products.length === 0) {
        console.log('No products found. Creating sample data...');
        createSampleData();
        return;
      }
      
      // Create default store and vendor if they don't exist
      createDefaultStoreAndVendor(() => {
        migrateProductsToNewTable(products);
      });
    });
  });
}

function createDefaultStoreAndVendor(callback) {
  // Create default store
  const storeData = {
    name: 'Eyewearr Store',
    description: 'Premium eyewear collection',
    theme: 'modern',
    primary_color: '#007bff',
    secondary_color: '#6c757d',
    currency: 'USD',
    timezone: 'UTC',
    status: 'active'
  };
  
  db.run(`
    INSERT OR IGNORE INTO stores (id, name, description, theme, primary_color, secondary_color, currency, timezone, status)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [storeData.name, storeData.description, storeData.theme, storeData.primary_color, 
      storeData.secondary_color, storeData.currency, storeData.timezone, storeData.status], 
  function(err) {
    if (err) {
      console.error('Error creating default store:', err);
      return;
    }
    
    console.log('Default store created/verified');
    
    // Create default vendor
    const vendorData = {
      name: 'Eyewearr Admin',
      email: 'admin@eyewearr.com',
      company: 'Eyewearr Inc.',
      status: 'active',
      commission_rate: 0.0
    };
    
    db.run(`
      INSERT OR IGNORE INTO vendors (id, name, email, company, status, commission_rate)
      VALUES (1, ?, ?, ?, ?, ?)
    `, [vendorData.name, vendorData.email, vendorData.company, vendorData.status, vendorData.commission_rate],
    function(err) {
      if (err) {
        console.error('Error creating default vendor:', err);
        return;
      }
      
      console.log('Default vendor created/verified');
      callback();
    });
  });
}

function migrateProductsToNewTable(products) {
  let migrated = 0;
  let errors = 0;
  
  products.forEach((product, index) => {
    // Map old product structure to new vendor_products structure
    const newProduct = {
      vendor_id: 1, // Default vendor
      store_id: 1,  // Default store
      name: product.name || 'Unnamed Product',
      description: product.description || '',
      price: product.price || 0,
      cost_price: product.price ? product.price * 0.6 : 0, // Assume 40% margin
      sku: product.sku || `SKU-${Date.now()}-${index}`,
      category: product.category || 'Eyewear',
      brand: product.brand || 'Generic',
      images: JSON.stringify(product.images || []),
      inventory_quantity: product.stock || 50,
      low_stock_threshold: 10,
      status: 'active'
    };
    
    db.run(`
      INSERT INTO vendor_products (
        vendor_id, store_id, name, description, price, cost_price, sku,
        category, brand, images, inventory_quantity, low_stock_threshold, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newProduct.vendor_id, newProduct.store_id, newProduct.name, newProduct.description,
      newProduct.price, newProduct.cost_price, newProduct.sku, newProduct.category,
      newProduct.brand, newProduct.images, newProduct.inventory_quantity,
      newProduct.low_stock_threshold, newProduct.status
    ], function(err) {
      if (err) {
        console.error(`Error migrating product ${product.name}:`, err);
        errors++;
      } else {
        migrated++;
        console.log(`Migrated: ${product.name}`);
        
        // Add initial inventory movement
        db.run(`
          INSERT INTO inventory_movements (product_id, movement_type, quantity, reason)
          VALUES (?, 'in', ?, 'Initial migration stock')
        `, [this.lastID, newProduct.inventory_quantity]);
      }
      
      // Check if all products are processed
      if (migrated + errors === products.length) {
        console.log(`\nMigration completed!`);
        console.log(`Successfully migrated: ${migrated} products`);
        console.log(`Errors: ${errors} products`);
        
        // Update analytics
        updateAnalytics();
      }
    });
  });
}

function createSampleData() {
  console.log('Creating sample eyewear products...');
  
  // Create default store and vendor first
  createDefaultStoreAndVendor(() => {
    const sampleProducts = [
      {
        name: 'Classic Aviator Sunglasses',
        description: 'Timeless aviator style with UV protection',
        price: 199.99,
        category: 'Sunglasses',
        brand: 'Aviator Pro',
        inventory_quantity: 25
      },
      {
        name: 'Blue Light Blocking Glasses',
        description: 'Reduce eye strain from digital screens',
        price: 89.99,
        category: 'Computer Glasses',
        brand: 'TechVision',
        inventory_quantity: 40
      },
      {
        name: 'Designer Reading Glasses',
        description: 'Stylish reading glasses for everyday use',
        price: 129.99,
        category: 'Reading Glasses',
        brand: 'ReadWell',
        inventory_quantity: 30
      },
      {
        name: 'Sports Safety Glasses',
        description: 'Durable glasses for sports and outdoor activities',
        price: 159.99,
        category: 'Sports Glasses',
        brand: 'SportVision',
        inventory_quantity: 20
      },
      {
        name: 'Vintage Round Frames',
        description: 'Classic round frames with modern comfort',
        price: 179.99,
        category: 'Fashion Glasses',
        brand: 'Vintage Style',
        inventory_quantity: 15
      }
    ];
    
    let created = 0;
    
    sampleProducts.forEach((product, index) => {
      const productData = {
        vendor_id: 1,
        store_id: 1,
        name: product.name,
        description: product.description,
        price: product.price,
        cost_price: product.price * 0.6,
        sku: `EYE-${String(index + 1).padStart(3, '0')}`,
        category: product.category,
        brand: product.brand,
        images: JSON.stringify([]),
        inventory_quantity: product.inventory_quantity,
        low_stock_threshold: 10,
        status: 'active'
      };
      
      db.run(`
        INSERT INTO vendor_products (
          vendor_id, store_id, name, description, price, cost_price, sku,
          category, brand, images, inventory_quantity, low_stock_threshold, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        productData.vendor_id, productData.store_id, productData.name, productData.description,
        productData.price, productData.cost_price, productData.sku, productData.category,
        productData.brand, productData.images, productData.inventory_quantity,
        productData.low_stock_threshold, productData.status
      ], function(err) {
        if (err) {
          console.error(`Error creating sample product ${product.name}:`, err);
        } else {
          created++;
          console.log(`Created: ${product.name}`);
          
          // Add initial inventory movement
          db.run(`
            INSERT INTO inventory_movements (product_id, movement_type, quantity, reason)
            VALUES (?, 'in', ?, 'Initial sample stock')
          `, [this.lastID, productData.inventory_quantity]);
        }
        
        if (created === sampleProducts.length) {
          console.log(`\nSample data creation completed!`);
          console.log(`Created ${created} sample products`);
          updateAnalytics();
        }
      });
    });
  });
}

function updateAnalytics() {
  console.log('Updating analytics data...');
  
  // Add some sample analytics data
  const today = new Date().toISOString().split('T')[0];
  
  const analyticsData = [
    { store_id: 1, vendor_id: 1, metric_type: 'sales', metric_value: 15000, date: today },
    { store_id: 1, vendor_id: 1, metric_type: 'orders', metric_value: 75, date: today },
    { store_id: 1, vendor_id: 1, metric_type: 'customers', metric_value: 45, date: today },
    { store_id: 1, vendor_id: 1, metric_type: 'revenue', metric_value: 18500, date: today }
  ];
  
  let inserted = 0;
  
  analyticsData.forEach(data => {
    db.run(`
      INSERT OR REPLACE INTO analytics_data (store_id, vendor_id, metric_type, metric_value, date)
      VALUES (?, ?, ?, ?, ?)
    `, [data.store_id, data.vendor_id, data.metric_type, data.metric_value, data.date],
    function(err) {
      if (err) {
        console.error('Error inserting analytics data:', err);
      } else {
        inserted++;
        if (inserted === analyticsData.length) {
          console.log('Analytics data updated successfully');
          console.log('\n✅ Migration process completed successfully!');
          console.log('You can now access the new admin panel at: http://localhost:3000/admin');
          db.close();
        }
      }
    });
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nMigration interrupted');
  db.close();
  process.exit(0);
});

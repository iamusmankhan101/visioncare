const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'products.db');

console.log('🔧 Adding brand column to existing products...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Add brand column if it doesn't exist
db.run(`ALTER TABLE products ADD COLUMN brand TEXT`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('✅ Brand column already exists');
    } else {
      console.error('❌ Error adding brand column:', err.message);
      db.close();
      return;
    }
  } else {
    console.log('✅ Brand column added successfully');
  }
  
  // Update existing products with brand names
  const brandUpdates = [
    { name: 'Classic Aviator Sunglasses', brand: 'Aviator Pro' },
    { name: 'Blue Light Blocking Glasses', brand: 'TechVision' },
    { name: 'Designer Reading Glasses', brand: 'ReadWell' },
    { name: 'Sports Safety Glasses', brand: 'SportVision' },
    { name: 'Vintage Round Frames', brand: 'Vintage Style' }
  ];
  
  let updated = 0;
  let total = brandUpdates.length;
  
  brandUpdates.forEach(update => {
    db.run(
      `UPDATE products SET brand = ? WHERE name = ?`,
      [update.brand, update.name],
      function(err) {
        if (err) {
          console.error(`❌ Error updating ${update.name}:`, err.message);
        } else {
          console.log(`✅ Updated ${update.name} with brand: ${update.brand}`);
        }
        
        updated++;
        if (updated === total) {
          console.log('\n🎉 Brand column migration completed!');
          console.log('✅ All products now have brand information');
          db.close();
        }
      }
    );
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Migration interrupted');
  db.close();
  process.exit(0);
});

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database setup
const dbPath = path.join(__dirname, 'products.db');

// Sample products data
const sampleProducts = [
  {
    name: "Classic Aviator Sunglasses",
    price: 199.99,
    category: "Sunglasses",
    brand: "Aviator Pro",
    material: "Metal",
    shape: "Aviator",
    style: "Classic",
    frameColor: "Gold",
    description: "Timeless aviator style with premium UV protection and durable metal frame.",
    image: "",
    gallery: [],
    colors: [
      { name: "Gold", hex: "#FFD700" },
      { name: "Silver", hex: "#C0C0C0" }
    ],
    features: ["uv-protection", "lightweight", "durable"],
    lensTypes: ["Non-Prescription", "Prescription"],
    sizes: ["Medium", "Large"],
    discount: { hasDiscount: false, discountPercentage: 0 },
    status: "In Stock",
    featured: true,
    bestSeller: false
  },
  {
    name: "Blue Light Blocking Glasses",
    price: 89.99,
    category: "Computer Glasses",
    brand: "TechVision",
    material: "Plastic",
    shape: "Rectangle",
    style: "Modern",
    frameColor: "Black",
    description: "Reduce digital eye strain with advanced blue light filtering technology.",
    image: "",
    gallery: [],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Navy", hex: "#1B2951" }
    ],
    features: ["blue-light-filtering", "anti-glare", "lightweight"],
    lensTypes: ["Blue-Light", "Prescription"],
    sizes: ["Small", "Medium"],
    discount: { hasDiscount: true, discountPercentage: 15 },
    status: "In Stock",
    featured: false,
    bestSeller: true
  },
  {
    name: "Designer Reading Glasses",
    price: 129.99,
    category: "Reading Glasses",
    brand: "ReadWell",
    material: "Acetate",
    shape: "Round",
    style: "Retro",
    frameColor: "Tortoise",
    description: "Elegant reading glasses with premium acetate frames and crystal-clear lenses.",
    image: "",
    gallery: [],
    colors: [
      { name: "Tortoise", hex: "#D2691E" },
      { name: "Brown", hex: "#8B4513" }
    ],
    features: ["scratch-resistant", "lightweight", "adjustable-nose-pads"],
    lensTypes: ["Reading", "Progressive"],
    sizes: ["Medium"],
    discount: { hasDiscount: false, discountPercentage: 0 },
    status: "In Stock",
    featured: true,
    bestSeller: true
  },
  {
    name: "Sports Safety Glasses",
    price: 159.99,
    category: "Sports Glasses",
    brand: "SportVision",
    material: "Polycarbonate",
    shape: "Rectangle",
    style: "Athletic",
    frameColor: "Black",
    description: "High-impact protection for sports and outdoor activities with wraparound design.",
    image: "",
    gallery: [],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Charcoal", hex: "#36454F" }
    ],
    features: ["impact-resistant", "water-resistant", "durable", "uv-protection"],
    lensTypes: ["Non-Prescription", "Prescription"],
    sizes: ["Large"],
    discount: { hasDiscount: false, discountPercentage: 0 },
    status: "In Stock",
    featured: false,
    bestSeller: false
  },
  {
    name: "Vintage Round Frames",
    price: 179.99,
    category: "Fashion Glasses",
    brand: "Vintage Style",
    material: "Acetate",
    shape: "Round",
    style: "Vintage",
    frameColor: "Clear",
    description: "Classic round frames with modern comfort and vintage appeal.",
    image: "",
    gallery: [],
    colors: [
      { name: "Clear", hex: "#F8F8FF" },
      { name: "Rose Gold", hex: "#E8B4A0" }
    ],
    features: ["lightweight", "hypoallergenic", "flexible"],
    lensTypes: ["Non-Prescription", "Prescription", "Blue-Light"],
    sizes: ["Small", "Medium"],
    discount: { hasDiscount: true, discountPercentage: 10 },
    status: "In Stock",
    featured: true,
    bestSeller: false
  }
];

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

// Seed function
const seedProducts = () => {
  console.log('🌱 Starting product seeding process...');
  console.log(`📁 Database path: ${dbPath}`);
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err.message);
      process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
  });

  // Check if products already exist
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.error('❌ Error checking existing products:', err);
      return;
    }

    if (row.count > 0) {
      console.log(`📦 Found ${row.count} existing products in database`);
      console.log('⚠️  Skipping seeding to avoid duplicates');
      console.log('💡 To reseed, delete the products.db file first');
      db.close();
      return;
    }

    console.log('📦 No existing products found, proceeding with seeding...');
    
    let seeded = 0;
    let errors = 0;

    sampleProducts.forEach((product, index) => {
      const productData = serializeProduct(product);
      
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
          console.error(`❌ Error seeding product ${name}:`, err.message);
          errors++;
        } else {
          seeded++;
          console.log(`✅ Seeded: ${name} (ID: ${this.lastID})`);
        }
        
        // Check if all products are processed
        if (seeded + errors === sampleProducts.length) {
          console.log('\n🎉 Product seeding completed!');
          console.log(`✅ Successfully seeded: ${seeded} products`);
          if (errors > 0) {
            console.log(`❌ Errors: ${errors} products`);
          }
          console.log('\n🚀 You can now start the product server with:');
          console.log('   cd server && npm run dev:products');
          console.log('\n🌐 API will be available at: http://localhost:5004/api');
          
          db.close((err) => {
            if (err) {
              console.error('❌ Error closing database:', err.message);
            } else {
              console.log('✅ Database connection closed');
            }
          });
        }
      });
    });
  });
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Seeding interrupted');
  process.exit(0);
});

// Run the seeding
seedProducts();

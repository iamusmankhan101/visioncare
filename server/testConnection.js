const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5004;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ 
    success: true, 
    message: 'Products API Server is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Get all products endpoint
app.get('/api/products', (req, res) => {
  console.log('✅ Products requested');
  
  // Sample products data
  const sampleProducts = [
    {
      id: 1,
      name: "Classic Aviator Sunglasses",
      price: 89.99,
      originalPrice: 120.00,
      category: "sunglasses",
      brand: "RayBan",
      material: "Metal",
      shape: "Aviator",
      color: "Gold",
      size: "Medium",
      image: "/images/aviator-gold.jpg",
      description: "Classic aviator sunglasses with gold frame"
    },
    {
      id: 2,
      name: "Modern Square Glasses",
      price: 129.99,
      originalPrice: 160.00,
      category: "eyeglasses",
      brand: "Oakley",
      material: "Acetate",
      shape: "Square",
      color: "Black",
      size: "Large",
      image: "/images/square-black.jpg",
      description: "Modern square glasses with black acetate frame"
    }
  ];
  
  res.json({
    success: true,
    products: sampleProducts,
    count: sampleProducts.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Products API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛍️ Products endpoint: http://localhost:${PORT}/api/products`);
});

// Vercel Serverless Function for Products API
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Sample products data
const sampleProducts = [
  {
    name: "Classic Aviator Sunglasses",
    price: 2500,
    category: "Sunglasses",
    material: "Metal",
    shape: "Aviator",
    rim: "Full Rim",
    style: "Classic",
    colors: JSON.stringify([{ name: "Gold", hex: "#FFD700" }]),
    features: JSON.stringify(["uv-protection", "polarized"]),
    image: "/images/sunglasses.webp",
    featured: 1,
    bestSeller: 0,
    brand: "EyeWear Pro",
    gender: "Unisex",
    frameColor: "Gold",
    sizes: JSON.stringify(["Medium", "Large"]),
    lensTypes: JSON.stringify(["Non-Prescription"]),
    discount: JSON.stringify({ hasDiscount: false, discountPercentage: 0 }),
    status: "In Stock",
    description: "Classic aviator sunglasses with premium gold frame and UV protection."
  },
  {
    name: "Eco-Friendly Bamboo Frames",
    price: 3200,
    category: "Eyeglasses",
    material: "Wood",
    shape: "Rectangle",
    rim: "Full Rim",
    style: "Eco Friendly",
    colors: JSON.stringify([{ name: "Brown", hex: "#8B4513" }]),
    features: JSON.stringify(["lightweight", "eco-friendly", "hypoallergenic"]),
    image: "/images/eyeglasses.webp",
    featured: 0,
    bestSeller: 1,
    brand: "Green Vision",
    gender: "Unisex",
    frameColor: "Natural Brown",
    sizes: JSON.stringify(["Small", "Medium"]),
    lensTypes: JSON.stringify(["Prescription", "Blue-Light"]),
    discount: JSON.stringify({ hasDiscount: true, discountPercentage: 15 }),
    status: "In Stock",
    description: "Sustainable bamboo frames perfect for environmentally conscious customers."
  },
  {
    name: "Bold Statement Glasses",
    price: 2800,
    category: "Eyeglasses",
    material: "Acetate",
    shape: "Cat Eye",
    rim: "Full Rim",
    style: "Bold",
    colors: JSON.stringify([{ name: "Black", hex: "#000000" }]),
    features: JSON.stringify(["bold-design", "lightweight", "durable"]),
    image: "/images/eyeglasses.webp",
    featured: 1,
    bestSeller: 0,
    brand: "Bold Vision",
    gender: "Women",
    frameColor: "Matte Black",
    sizes: JSON.stringify(["Medium"]),
    lensTypes: JSON.stringify(["Prescription", "Non-Prescription"]),
    discount: JSON.stringify({ hasDiscount: false, discountPercentage: 0 }),
    status: "In Stock",
    description: "Make a bold statement with these striking cat-eye frames."
  },
  {
    name: "Retro Round Glasses",
    price: 2200,
    category: "Eyeglasses",
    material: "Metal",
    shape: "Round",
    rim: "Full Rim",
    style: "Retro",
    colors: JSON.stringify([{ name: "Copper", hex: "#B87333" }]),
    features: JSON.stringify(["vintage-style", "lightweight", "adjustable-nose-pads"]),
    image: "/images/eyeglasses.webp",
    featured: 0,
    bestSeller: 1,
    brand: "Vintage Look",
    gender: "Unisex",
    frameColor: "Antique Copper",
    sizes: JSON.stringify(["Small", "Medium"]),
    lensTypes: JSON.stringify(["Prescription", "Reading"]),
    discount: JSON.stringify({ hasDiscount: false, discountPercentage: 0 }),
    status: "In Stock",
    description: "Classic round frames with a vintage copper finish."
  },
  {
    name: "Street Style Urban Frames",
    price: 2600,
    category: "Sunglasses",
    material: "Plastic",
    shape: "Square",
    rim: "Full Rim",
    style: "Street Style",
    colors: JSON.stringify([{ name: "Black", hex: "#000000" }]),
    features: JSON.stringify(["urban-design", "impact-resistant", "uv-protection"]),
    image: "/images/sunglasses.webp",
    featured: 0,
    bestSeller: 0,
    brand: "Urban Edge",
    gender: "Men",
    frameColor: "Matte Black",
    sizes: JSON.stringify(["Medium", "Large"]),
    lensTypes: JSON.stringify(["Non-Prescription"]),
    discount: JSON.stringify({ hasDiscount: true, discountPercentage: 10 }),
    status: "In Stock",
    description: "Urban street style frames perfect for the modern trendsetter."
  },
  {
    name: "Artsy Designer Frames",
    price: 3500,
    category: "Eyeglasses",
    material: "Acetate",
    shape: "Geometric",
    rim: "Full Rim",
    style: "Artsy",
    colors: JSON.stringify([{ name: "Tortoise", hex: "#D2691E" }]),
    features: JSON.stringify(["designer-style", "unique-design", "lightweight"]),
    image: "/images/eyeglasses.webp",
    featured: 1,
    bestSeller: 0,
    brand: "Art Vision",
    gender: "Women",
    frameColor: "Tortoise Shell",
    sizes: JSON.stringify(["Medium"]),
    lensTypes: JSON.stringify(["Prescription", "Progressive"]),
    discount: JSON.stringify({ hasDiscount: false, discountPercentage: 0 }),
    status: "In Stock",
    description: "Unique geometric frames for the artistic and creative individual."
  }
];

// In-memory database for Vercel (since SQLite files don't persist)
let products = [...sampleProducts];
let nextId = products.length + 1;

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, url } = req;
  const urlPath = url.split('?')[0];

  try {
    // Health check
    if (urlPath === '/api/health') {
      return res.status(200).json({
        status: 'OK',
        message: 'Product API Server is running on Vercel',
        timestamp: new Date().toISOString()
      });
    }

    // Get all products
    if (method === 'GET' && urlPath === '/api/products') {
      const formattedProducts = products.map(product => ({
        ...product,
        id: product.id || nextId++,
        colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors,
        features: typeof product.features === 'string' ? JSON.parse(product.features) : product.features,
        sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes,
        lensTypes: typeof product.lensTypes === 'string' ? JSON.parse(product.lensTypes) : product.lensTypes,
        discount: typeof product.discount === 'string' ? JSON.parse(product.discount) : product.discount,
        featured: Boolean(product.featured),
        bestSeller: Boolean(product.bestSeller)
      }));

      return res.status(200).json({
        success: true,
        products: formattedProducts,
        count: formattedProducts.length
      });
    }

    // Get single product
    if (method === 'GET' && urlPath.startsWith('/api/products/')) {
      const id = parseInt(urlPath.split('/')[3]);
      const product = products.find(p => p.id === id);
      
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const formattedProduct = {
        ...product,
        colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors,
        features: typeof product.features === 'string' ? JSON.parse(product.features) : product.features,
        sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes,
        lensTypes: typeof product.lensTypes === 'string' ? JSON.parse(product.lensTypes) : product.lensTypes,
        discount: typeof product.discount === 'string' ? JSON.parse(product.discount) : product.discount,
        featured: Boolean(product.featured),
        bestSeller: Boolean(product.bestSeller)
      };

      return res.status(200).json({
        success: true,
        product: formattedProduct
      });
    }

    // Add new product
    if (method === 'POST' && urlPath === '/api/products') {
      const newProduct = {
        ...req.body,
        id: nextId++,
        colors: JSON.stringify(req.body.colors || []),
        features: JSON.stringify(req.body.features || []),
        sizes: JSON.stringify(req.body.sizes || []),
        lensTypes: JSON.stringify(req.body.lensTypes || []),
        discount: JSON.stringify(req.body.discount || { hasDiscount: false, discountPercentage: 0 }),
        featured: req.body.featured ? 1 : 0,
        bestSeller: req.body.bestSeller ? 1 : 0
      };

      products.push(newProduct);

      return res.status(201).json({
        success: true,
        message: 'Product added successfully',
        product: newProduct
      });
    }

    // Update product
    if (method === 'PUT' && urlPath.startsWith('/api/products/')) {
      const id = parseInt(urlPath.split('/')[3]);
      const productIndex = products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const updatedProduct = {
        ...products[productIndex],
        ...req.body,
        id: id,
        colors: JSON.stringify(req.body.colors || products[productIndex].colors),
        features: JSON.stringify(req.body.features || products[productIndex].features),
        sizes: JSON.stringify(req.body.sizes || products[productIndex].sizes),
        lensTypes: JSON.stringify(req.body.lensTypes || products[productIndex].lensTypes),
        discount: JSON.stringify(req.body.discount || products[productIndex].discount),
        featured: req.body.featured ? 1 : 0,
        bestSeller: req.body.bestSeller ? 1 : 0
      };

      products[productIndex] = updatedProduct;

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct
      });
    }

    // Delete product
    if (method === 'DELETE' && urlPath.startsWith('/api/products/')) {
      const id = parseInt(urlPath.split('/')[3]);
      const productIndex = products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      products.splice(productIndex, 1);

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    }

    // Route not found
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

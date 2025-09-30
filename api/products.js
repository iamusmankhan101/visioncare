// Vercel Serverless Function for Products API with Smart Storage
// Falls back to enhanced memory storage if KV is not available
import permanentStorage from './permanentStorage.js';
import storage from './storage.js';

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

export default async function handler(req, res) {
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
    // Initialize permanent storage with sample data if needed
    await permanentStorage.initializeWithSampleData(sampleProducts);

    // Health check with permanent storage information
    if (urlPath === '/api/health') {
      const stats = await permanentStorage.getStats();
      const healthCheck = await permanentStorage.healthCheck();
      
      return res.status(200).json({
        status: 'OK',
        message: 'Product API Server is running on Vercel with PERMANENT Storage',
        timestamp: new Date().toISOString(),
        storage: healthCheck,
        ...stats
      });
    }

    // Get all products from permanent storage
    if (method === 'GET' && urlPath === '/api/products') {
      const products = await permanentStorage.getProducts();
      const formattedProducts = products.map(product => ({
        ...product,
        id: product.id,
        colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors,
        features: typeof product.features === 'string' ? JSON.parse(product.features) : product.features,
        sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes,
        lensTypes: typeof product.lensTypes === 'string' ? JSON.parse(product.lensTypes) : product.lensTypes,
        discount: typeof product.discount === 'string' ? JSON.parse(product.discount) : product.discount,
        featured: Boolean(product.featured),
        bestSeller: Boolean(product.bestSeller)
      }));

      console.log(`📊 Returning ${formattedProducts.length} products from permanent storage`);

      return res.status(200).json({
        success: true,
        products: formattedProducts,
        count: formattedProducts.length,
        storage: 'permanent'
      });
    }

    // Get single product from permanent storage
    if (method === 'GET' && urlPath.startsWith('/api/products/')) {
      const id = parseInt(urlPath.split('/')[3]);
      
      try {
        const product = await permanentStorage.getProduct(id);
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
          product: formattedProduct,
          storage: 'permanent'
        });
      } catch (error) {
        return res.status(404).json({ 
          success: false, 
          message: error.message 
        });
      }
    }

    // Add new product to permanent storage
    if (method === 'POST' && urlPath === '/api/products') {
      const productData = {
        ...req.body,
        colors: JSON.stringify(req.body.colors || []),
        features: JSON.stringify(req.body.features || []),
        sizes: JSON.stringify(req.body.sizes || []),
        lensTypes: JSON.stringify(req.body.lensTypes || []),
        discount: JSON.stringify(req.body.discount || { hasDiscount: false, discountPercentage: 0 }),
        featured: req.body.featured ? 1 : 0,
        bestSeller: req.body.bestSeller ? 1 : 0
      };

      const newProduct = await permanentStorage.addProduct(productData);

      return res.status(201).json({
        success: true,
        message: 'Product added successfully to PERMANENT storage',
        product: newProduct,
        storage: 'permanent'
      });
    }

    // Update product in permanent storage
    if (method === 'PUT' && urlPath.startsWith('/api/products/')) {
      const id = parseInt(urlPath.split('/')[3]);
      
      try {
        const productData = {
          ...req.body,
          colors: JSON.stringify(req.body.colors || []),
          features: JSON.stringify(req.body.features || []),
          sizes: JSON.stringify(req.body.sizes || []),
          lensTypes: JSON.stringify(req.body.lensTypes || []),
          discount: JSON.stringify(req.body.discount || { hasDiscount: false, discountPercentage: 0 }),
          featured: req.body.featured ? 1 : 0,
          bestSeller: req.body.bestSeller ? 1 : 0
        };

        const updatedProduct = await permanentStorage.updateProduct(id, productData);

        return res.status(200).json({
          success: true,
          message: 'Product updated successfully in PERMANENT storage',
          product: updatedProduct,
          storage: 'permanent'
        });
      } catch (error) {
        return res.status(404).json({ 
          success: false, 
          message: error.message 
        });
      }
    }

    // Delete product from permanent storage
    if (method === 'DELETE' && urlPath.startsWith('/api/products/')) {
      const id = parseInt(urlPath.split('/')[3]);
      
      try {
        const deletedProduct = await permanentStorage.deleteProduct(id);

        return res.status(200).json({
          success: true,
          message: 'Product deleted successfully from PERMANENT storage',
          product: deletedProduct,
          storage: 'permanent'
        });
      } catch (error) {
        return res.status(404).json({ 
          success: false, 
          message: error.message 
        });
      }
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

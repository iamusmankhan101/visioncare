// Vercel Serverless Function for Products API with Upstash Redis
const { Redis } = require('@upstash/redis');

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// CORS headers - Allow all origins for API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'false'
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed' 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - Fetch all products
async function handleGet(req, res) {
  try {
    // Check for specific product ID in query
    const { id, search, category } = req.query;
    
    if (id) {
      // Get single product
      const product = await redis.hgetall(`product:${id}`);
      if (Object.keys(product).length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      return res.json({
        success: true,
        data: product
      });
    }
    
    if (search) {
      // Search products (simplified - in production you'd use Redis search)
      const allProductIds = await redis.smembers('products:all');
      const searchResults = [];
      
      for (const productId of allProductIds) {
        const product = await redis.hgetall(`product:${productId}`);
        if (product.name?.toLowerCase().includes(search.toLowerCase()) ||
            product.category?.toLowerCase().includes(search.toLowerCase())) {
          searchResults.push(product);
        }
      }
      
      return res.json({
        success: true,
        data: searchResults,
        count: searchResults.length,
        query: search
      });
    }
    
    if (category) {
      // Get products by category
      const categoryProductIds = await redis.smembers(`products:category:${category}`);
      const categoryProducts = [];
      
      for (const productId of categoryProductIds) {
        const product = await redis.hgetall(`product:${productId}`);
        if (Object.keys(product).length > 0) {
          categoryProducts.push(product);
        }
      }
      
      return res.json({
        success: true,
        data: categoryProducts,
        count: categoryProducts.length,
        category
      });
    }
    
    // Get all products
    const productIds = await redis.smembers('products:all');
    const products = [];
    
    for (const productId of productIds) {
      const product = await redis.hgetall(`product:${productId}`);
      if (Object.keys(product).length > 0) {
        products.push(product);
      }
    }
    
    return res.json({
      success: true,
      data: products,
      count: products.length,
      source: 'upstash'
    });
    
  } catch (error) {
    throw error;
  }
}

// POST - Create new product
async function handlePost(req, res) {
  try {
    const productData = req.body;
    const productId = productData.id || `prod_${Date.now()}`;
    const product = { 
      id: productId, 
      ...productData,
      createdAt: new Date().toISOString()
    };
    
    // Save to Redis
    await redis.hset(`product:${productId}`, product);
    await redis.sadd('products:all', productId);
    
    // Index by category
    if (product.category) {
      await redis.sadd(`products:category:${product.category}`, productId);
    }
    
    // Increment counter
    await redis.incr('stats:products:total');
    
    return res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
    
  } catch (error) {
    throw error;
  }
}

// PUT - Update product
async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const updates = { 
      ...req.body, 
      updatedAt: new Date().toISOString() 
    };
    delete updates.id; // Don't allow ID updates
    
    // Check if product exists
    const existingProduct = await redis.hgetall(`product:${id}`);
    if (Object.keys(existingProduct).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Update in Redis
    await redis.hset(`product:${id}`, updates);
    
    return res.json({
      success: true,
      data: { id, ...updates },
      message: 'Product updated successfully'
    });
    
  } catch (error) {
    throw error;
  }
}

// DELETE - Delete product
async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    
    // Get product details first
    const product = await redis.hgetall(`product:${id}`);
    if (Object.keys(product).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Remove from all sets
    await redis.srem('products:all', id);
    if (product.category) {
      await redis.srem(`products:category:${product.category}`, id);
    }
    
    // Delete product hash
    await redis.del(`product:${id}`);
    
    return res.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    throw error;
  }
}

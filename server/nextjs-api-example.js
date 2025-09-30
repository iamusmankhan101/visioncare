// Next.js API Route Example for Eyewear Products with Upstash Redis
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Initialize Redis from environment variables
const redis = Redis.fromEnv();

// GET /api/products - Get all products
export const GET = async (request) => {
  try {
    // Try to get products from Redis cache first
    const cachedProducts = await redis.get("products:all");
    
    if (cachedProducts) {
      return NextResponse.json({
        success: true,
        data: cachedProducts,
        count: cachedProducts.length,
        source: 'cache'
      });
    }

    // If not in cache, get from database (you'd implement your DB logic here)
    const products = await getProductsFromDatabase(); // Your DB function
    
    // Cache the results for 5 minutes
    await redis.setex("products:all", 300, JSON.stringify(products));
    
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      source: 'database'
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    }, { status: 500 });
  }
};

// POST /api/products - Create new product
export const POST = async (request) => {
  try {
    const productData = await request.json();
    
    // Generate unique ID
    const productId = productData.id || `prod_${Date.now()}`;
    const product = { id: productId, ...productData };
    
    // Save to Redis
    await redis.hset(`product:${productId}`, product);
    await redis.sadd('products:all', productId);
    
    // Invalidate cache
    await redis.del("products:all");
    
    // Increment product counter
    await redis.incr('stats:products:total');
    
    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create product',
      message: error.message
    }, { status: 500 });
  }
};

// PUT /api/products/[id] - Update product
export const PUT = async (request) => {
  try {
    const url = new URL(request.url);
    const productId = url.pathname.split('/').pop();
    const updates = await request.json();
    
    // Update in Redis
    await redis.hset(`product:${productId}`, updates);
    
    // Invalidate cache
    await redis.del("products:all");
    
    return NextResponse.json({
      success: true,
      data: { id: productId, ...updates },
      message: 'Product updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update product',
      message: error.message
    }, { status: 500 });
  }
};

// DELETE /api/products/[id] - Delete product
export const DELETE = async (request) => {
  try {
    const url = new URL(request.url);
    const productId = url.pathname.split('/').pop();
    
    // Get product details first
    const product = await redis.hgetall(`product:${productId}`);
    
    // Remove from Redis
    await redis.srem('products:all', productId);
    if (product.category) {
      await redis.srem(`products:category:${product.category}`, productId);
    }
    await redis.del(`product:${productId}`);
    
    // Invalidate cache
    await redis.del("products:all");
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete product',
      message: error.message
    }, { status: 500 });
  }
};

// Helper function (you'd implement this based on your needs)
async function getProductsFromDatabase() {
  // This would connect to your actual database
  // For now, return empty array
  return [];
}

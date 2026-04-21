// Vercel Serverless Function for Orders API with Upstash Redis
const { Redis } = require('@upstash/redis');

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    console.error('Orders API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - Fetch all orders
async function handleGet(req, res) {
  try {
    const { id, status, search, limit = 100 } = req.query;
    
    if (id) {
      // Get single order
      const order = await redis.hgetall(`order:${id}`);
      if (Object.keys(order).length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
      // Parse items back to array
      if (order.items) {
        try {
          order.items = JSON.parse(order.items);
        } catch (e) {
          order.items = [];
        }
      }
      
      return res.json({
        success: true,
        data: order
      });
    }
    
    // Get all orders
    const orderNumbers = await redis.smembers('orders:all');
    const orders = [];
    
    for (const orderNumber of orderNumbers.slice(0, parseInt(limit))) {
      const order = await redis.hgetall(`order:${orderNumber}`);
      if (Object.keys(order).length > 0) {
        // Parse items back to array
        if (order.items) {
          try {
            order.items = JSON.parse(order.items);
          } catch (e) {
            order.items = [];
          }
        }
        
        // Apply filters
        if (status && order.status !== status) continue;
        if (search && !order.customerName?.toLowerCase().includes(search.toLowerCase()) && 
                     !order.customerEmail?.toLowerCase().includes(search.toLowerCase()) &&
                     !order.orderNumber?.toLowerCase().includes(search.toLowerCase())) continue;
        
        orders.push(order);
      }
    }
    
    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));
    
    return res.json({
      success: true,
      orders: orders,
      count: orders.length,
      total: orderNumbers.length,
      source: 'upstash'
    });
    
  } catch (error) {
    throw error;
  }
}

// POST - Create new order
async function handlePost(req, res) {
  try {
    const orderData = req.body;
    const orderNumber = orderData.orderNumber || `ORD-${Date.now()}`;
    
    const order = {
      orderNumber,
      ...orderData,
      createdAt: new Date().toISOString(),
      status: orderData.status || 'pending'
    };
    
    // Serialize items array
    if (order.items) {
      order.items = JSON.stringify(order.items);
    }
    
    // Save to Redis
    await redis.hset(`order:${orderNumber}`, order);
    await redis.sadd('orders:all', orderNumber);
    
    // Index by status
    if (order.status) {
      await redis.sadd(`orders:status:${order.status}`, orderNumber);
    }
    
    // Increment order counter
    await redis.incr('stats:orders:total');
    
    return res.status(201).json({
      success: true,
      data: { ...order, items: orderData.items }, // Return original items array
      message: 'Order created successfully'
    });
    
  } catch (error) {
    throw error;
  }
}

// PUT - Update order
async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const updates = { 
      ...req.body, 
      updatedAt: new Date().toISOString() 
    };
    
    // Check if order exists
    const existingOrder = await redis.hgetall(`order:${id}`);
    if (Object.keys(existingOrder).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Handle status change indexing
    if (updates.status && updates.status !== existingOrder.status) {
      // Remove from old status index
      if (existingOrder.status) {
        await redis.srem(`orders:status:${existingOrder.status}`, id);
      }
      // Add to new status index
      await redis.sadd(`orders:status:${updates.status}`, id);
    }
    
    // Serialize items if present
    if (updates.items) {
      updates.items = JSON.stringify(updates.items);
    }
    
    // Update in Redis
    await redis.hset(`order:${id}`, updates);
    
    return res.json({
      success: true,
      data: { orderNumber: id, ...updates },
      message: 'Order updated successfully'
    });
    
  } catch (error) {
    throw error;
  }
}

// DELETE - Delete order
async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    
    // Get order details first
    const order = await redis.hgetall(`order:${id}`);
    if (Object.keys(order).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Remove from all sets
    await redis.srem('orders:all', id);
    if (order.status) {
      await redis.srem(`orders:status:${order.status}`, id);
    }
    
    // Delete order hash
    await redis.del(`order:${id}`);
    
    return res.json({
      success: true,
      message: 'Order deleted successfully'
    });
    
  } catch (error) {
    throw error;
  }
}

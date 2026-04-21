// Vercel Serverless Function for Health Check with Upstash Redis
import { Redis } from '@upstash/redis';

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  // CORS headers - Allow all origins for API access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'false');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Test Redis connection
    let upstashStatus = 'disconnected';
    let upstashMessage = 'Unable to connect to Upstash Redis';
    
    try {
      await redis.ping();
      upstashStatus = 'connected';
      upstashMessage = 'Upstash Redis is healthy';
    } catch (redisError) {
      upstashMessage = `Redis error: ${redisError.message}`;
    }

    // Get some basic stats
    let stats = {};
    try {
      const totalProducts = await redis.get('stats:products:total') || 0;
      const productIds = await redis.smembers('products:all');
      
      stats = {
        totalProducts: parseInt(totalProducts),
        activeProducts: productIds.length,
        timestamp: new Date().toISOString()
      };
    } catch (statsError) {
      stats = { error: 'Unable to fetch stats' };
    }

    return res.json({
      status: 'OK',
      message: 'Eyewear API Server is running',
      upstash: {
        status: upstashStatus,
        message: upstashMessage
      },
      stats,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

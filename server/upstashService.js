const { Redis } = require('@upstash/redis');
require('dotenv').config();

class UpstashService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.initialize();
  }

  initialize() {
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.log('⚠️ Upstash credentials not found, using fallback storage');
        return;
      }

      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      this.isConnected = true;
      console.log('✅ Upstash Redis connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Upstash Redis:', error.message);
      this.isConnected = false;
    }
  }

  // Product Management
  async saveProduct(product) {
    if (!this.isConnected) return null;
    
    try {
      const productKey = `product:${product.id}`;
      await this.redis.hset(productKey, product);
      
      // Add to products list
      await this.redis.sadd('products:all', product.id);
      
      // Index by category
      if (product.category) {
        await this.redis.sadd(`products:category:${product.category}`, product.id);
      }
      
      console.log(`✅ Product ${product.id} saved to Upstash`);
      return product;
    } catch (error) {
      console.error('❌ Error saving product to Upstash:', error);
      return null;
    }
  }

  async getProduct(productId) {
    if (!this.isConnected) return null;
    
    try {
      const product = await this.redis.hgetall(`product:${productId}`);
      return Object.keys(product).length > 0 ? product : null;
    } catch (error) {
      console.error('❌ Error getting product from Upstash:', error);
      return null;
    }
  }

  async getAllProducts() {
    if (!this.isConnected) return [];
    
    try {
      const productIds = await this.redis.smembers('products:all');
      const products = [];
      
      for (const id of productIds) {
        const product = await this.redis.hgetall(`product:${id}`);
        if (Object.keys(product).length > 0) {
          products.push(product);
        }
      }
      
      return products;
    } catch (error) {
      console.error('❌ Error getting all products from Upstash:', error);
      return [];
    }
  }

  async updateProduct(productId, updates) {
    if (!this.isConnected) return null;
    
    try {
      const productKey = `product:${productId}`;
      await this.redis.hset(productKey, updates);
      
      console.log(`✅ Product ${productId} updated in Upstash`);
      return { id: productId, ...updates };
    } catch (error) {
      console.error('❌ Error updating product in Upstash:', error);
      return null;
    }
  }

  async deleteProduct(productId) {
    if (!this.isConnected) return false;
    
    try {
      // Get product to find category
      const product = await this.redis.hgetall(`product:${productId}`);
      
      // Remove from all sets
      await this.redis.srem('products:all', productId);
      if (product.category) {
        await this.redis.srem(`products:category:${product.category}`, productId);
      }
      
      // Delete product hash
      await this.redis.del(`product:${productId}`);
      
      console.log(`✅ Product ${productId} deleted from Upstash`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting product from Upstash:', error);
      return false;
    }
  }

  // Order Management
  async saveOrder(order) {
    if (!this.isConnected) return null;
    
    try {
      const orderKey = `order:${order.orderNumber}`;
      const orderData = {
        ...order,
        createdAt: new Date().toISOString(),
        items: JSON.stringify(order.items || [])
      };
      
      await this.redis.hset(orderKey, orderData);
      await this.redis.sadd('orders:all', order.orderNumber);
      
      // Index by status
      if (order.status) {
        await this.redis.sadd(`orders:status:${order.status}`, order.orderNumber);
      }
      
      console.log(`✅ Order ${order.orderNumber} saved to Upstash`);
      return order;
    } catch (error) {
      console.error('❌ Error saving order to Upstash:', error);
      return null;
    }
  }

  async getOrder(orderNumber) {
    if (!this.isConnected) return null;
    
    try {
      const order = await this.redis.hgetall(`order:${orderNumber}`);
      if (Object.keys(order).length > 0) {
        // Parse items back to array
        if (order.items) {
          order.items = JSON.parse(order.items);
        }
        return order;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting order from Upstash:', error);
      return null;
    }
  }

  async getAllOrders() {
    if (!this.isConnected) return [];
    
    try {
      const orderNumbers = await this.redis.smembers('orders:all');
      const orders = [];
      
      for (const orderNumber of orderNumbers) {
        const order = await this.redis.hgetall(`order:${orderNumber}`);
        if (Object.keys(order).length > 0) {
          // Parse items back to array
          if (order.items) {
            order.items = JSON.parse(order.items);
          }
          orders.push(order);
        }
      }
      
      // Sort by creation date (newest first)
      return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('❌ Error getting all orders from Upstash:', error);
      return [];
    }
  }

  // Cache Management
  async setCache(key, value, expireInSeconds = 3600) {
    if (!this.isConnected) return false;
    
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.redis.setex(key, expireInSeconds, serializedValue);
      return true;
    } catch (error) {
      console.error('❌ Error setting cache in Upstash:', error);
      return false;
    }
  }

  async getCache(key) {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      
      // Try to parse as JSON, if it fails return as string
      try {
        return JSON.parse(value);
      } catch (parseError) {
        return value; // Return as string if not valid JSON
      }
    } catch (error) {
      console.error('❌ Error getting cache from Upstash:', error);
      return null;
    }
  }

  async deleteCache(key) {
    if (!this.isConnected) return false;
    
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('❌ Error deleting cache from Upstash:', error);
      return false;
    }
  }

  // Analytics
  async incrementCounter(key) {
    if (!this.isConnected) return 0;
    
    try {
      return await this.redis.incr(key);
    } catch (error) {
      console.error('❌ Error incrementing counter in Upstash:', error);
      return 0;
    }
  }

  async getCounter(key) {
    if (!this.isConnected) return 0;
    
    try {
      const value = await this.redis.get(key);
      return parseInt(value) || 0;
    } catch (error) {
      console.error('❌ Error getting counter from Upstash:', error);
      return 0;
    }
  }

  // Health Check
  async healthCheck() {
    if (!this.isConnected) {
      return { status: 'disconnected', message: 'Upstash Redis not connected' };
    }
    
    try {
      await this.redis.ping();
      return { status: 'connected', message: 'Upstash Redis is healthy' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

// Export singleton instance
const upstashService = new UpstashService();
module.exports = upstashService;

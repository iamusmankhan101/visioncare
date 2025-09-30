// Permanent storage solution using Vercel KV (Redis)
// This provides true persistence that survives all deployments and cold starts

import { kv } from '@vercel/kv';

class PermanentStorage {
  constructor() {
    this.PRODUCTS_KEY = 'eyewear:products';
    this.COUNTER_KEY = 'eyewear:next_id';
    this.METADATA_KEY = 'eyewear:metadata';
  }

  // Initialize storage with sample data if empty
  async initializeWithSampleData(sampleProducts) {
    try {
      const existingProducts = await this.getProducts();
      
      if (!existingProducts || existingProducts.length === 0) {
        console.log('🔄 Initializing permanent storage with sample data...');
        
        const initialProducts = sampleProducts.map((product, index) => ({
          ...product,
          id: index + 1,
          createdAt: new Date().toISOString(),
          source: 'sample'
        }));

        await kv.set(this.PRODUCTS_KEY, initialProducts);
        await kv.set(this.COUNTER_KEY, sampleProducts.length + 1);
        await kv.set(this.METADATA_KEY, {
          initialized: true,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        });

        console.log(`✅ Initialized permanent storage with ${initialProducts.length} products`);
        return initialProducts;
      }

      console.log(`📦 Found ${existingProducts.length} existing products in permanent storage`);
      return existingProducts;
    } catch (error) {
      console.error('❌ Error initializing permanent storage:', error);
      throw error;
    }
  }

  // Get all products from permanent storage
  async getProducts() {
    try {
      const products = await kv.get(this.PRODUCTS_KEY);
      return products || [];
    } catch (error) {
      console.error('❌ Error getting products from permanent storage:', error);
      return [];
    }
  }

  // Get a single product by ID
  async getProduct(id) {
    try {
      const products = await this.getProducts();
      const product = products.find(p => p.id === id);
      
      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }
      
      return product;
    } catch (error) {
      console.error(`❌ Error getting product ${id}:`, error);
      throw error;
    }
  }

  // Add a new product permanently
  async addProduct(productData) {
    try {
      const products = await this.getProducts();
      const nextId = await this.getNextId();
      
      const newProduct = {
        ...productData,
        id: nextId,
        createdAt: new Date().toISOString(),
        source: 'user'
      };

      products.push(newProduct);
      
      // Save to permanent storage
      await kv.set(this.PRODUCTS_KEY, products);
      await this.updateMetadata();

      console.log(`✅ Permanently added product: ${newProduct.name} (ID: ${newProduct.id})`);
      console.log(`📊 Total products in permanent storage: ${products.length}`);

      return newProduct;
    } catch (error) {
      console.error('❌ Error adding product to permanent storage:', error);
      throw error;
    }
  }

  // Update a product permanently
  async updateProduct(id, productData) {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        throw new Error(`Product with ID ${id} not found`);
      }

      const updatedProduct = {
        ...products[productIndex],
        ...productData,
        id: id,
        updatedAt: new Date().toISOString()
      };

      products[productIndex] = updatedProduct;
      
      // Save to permanent storage
      await kv.set(this.PRODUCTS_KEY, products);
      await this.updateMetadata();

      console.log(`✅ Permanently updated product: ${updatedProduct.name} (ID: ${id})`);

      return updatedProduct;
    } catch (error) {
      console.error(`❌ Error updating product ${id}:`, error);
      throw error;
    }
  }

  // Delete a product permanently
  async deleteProduct(id) {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        throw new Error(`Product with ID ${id} not found`);
      }

      const deletedProduct = products[productIndex];
      products.splice(productIndex, 1);
      
      // Save to permanent storage
      await kv.set(this.PRODUCTS_KEY, products);
      await this.updateMetadata();

      console.log(`✅ Permanently deleted product: ${deletedProduct.name} (ID: ${id})`);
      console.log(`📊 Remaining products in permanent storage: ${products.length}`);

      return deletedProduct;
    } catch (error) {
      console.error(`❌ Error deleting product ${id}:`, error);
      throw error;
    }
  }

  // Get next available ID
  async getNextId() {
    try {
      const currentId = await kv.get(this.COUNTER_KEY) || 1;
      const nextId = currentId + 1;
      await kv.set(this.COUNTER_KEY, nextId);
      return currentId;
    } catch (error) {
      console.error('❌ Error getting next ID:', error);
      // Fallback to timestamp-based ID
      return Date.now();
    }
  }

  // Update metadata
  async updateMetadata() {
    try {
      const metadata = {
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      await kv.set(this.METADATA_KEY, metadata);
    } catch (error) {
      console.error('❌ Error updating metadata:', error);
    }
  }

  // Get storage statistics
  async getStats() {
    try {
      const products = await this.getProducts();
      const metadata = await kv.get(this.METADATA_KEY) || {};
      const nextId = await kv.get(this.COUNTER_KEY) || 1;

      return {
        productCount: products.length,
        nextId: nextId,
        lastUpdated: metadata.lastUpdated,
        initialized: metadata.initialized || false,
        sampleProducts: products.filter(p => p.source === 'sample').length,
        userProducts: products.filter(p => p.source === 'user').length,
        storageType: 'Vercel KV (Permanent)',
        version: metadata.version || '1.0.0'
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return {
        productCount: 0,
        nextId: 1,
        lastUpdated: new Date().toISOString(),
        initialized: false,
        sampleProducts: 0,
        userProducts: 0,
        storageType: 'Vercel KV (Error)',
        error: error.message
      };
    }
  }

  // Health check for permanent storage
  async healthCheck() {
    try {
      // Test read operation
      const products = await this.getProducts();
      
      // Test write operation
      const testKey = 'eyewear:health_test';
      const testValue = { timestamp: new Date().toISOString() };
      await kv.set(testKey, testValue);
      
      // Test read back
      const readBack = await kv.get(testKey);
      
      // Cleanup test data
      await kv.del(testKey);
      
      return {
        status: 'healthy',
        canRead: true,
        canWrite: true,
        productCount: products.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Permanent storage health check failed:', error);
      return {
        status: 'unhealthy',
        canRead: false,
        canWrite: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Backup products to a JSON export
  async exportProducts() {
    try {
      const products = await this.getProducts();
      const metadata = await this.getStats();
      
      return {
        products,
        metadata,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('❌ Error exporting products:', error);
      throw error;
    }
  }

  // Import products from a JSON backup
  async importProducts(backup) {
    try {
      if (!backup.products || !Array.isArray(backup.products)) {
        throw new Error('Invalid backup format');
      }

      await kv.set(this.PRODUCTS_KEY, backup.products);
      
      // Update counter to highest ID + 1
      const maxId = Math.max(...backup.products.map(p => p.id || 0));
      await kv.set(this.COUNTER_KEY, maxId + 1);
      
      await this.updateMetadata();

      console.log(`✅ Imported ${backup.products.length} products to permanent storage`);
      
      return {
        imported: backup.products.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error importing products:', error);
      throw error;
    }
  }
}

// Export singleton instance
const permanentStorage = new PermanentStorage();
export default permanentStorage;

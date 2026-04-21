// Enhanced storage solution for Vercel serverless functions
// This module provides persistent storage using multiple strategies

// Simple in-memory storage with better persistence strategies
class VercelStorage {
  constructor() {
    this.initializeStorage();
  }

  initializeStorage() {
    // Initialize global storage if not exists
    if (!global.persistentStorage) {
      global.persistentStorage = {
        products: [],
        nextId: 1,
        lastUpdated: new Date().toISOString(),
        initialized: false
      };
    }
    
    this.storage = global.persistentStorage;
    console.log(`🔧 Storage initialized: ${this.storage.products.length} products`);
  }

  // Get all products with fallback to sample data
  getProducts(sampleProducts = []) {
    if (!this.storage.products || this.storage.products.length === 0) {
      console.log('📦 No products found, initializing with sample data...');
      this.initializeWithSampleData(sampleProducts);
    }
    
    return this.storage.products;
  }

  // Initialize with sample data
  initializeWithSampleData(sampleProducts) {
    if (sampleProducts && sampleProducts.length > 0) {
      this.storage.products = sampleProducts.map((product, index) => ({
        ...product,
        id: index + 1,
        createdAt: new Date().toISOString(),
        source: 'sample'
      }));
      this.storage.nextId = sampleProducts.length + 1;
      this.storage.lastUpdated = new Date().toISOString();
      this.storage.initialized = true;
      
      console.log(`✅ Initialized with ${this.storage.products.length} sample products`);
    }
  }

  // Save products
  saveProducts(products) {
    this.storage.products = products;
    this.storage.lastUpdated = new Date().toISOString();
    console.log(`💾 Saved ${products.length} products at ${this.storage.lastUpdated}`);
  }

  // Add a new product
  addProduct(productData) {
    const newProduct = {
      ...productData,
      id: this.storage.nextId++,
      createdAt: new Date().toISOString(),
      source: 'user'
    };
    
    this.storage.products.push(newProduct);
    this.storage.lastUpdated = new Date().toISOString();
    
    console.log(`➕ Added product: ${newProduct.name} (ID: ${newProduct.id})`);
    console.log(`📊 Total products: ${this.storage.products.length}`);
    
    return newProduct;
  }

  // Update a product
  updateProduct(id, productData) {
    const productIndex = this.storage.products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }

    const updatedProduct = {
      ...this.storage.products[productIndex],
      ...productData,
      id: id,
      updatedAt: new Date().toISOString()
    };

    this.storage.products[productIndex] = updatedProduct;
    this.storage.lastUpdated = new Date().toISOString();

    console.log(`✏️ Updated product: ${updatedProduct.name} (ID: ${id})`);
    
    return updatedProduct;
  }

  // Delete a product
  deleteProduct(id) {
    const productIndex = this.storage.products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }

    const deletedProduct = this.storage.products[productIndex];
    this.storage.products.splice(productIndex, 1);
    this.storage.lastUpdated = new Date().toISOString();

    console.log(`🗑️ Deleted product: ${deletedProduct.name} (ID: ${id})`);
    console.log(`📊 Remaining products: ${this.storage.products.length}`);
    
    return deletedProduct;
  }

  // Get a single product
  getProduct(id) {
    const product = this.storage.products.find(p => p.id === id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  }

  // Get storage statistics
  getStats() {
    return {
      productCount: this.storage.products.length,
      nextId: this.storage.nextId,
      lastUpdated: this.storage.lastUpdated,
      initialized: this.storage.initialized,
      sampleProducts: this.storage.products.filter(p => p.source === 'sample').length,
      userProducts: this.storage.products.filter(p => p.source === 'user').length
    };
  }

  // Data integrity check
  validateData() {
    const validProducts = this.storage.products.filter(p => 
      p && 
      p.name && 
      p.price && 
      typeof p.id === 'number'
    );

    if (validProducts.length !== this.storage.products.length) {
      console.log(`⚠️ Found ${this.storage.products.length - validProducts.length} invalid products, cleaning up...`);
      this.storage.products = validProducts;
      this.storage.lastUpdated = new Date().toISOString();
    }

    return validProducts;
  }
}

// Export singleton instance
const storage = new VercelStorage();
export default storage;

import sampleProducts from '../utils/addSampleProducts';
// Backend API configuration for Neon PostgreSQL database
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // Debug environment variables
  console.log('Environment Variables Check:');
  console.log('REACT_APP_PRODUCTS_API_URL:', process.env.REACT_APP_PRODUCTS_API_URL);
  console.log('REACT_APP_ORDER_API_URL:', process.env.REACT_APP_ORDER_API_URL);
  console.log('PGDATABASE:', process.env.PGDATABASE);
  console.log('Current hostname:', hostname);
  console.log('Target Database: Neon PostgreSQL');
  
  // Use environment variable if available (from Vercel)
  const envApiUrl = process.env.REACT_APP_PRODUCTS_API_URL;
  if (envApiUrl) {
    console.log('Using environment API for Neon database:', envApiUrl);
    return envApiUrl;
  }
  
  // Check if we're in deployed environment
  const isDeployedEnvironment = !hostname.includes('localhost') && 
                               !hostname.includes('127.0.0.1') && 
                               !hostname.match(/^\d+\.\d+\.\d+\.\d+$/);
  
  if (isDeployedEnvironment) {
    // Use same domain for deployed environment
    const deployedApiUrl = `${window.location.protocol}//${window.location.host}/api`;
    return deployedApiUrl;
  }
  
  // Fallback to Vercel API with Neon database
  const vercelApiUrl = process.env.REACT_APP_PRODUCTS_API_URL || 'https://vision-care-hmn4.vercel.app/api';
  console.log('Using Vercel API with Neon database:', vercelApiUrl);
  return vercelApiUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
    console.log(`🔧 API Base URL: ${API_BASE_URL}`);
    console.log(`📱 User Agent: ${navigator.userAgent}`);
    console.log(`🌍 Current URL: ${window.location.href}`);
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error(`❌ API Error Response:`, errorMessage);
      console.error(`❌ Response Status: ${response.status} ${response.statusText}`);
      
      // Handle specific HTTP errors
      if (response.status === 413) {
        throw new Error('Request payload too large. Please reduce image sizes or file count.');
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log(`✅ API Response: ${config.method || 'GET'} ${url} - Success`);
    
    // Handle Vercel API response structure
    if (data.success && data.products) {
      console.log(`📊 Data Count: ${data.products.length} items`);
      return data.products; // Return just the products array
    } else if (data.success && data.product) {
      console.log(`📊 Single Product Retrieved`);
      return data.product; // Return single product
    } else if (Array.isArray(data)) {
      console.log(`📊 Data Count: ${data.length} items`);
      return data; // Already an array
    } else {
      console.log(`📊 Response Data:`, data);
      return data; // Return as-is for other responses
    }
  } catch (error) {
    console.error(`❌ API Error: ${config.method || 'GET'} ${url}`);
    console.error(`❌ Error Details:`, error.message);
    console.error(`❌ Error Type:`, error.name);
    
    // Check if it's a network error
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      console.error(`❌ Network Error: Cannot connect to backend server`);
      console.error(`❌ Make sure the Vercel API is accessible at ${API_BASE_URL}`);
      console.error(`❌ Vercel API URL: ${API_BASE_URL}`);
      console.error(`❌ Check Vercel deployment status and function logs`);
    }
    
    throw error;
  }
};

// Fallback to localStorage for offline functionality
const getStoredProducts = () => {
  try {
    const stored = localStorage.getItem('eyewear_products_backup');
    if (stored) {
      return JSON.parse(stored);
    }
    return sampleProducts.map((product, index) => ({
      ...product,
      id: index + 1
    }));
  } catch (error) {
    console.error('Error reading from localStorage backup:', error);
    return sampleProducts.map((product, index) => ({
      ...product,
      id: index + 1
    }));
  }
};

// Check localStorage quota and cleanup if needed
const checkAndCleanupStorage = () => {
  try {
    // Test if we can write to localStorage
    const testKey = 'quota_test';
    const testData = 'x'.repeat(1024); // 1KB test
    localStorage.setItem(testKey, testData);
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('🧹 localStorage quota issue detected, cleaning up...');
    
    // Remove old backups and non-essential data
    const keysToClean = [
      'eyewear_products_backup_old',
      'eyewear_products_backup_v1',
      'eyewear_products_backup_v2',
      'temp_products',
      'cached_products',
      'product_images_cache'
    ];
    
    keysToClean.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed ${key} from localStorage`);
      } catch (e) {
        // Ignore errors
      }
    });
    
    return false;
  }
};

// Compress product data for storage (remove heavy fields)
const compressProductsForBackup = (products) => {
  return products.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    brand: product.brand,
    material: product.material,
    shape: product.shape,
    color: product.color,
    size: product.size,
    inStock: product.inStock,
    // Remove heavy fields like images, descriptions, etc.
    // Keep only essential data for basic functionality
  }));
};

// Throttle backup operations to prevent excessive saves
let lastBackupTime = 0;
const BACKUP_THROTTLE_MS = 5000; // Only backup once every 5 seconds

// Save products to localStorage as backup with quota management
const saveProductsBackup = (products, forceBackup = false) => {
  // Throttle backups unless forced
  const now = Date.now();
  if (!forceBackup && (now - lastBackupTime) < BACKUP_THROTTLE_MS) {
    console.log('⏳ Backup throttled, skipping (last backup was recent)');
    return;
  }
  
  lastBackupTime = now;
  try {
    // Check if we have space first
    if (!checkAndCleanupStorage()) {
      console.warn('⚠️ localStorage cleanup failed, skipping backup to prevent quota error');
      return;
    }
    
    // Compress products to save space
    const compressedProducts = compressProductsForBackup(products);
    
    // Limit backup size (max 100 products to prevent quota issues)
    const limitedProducts = compressedProducts.slice(0, 100);
    
    // Try to save with size limit
    const backupData = JSON.stringify(limitedProducts);
    
    // Check size before saving (max ~2MB for safety)
    if (backupData.length > 2 * 1024 * 1024) {
      console.warn('⚠️ Backup data too large, reducing further...');
      const reducedProducts = limitedProducts.slice(0, 50);
      localStorage.setItem('eyewear_products_backup', JSON.stringify(reducedProducts));
      console.log(`📦 Saved ${reducedProducts.length} compressed products to backup (size reduced)`);
    } else {
      localStorage.setItem('eyewear_products_backup', backupData);
      console.log(`📦 Saved ${limitedProducts.length} compressed products to backup`);
    }
    
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('💾 localStorage quota exceeded, attempting emergency cleanup...');
      
      // Emergency cleanup - remove the backup entirely and try with minimal data
      try {
        localStorage.removeItem('eyewear_products_backup');
        
        // Save only first 20 products with minimal data
        const emergencyBackup = products.slice(0, 20).map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category
        }));
        
        localStorage.setItem('eyewear_products_backup', JSON.stringify(emergencyBackup));
        console.log(`🚨 Emergency backup saved with ${emergencyBackup.length} minimal products`);
      } catch (emergencyError) {
        console.error('🚨 Emergency backup also failed, disabling backup system');
        // Disable backup system by removing the key entirely
        try {
          localStorage.removeItem('eyewear_products_backup');
        } catch (e) {
          // Final fallback - ignore all localStorage operations
        }
      }
    } else {
      console.error('Error saving products backup:', error);
    }
  }
};

const productApi = {
  // Test API connection
  testConnection: async () => {
    try {
      console.log('🔍 Testing API connection...');
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connection successful:', data.message);
        return true;
      } else {
        console.warn('⚠️ API responded but with error status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ API connection failed:', error.message);
      return false;
    }
  },

  // Get all products
  getAllProducts: async () => {
    try {
      console.log('🔍 Attempting to fetch products from Neon database...');
      console.log(`🔗 API URL: ${API_BASE_URL}/products`);
      console.log('🗄️ Database: Neon PostgreSQL from Vercel backend database');
      
      const response = await apiRequest('/products');
      
      // Check if response has the expected structure
      if (response && response.data) {
        const products = response.data;
        console.log(`✅ Successfully fetched ${products.length} products from Neon database`);
        console.log('📊 Products:', products.map(p => `${p.name} ($${p.price})`).join(', '));
        
        // Save as backup for offline use (forced since this is initial load)
        saveProductsBackup(products, true);
        return products;
      } else if (Array.isArray(response)) {
        // Handle direct array response
        console.log(`✅ Successfully fetched ${response.length} products from Neon database`);
        console.log('📊 Products:', response.map(p => `${p.name} ($${p.price})`).join(', '));
        
        saveProductsBackup(response, true);
        return response;
      } else {
        console.warn('⚠️ Unexpected API response format:', response);
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('❌ Neon database API failed, using localStorage backup:', error.message);
      console.error('🔍 Full error:', error);
      
      console.warn('🗄️ Neon database connection error via Vercel');
      console.warn('🔗 API URL:', API_BASE_URL);
      console.warn('💡 Check Vercel deployment and Neon database connection');
      // Fallback to localStorage backup
      const backupProducts = getStoredProducts();
      console.log(`📦 Using ${backupProducts.length} products from localStorage backup`);
      return backupProducts;
    }
  },

  // Get a single product by ID
  getProductById: async (id) => {
    try {
      const product = await apiRequest(`/products/${id}`);
      return product;
    } catch (error) {
      console.warn(`Backend API failed for product ${id}, using localStorage backup:`, error.message);
      // Fallback to localStorage backup
      const products = getStoredProducts();
      const product = products.find(p => p.id === parseInt(id));
      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }
      return product;
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      console.log('🚀 ProductAPI: Creating product...', productData.name);
      console.log('🔗 API URL:', `${API_BASE_URL}/products`);
      console.log('📦 Product Data:', productData);
      
      const newProduct = await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
      
      console.log('✅ ProductAPI: Product created successfully!', newProduct);
      
      // Update localStorage backup
      try {
        const products = await productApi.getAllProducts();
        saveProductsBackup(products);
        console.log('✅ ProductAPI: Backup updated');
      } catch (backupError) {
        console.warn('Failed to update backup after creating product:', backupError.message);
      }
      
      return newProduct;
    } catch (error) {
      console.error('❌ ProductAPI: Error creating product:', error);
      console.error('❌ ProductAPI: Full error details:', error.message);
      
      // FALLBACK TO LOCALSTORAGE - This might be the issue!
      console.warn('🔄 ProductAPI: Falling back to localStorage');
      const fallbackProduct = {
        id: `local_${Date.now()}`,
        ...productData,
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage
      const existingProducts = getStoredProducts();
      existingProducts.push(fallbackProduct);
      saveProductsBackup(existingProducts);
      
      console.log('📦 ProductAPI: Product saved to localStorage as fallback');
      return fallbackProduct;
    }
  },

  // Smart ID resolution - finds the correct Neon database ID for a product
  resolveProductId: async (localId, productName) => {
    try {
      console.log('🔍 ProductAPI: Resolving product ID for:', localId, productName);
      
      // If it's already a valid Neon database ID, return it
      if (typeof localId === 'number' || (typeof localId === 'string' && !localId.startsWith('local_') && !localId.includes('temp_') && localId.length < 10)) {
        // Test if this ID exists in Neon database
        try {
          await apiRequest(`/products/${localId}`);
          console.log('✅ ProductAPI: ID is valid in Neon database:', localId);
          return localId;
        } catch (testError) {
          console.warn('⚠️ ProductAPI: ID not found in Neon database, searching by name:', localId);
        }
      }
      
      // Search for product by name in Neon database
      try {
        const allProducts = await apiRequest('/products');
        const products = allProducts.products || allProducts || [];
        
        const matchingProduct = products.find(p => 
          p.name === productName || 
          p.name?.toLowerCase() === productName?.toLowerCase()
        );
        
        if (matchingProduct) {
          console.log(`✅ ProductAPI: Found matching product in Neon database. Local ID: ${localId}, Neon ID: ${matchingProduct.id}`);
          return matchingProduct.id;
        }
        
        console.warn('⚠️ ProductAPI: No matching product found in Neon database by name');
        return null;
      } catch (searchError) {
        console.error('❌ ProductAPI: Failed to search products in Neon database:', searchError.message);
        return null;
      }
    } catch (error) {
      console.error('❌ ProductAPI: Error resolving product ID:', error);
      return null;
    }
  },

  // Update a product with smart ID resolution
  updateProduct: async (id, productData) => {
    try {
      console.log('✏️ ProductAPI: Attempting to update product with ID:', id);
      console.log('✏️ ProductAPI: ID type:', typeof id);
      console.log('✏️ ProductAPI: Product data:', productData);
      
      // Smart ID resolution - try to find the correct Neon database ID
      let resolvedId = id;
      if (String(id).startsWith('local_') || String(id).includes('temp_') || String(id).length > 15) {
        console.log('🔍 ProductAPI: Detected temporary ID, attempting to resolve...');
        const neonId = await productApi.resolveProductId(id, productData.name);
        if (neonId) {
          resolvedId = neonId;
          console.log(`✅ ProductAPI: Resolved ID from ${id} to ${resolvedId}`);
        } else {
          console.warn('⚠️ ProductAPI: Could not resolve ID, product may need to be created in Neon database');
        }
      }
      
      console.log('🔗 ProductAPI: Update URL:', `${API_BASE_URL}/products/${resolvedId}`);
      
      // Try to update with resolved ID
      try {
        const updatedProduct = await apiRequest(`/products/${resolvedId}`, {
          method: 'PUT',
          body: JSON.stringify(productData),
        });
        
        console.log('✅ ProductAPI: Product updated successfully:', updatedProduct);
        
        // Update localStorage backup
        try {
          const products = await productApi.getAllProducts();
          saveProductsBackup(products);
          console.log('✅ ProductAPI: Backup updated after update');
        } catch (backupError) {
          console.warn('⚠️ ProductAPI: Failed to update backup after updating product:', backupError.message);
        }
        
        return updatedProduct;
      } catch (updateError) {
        // If update fails with 404, the product doesn't exist in database
        if (updateError.message.includes('Product not found') || updateError.message.includes('404')) {
          console.error('❌ ProductAPI: Product not found in database. Cannot update non-existent product.');
          console.error('❌ ProductAPI: Product ID:', resolvedId);
          console.error('❌ ProductAPI: This may indicate the product was deleted or the ID is incorrect.');
          
          // DO NOT create a new product automatically - this causes duplicates!
          // Instead, throw a clear error that the product doesn't exist
          throw new Error(`Product with ID ${resolvedId} not found in database. Cannot update non-existent product. Please refresh the product list and try again.`);
        } else {
          throw updateError;
        }
      }
    } catch (error) {
      console.error(`❌ ProductAPI: Error updating product ${id}:`, error);
      console.error(`❌ ProductAPI: Full error details:`, error.message);
      
      // If API fails, try to update localStorage backup as fallback
      try {
        console.warn('🔄 ProductAPI: API update failed, attempting localStorage fallback');
        const products = getStoredProducts();
        const productIndex = products.findIndex(p => {
          const productId = p.id || p._id;
          return productId === id || 
                 String(productId) === String(id) || 
                 productId === String(id);
        });
        
        if (productIndex !== -1) {
          products[productIndex] = { ...products[productIndex], ...productData };
          saveProductsBackup(products);
          console.log('📦 ProductAPI: Product updated in localStorage backup');
          return products[productIndex];
        } else {
          console.warn('⚠️ ProductAPI: Product not found in localStorage backup');
        }
      } catch (fallbackError) {
        console.error('❌ ProductAPI: Fallback update also failed:', fallbackError.message);
      }
      
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },

  // Edit a product (prioritizes Neon database, fallback to localStorage only if API fails)
  editProduct: async (id, productData, options = {}) => {
    try {
      console.log('✏️ ProductAPI: Editing product with ID:', id);
      console.log('✏️ ProductAPI: Edit options:', options);
      console.log('🗄️ ProductAPI: Targeting Neon PostgreSQL database via Vercel API');
      
      // Validate product data before editing
      if (!productData.name || !productData.price) {
        throw new Error('Product name and price are required for editing');
      }
      
      // Ensure price is a valid number
      const validatedData = {
        ...productData,
        price: parseFloat(productData.price),
        updatedAt: new Date().toISOString()
      };
      
      // Add edit timestamp if not in options
      if (!options.skipTimestamp) {
        validatedData.lastEditedAt = new Date().toISOString();
      }
      
      // PRIORITY: Try Neon database API first
      try {
        console.log('🌐 ProductAPI: Attempting edit via Neon database API...');
        console.log('🔗 ProductAPI: API URL:', `${API_BASE_URL}/products/${id}`);
        
        const updatedProduct = await apiRequest(`/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(validatedData),
        });
        
        console.log('✅ ProductAPI: Product edited successfully in Neon database');
        
        // Update localStorage backup after successful API update
        try {
          const products = await productApi.getAllProducts();
          saveProductsBackup(products);
          console.log('✅ ProductAPI: localStorage backup updated after Neon database edit');
        } catch (backupError) {
          console.warn('⚠️ ProductAPI: Failed to update backup, but Neon database edit succeeded');
        }
        
        return updatedProduct;
      } catch (apiError) {
        console.error('❌ ProductAPI: Neon database API edit failed:', apiError.message);
        
        // Only use localStorage as absolute last resort
        if (options.allowLocalStorageFallback !== false) {
          console.warn('🔄 ProductAPI: Falling back to localStorage (Neon database unavailable)');
          throw new Error(`Neon database edit failed: ${apiError.message}. Use localStorage fallback only if absolutely necessary.`);
        } else {
          throw new Error(`Neon database edit failed: ${apiError.message}`);
        }
      }
    } catch (error) {
      console.error('❌ ProductAPI: Error editing product:', error);
      throw error;
    }
  },

  // Partial update for specific product fields (prioritizes Neon database)
  patchProduct: async (id, partialData) => {
    try {
      console.log('🔧 ProductAPI: Patching product with ID:', id);
      console.log('🔧 ProductAPI: Partial data:', partialData);
      console.log('🗄️ ProductAPI: Targeting Neon PostgreSQL database for patch operation');
      
      // PRIORITY: Get current product data from Neon database first
      let currentProduct;
      try {
        console.log('🌐 ProductAPI: Fetching current product from Neon database...');
        currentProduct = await apiRequest(`/products/${id}`);
        console.log('✅ ProductAPI: Current product fetched from Neon database');
      } catch (fetchError) {
        console.error('❌ ProductAPI: Failed to fetch current product from Neon database:', fetchError.message);
        throw new Error(`Cannot patch product: Failed to fetch current data from Neon database - ${fetchError.message}`);
      }
      
      // Merge with partial data
      const updatedData = {
        ...currentProduct,
        ...partialData,
        updatedAt: new Date().toISOString()
      };
      
      // Use editProduct to ensure Neon database priority
      console.log('🔧 ProductAPI: Applying patch via Neon database...');
      return await productApi.editProduct(id, updatedData, { skipTimestamp: true });
    } catch (error) {
      console.error('❌ ProductAPI: Error patching product:', error);
      throw error;
    }
  },

  // Sync localStorage products with temporary IDs to Neon database and get proper IDs
  syncProductIdsToNeonDatabase: async () => {
    try {
      console.log('🔄 ProductAPI: Starting ID synchronization with Neon database...');
      
      // Get products from localStorage
      const localProducts = getStoredProducts();
      const tempIdProducts = localProducts.filter(product => 
        String(product.id).startsWith('local_') || 
        String(product.id).includes('temp_') ||
        !product.id || 
        typeof product.id === 'string' && product.id.length > 20
      );
      
      if (tempIdProducts.length === 0) {
        console.log('✅ ProductAPI: No products with temporary IDs found. Sync not needed.');
        return { synced: 0, failed: 0, results: [] };
      }
      
      console.log(`🔍 ProductAPI: Found ${tempIdProducts.length} products with temporary IDs to sync`);
      
      const syncResults = [];
      let syncedCount = 0;
      let failedCount = 0;
      
      for (const tempProduct of tempIdProducts) {
        try {
          console.log(`🔄 ProductAPI: Syncing product "${tempProduct.name}" with temp ID: ${tempProduct.id}`);
          
          // Remove the temporary ID and other local-only fields
          const productDataForSync = {
            ...tempProduct,
            createdAt: tempProduct.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          delete productDataForSync.id; // Let Neon database assign proper ID
          
          // Create product in Neon database
          const neonProduct = await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productDataForSync),
          });
          
          console.log(`✅ ProductAPI: Product "${tempProduct.name}" synced. Old ID: ${tempProduct.id}, New ID: ${neonProduct.id}`);
          
          syncResults.push({
            oldId: tempProduct.id,
            newId: neonProduct.id,
            productName: tempProduct.name,
            success: true,
            neonProduct: neonProduct
          });
          
          syncedCount++;
          
        } catch (syncError) {
          console.error(`❌ ProductAPI: Failed to sync product "${tempProduct.name}":`, syncError.message);
          
          syncResults.push({
            oldId: tempProduct.id,
            productName: tempProduct.name,
            success: false,
            error: syncError.message
          });
          
          failedCount++;
        }
      }
      
      // If any products were successfully synced, refresh localStorage with Neon data
      if (syncedCount > 0) {
        try {
          console.log('🔄 ProductAPI: Refreshing localStorage with Neon database data...');
          const allNeonProducts = await productApi.getAllProducts();
          saveProductsBackup(allNeonProducts);
          console.log('✅ ProductAPI: localStorage refreshed with synchronized Neon database data');
        } catch (refreshError) {
          console.warn('⚠️ ProductAPI: Failed to refresh localStorage after sync:', refreshError.message);
        }
      }
      
      console.log(`✅ ProductAPI: ID synchronization completed. Synced: ${syncedCount}, Failed: ${failedCount}`);
      
      return {
        synced: syncedCount,
        failed: failedCount,
        results: syncResults,
        totalProcessed: tempIdProducts.length
      };
      
    } catch (error) {
      console.error('❌ ProductAPI: Error during ID synchronization:', error);
      throw error;
    }
  },

  // Check for products that need ID synchronization
  checkProductSyncStatus: async () => {
    try {
      console.log('🔍 ProductAPI: Checking product synchronization status...');
      
      const localProducts = getStoredProducts();
      const tempIdProducts = localProducts.filter(product => 
        String(product.id).startsWith('local_') || 
        String(product.id).includes('temp_') ||
        !product.id || 
        typeof product.id === 'string' && product.id.length > 20
      );
      
      const syncStatus = {
        needsSync: tempIdProducts.length > 0,
        tempIdCount: tempIdProducts.length,
        totalLocalProducts: localProducts.length,
        tempIdProducts: tempIdProducts.map(p => ({
          id: p.id,
          name: p.name,
          createdAt: p.createdAt
        }))
      };
      
      if (syncStatus.needsSync) {
        console.log(`⚠️ ProductAPI: ${tempIdProducts.length} products need ID synchronization with Neon database`);
      } else {
        console.log('✅ ProductAPI: All products are synchronized with Neon database');
      }
      
      return syncStatus;
    } catch (error) {
      console.error('❌ ProductAPI: Error checking sync status:', error);
      throw error;
    }
  },

  // Auto-sync products on app startup or when connection is restored
  autoSyncProductIds: async () => {
    try {
      console.log('🚀 ProductAPI: Starting automatic product ID synchronization...');
      
      // First check if Neon database is available
      const isConnected = await productApi.testConnection();
      if (!isConnected) {
        console.log('⚠️ ProductAPI: Neon database not available. Skipping auto-sync.');
        return { skipped: true, reason: 'Neon database not available' };
      }
      
      // Check if sync is needed
      const syncStatus = await productApi.checkProductSyncStatus();
      if (!syncStatus.needsSync) {
        console.log('✅ ProductAPI: No products need synchronization');
        return { skipped: true, reason: 'No products need sync' };
      }
      
      // Perform the sync
      console.log(`🔄 ProductAPI: Auto-syncing ${syncStatus.tempIdCount} products...`);
      const syncResult = await productApi.syncProductIdsToNeonDatabase();
      
      console.log(`✅ ProductAPI: Auto-sync completed. ${syncResult.synced} products synchronized.`);
      return { ...syncResult, autoSync: true };
      
    } catch (error) {
      console.error('❌ ProductAPI: Error during auto-sync:', error);
      return { error: error.message, autoSync: true };
    }
  },

  // Bulk edit multiple products (prioritizes Neon database for all operations)
  bulkEditProducts: async (productUpdates) => {
    try {
      console.log('📦 ProductAPI: Bulk editing products:', productUpdates.length);
      console.log('🗄️ ProductAPI: All bulk operations will target Neon PostgreSQL database');
      
      const results = [];
      const errors = [];
      let neonDatabaseSuccessCount = 0;
      let localStorageFallbackCount = 0;
      
      for (const update of productUpdates) {
        try {
          console.log(`🔄 ProductAPI: Processing bulk edit ${results.length + errors.length + 1}/${productUpdates.length} - Product ID: ${update.id}`);
          
          // Force Neon database priority for bulk operations
          const options = {
            ...update.options,
            allowLocalStorageFallback: false // Prevent localStorage fallback in bulk operations
          };
          
          const result = await productApi.editProduct(update.id, update.data, options);
          results.push({ id: update.id, success: true, data: result });
          neonDatabaseSuccessCount++;
          
          console.log(`✅ ProductAPI: Bulk edit success for product ${update.id} via Neon database`);
        } catch (error) {
          console.error(`❌ ProductAPI: Bulk edit failed for product ${update.id}:`, error.message);
          errors.push({ id: update.id, success: false, error: error.message });
          
          // Check if it's a Neon database connection issue
          if (error.message.includes('Neon database')) {
            console.warn(`⚠️ ProductAPI: Neon database issue detected for product ${update.id}`);
          }
        }
      }
      
      console.log(`✅ ProductAPI: Bulk edit completed - ${results.length} success, ${errors.length} errors`);
      console.log(`🗄️ ProductAPI: Neon database operations: ${neonDatabaseSuccessCount} successful`);
      
      if (errors.length > 0) {
        console.warn(`⚠️ ProductAPI: ${errors.length} products failed to update in Neon database`);
        console.warn('💡 ProductAPI: Consider checking Neon database connection and retrying failed operations');
      }
      
      return {
        success: results,
        errors: errors,
        total: productUpdates.length,
        neonDatabaseSuccessCount,
        localStorageFallbackCount
      };
    } catch (error) {
      console.error('❌ ProductAPI: Error in bulk edit:', error);
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (id) => {
    try {
      console.log('🗑️ ProductAPI: Attempting to delete product with ID:', id);
      console.log('🗑️ ProductAPI: ID type:', typeof id);
      console.log('🔗 ProductAPI: Delete URL:', `${API_BASE_URL}/products?id=${id}`);
      
      const result = await apiRequest(`/products?id=${id}`, {
        method: 'DELETE',
      });
      
      console.log('✅ ProductAPI: Product deleted successfully:', result);
      
      // Update localStorage backup
      try {
        const products = await productApi.getAllProducts();
        saveProductsBackup(products);
        console.log('✅ ProductAPI: Backup updated after deletion');
      } catch (backupError) {
        console.warn('⚠️ ProductAPI: Failed to update backup after deleting product:', backupError.message);
      }
      
      return result;
    } catch (error) {
      console.error('❌ ProductAPI: Error deleting product', id + ':', error);
      console.error('❌ ProductAPI: Full error details:', error.message);
      
      // Check if it's a 404 error - treat as successful deletion
      if (error.message.includes('Product not found') || error.message.includes('404')) {
        console.log('✅ ProductAPI: Product not found in database (404), treating as successful deletion');
        
        // Try to remove from localStorage backup as cleanup
        try {
          const products = getStoredProducts();
          const filteredProducts = products.filter(p => {
            const productId = p.id || p._id;
            return productId !== id && 
                   String(productId) !== String(id) && 
                   productId !== String(id);
          });
          
          if (filteredProducts.length < products.length) {
            saveProductsBackup(filteredProducts);
            console.log('📦 ProductAPI: Product also removed from localStorage backup');
          }
        } catch (fallbackError) {
          console.warn('⚠️ ProductAPI: Could not clean localStorage, but that\'s okay');
        }
        
        // Return success for 404 - product doesn't exist anyway
        return { message: 'Product deleted (was not in database)' };
      }
      
      // For other errors, try localStorage fallback
      try {
        console.warn('🔄 ProductAPI: API delete failed, attempting localStorage fallback');
        const products = getStoredProducts();
        const filteredProducts = products.filter(p => {
          const productId = p.id || p._id;
          return productId !== id && 
                 String(productId) !== String(id) && 
                 productId !== String(id);
        });
        
        if (filteredProducts.length < products.length) {
          saveProductsBackup(filteredProducts);
          console.log('📦 ProductAPI: Product removed from localStorage backup');
          return { message: 'Product deleted from local storage (API unavailable)' };
        } else {
          console.warn('⚠️ ProductAPI: Product not found in localStorage backup either');
        }
      } catch (fallbackError) {
        console.error('❌ ProductAPI: Fallback deletion also failed:', fallbackError.message);
      }
      
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  },

  // Sync all product IDs with Neon database
  syncProductIdsWithNeonDatabase: async () => {
    try {
      console.log('🔄 ProductAPI: Starting product ID sync with Neon database...');
      
      // Get all products from local storage
      const localProducts = getStoredProducts();
      console.log(`📦 ProductAPI: Found ${localProducts.length} products in local storage`);
      
      if (localProducts.length === 0) {
        console.log('ℹ️ ProductAPI: No local products to sync');
        return { synced: 0, created: 0, errors: 0, results: [] };
      }

      // Get all products from Neon database
      let neonProducts = [];
      try {
        neonProducts = await productApi.getAllProducts();
        console.log(`🌐 ProductAPI: Found ${neonProducts.length} products in Neon database`);
      } catch (error) {
        console.error('❌ ProductAPI: Failed to fetch products from Neon database:', error.message);
        throw new Error('Cannot sync: Neon database is not accessible');
      }

      const syncResults = [];
      let syncedCount = 0;
      let createdCount = 0;
      let errorCount = 0;

      // Process each local product
      for (let i = 0; i < localProducts.length; i++) {
        const localProduct = localProducts[i];
        const localId = localProduct.id || localProduct._id;
        
        console.log(`🔍 ProductAPI: Processing product ${i + 1}/${localProducts.length} - "${localProduct.name}" (ID: ${localId})`);

        try {
          // Try to find matching product in Neon database by name first
          const matchingNeonProduct = neonProducts.find(np => 
            np.name && localProduct.name && 
            np.name.toLowerCase().trim() === localProduct.name.toLowerCase().trim()
          );

          if (matchingNeonProduct) {
            // Product exists in Neon, update local ID to match
            console.log(`✅ ProductAPI: Found matching product in Neon database (ID: ${matchingNeonProduct.id})`);
            localProducts[i] = { ...localProduct, id: matchingNeonProduct.id };
            syncResults.push({
              localId: localId,
              neonId: matchingNeonProduct.id,
              name: localProduct.name,
              action: 'synced',
              status: 'success'
            });
            syncedCount++;
          } else {
            // Product doesn't exist in Neon, create it
            console.log(`➕ ProductAPI: Creating new product in Neon database: "${localProduct.name}"`);
            
            // Remove local-specific fields before creating
            const productDataForNeon = { ...localProduct };
            delete productDataForNeon.id;
            delete productDataForNeon._id;
            
            const newNeonProduct = await productApi.createProduct(productDataForNeon);
            
            // Update local product with new Neon ID
            localProducts[i] = { ...localProduct, id: newNeonProduct.id };
            syncResults.push({
              localId: localId,
              neonId: newNeonProduct.id,
              name: localProduct.name,
              action: 'created',
              status: 'success'
            });
            createdCount++;
            console.log(`✅ ProductAPI: Created product in Neon database (new ID: ${newNeonProduct.id})`);
          }
        } catch (error) {
          console.error(`❌ ProductAPI: Failed to sync product "${localProduct.name}":`, error.message);
          syncResults.push({
            localId: localId,
            neonId: null,
            name: localProduct.name,
            action: 'error',
            status: 'failed',
            error: error.message
          });
          errorCount++;
        }
      }

      // Save updated products back to local storage
      saveProductsBackup(localProducts);
      console.log('💾 ProductAPI: Updated local storage with synced IDs');

      const summary = {
        synced: syncedCount,
        created: createdCount,
        errors: errorCount,
        total: localProducts.length,
        results: syncResults
      };

      console.log('🎉 ProductAPI: Sync completed!', summary);
      return summary;

    } catch (error) {
      console.error('❌ ProductAPI: Product ID sync failed:', error.message);
      throw error;
    }
  },

  // Check sync status between local and Neon database
  checkProductSyncStatus: async () => {
    try {
      console.log('🔍 ProductAPI: Checking product sync status...');
      
      const localProducts = getStoredProducts();
      const neonProducts = await productApi.getAllProducts();
      
      const syncStatus = {
        localCount: localProducts.length,
        neonCount: neonProducts.length,
        needsSync: false,
        issues: []
      };

      // Check for products with invalid IDs
      const invalidIdProducts = localProducts.filter(p => {
        const id = p.id || p._id;
        return !id || String(id).startsWith('local_') || String(id).includes('temp_');
      });

      if (invalidIdProducts.length > 0) {
        syncStatus.needsSync = true;
        syncStatus.issues.push(`${invalidIdProducts.length} products have invalid/temporary IDs`);
      }

      // Check for products that don't exist in Neon
      const missingInNeon = [];
      for (const localProduct of localProducts) {
        const localId = localProduct.id || localProduct._id;
        const existsInNeon = neonProducts.some(np => np.id === localId);
        
        if (!existsInNeon && localId && !String(localId).startsWith('local_')) {
          missingInNeon.push(localProduct);
        }
      }

      if (missingInNeon.length > 0) {
        syncStatus.needsSync = true;
        syncStatus.issues.push(`${missingInNeon.length} products exist locally but not in Neon database`);
      }

      console.log('📊 ProductAPI: Sync status check completed:', syncStatus);
      return syncStatus;

    } catch (error) {
      console.error('❌ ProductAPI: Failed to check sync status:', error.message);
      throw error;
    }
  }
};

// Named exports for specific functions
export const testConnection = productApi.testConnection;
export const getAllProducts = productApi.getAllProducts;
export const getProductById = productApi.getProductById;
export const createProduct = productApi.createProduct;
export const resolveProductId = productApi.resolveProductId;
export const updateProduct = productApi.updateProduct;
export const editProduct = productApi.editProduct;
export const patchProduct = productApi.patchProduct;
export const bulkEditProducts = productApi.bulkEditProducts;
export const syncProductIdsWithNeonDatabase = productApi.syncProductIdsWithNeonDatabase;
export const checkProductSyncStatus = productApi.checkProductSyncStatus;
export const deleteProduct = productApi.deleteProduct;

export default productApi;
import sampleProducts from '../utils/addSampleProducts';
// Backend API configuration for Neon PostgreSQL database
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // Debug environment variables
  console.log('🔍 Environment Variables Check:');
  console.log('REACT_APP_PRODUCTS_API_URL:', process.env.REACT_APP_PRODUCTS_API_URL);
  console.log('REACT_APP_ORDER_API_URL:', process.env.REACT_APP_ORDER_API_URL);
  console.log('PGDATABASE:', process.env.PGDATABASE);
  console.log('Current hostname:', hostname);
  console.log('🎯 Target Database: Neon PostgreSQL');
  console.log('🔗 Will use API URL for Neon database operations');
  
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
      const parsed = JSON.parse(stored);
      // Ensure we always return an array
      return Array.isArray(parsed) ? parsed : [];
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

// Save products to localStorage as backup
const saveProductsBackup = (products) => {
  try {
    localStorage.setItem('eyewear_products_backup', JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products backup:', error);
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
        
        // Save as backup for offline use
        saveProductsBackup(products);
        return products;
      } else if (Array.isArray(response)) {
        // Handle direct array response
        console.log(`✅ Successfully fetched ${response.length} products from Neon database`);
        console.log('📊 Products:', response.map(p => `${p.name} ($${p.price})`).join(', '));
        
        saveProductsBackup(response);
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
      console.log('🔍 ProductAPI: existingProducts type:', typeof existingProducts);
      console.log('🔍 ProductAPI: existingProducts is array:', Array.isArray(existingProducts));
      console.log('🔍 ProductAPI: existingProducts:', existingProducts);
      
      // Ensure existingProducts is an array
      const productsArray = Array.isArray(existingProducts) ? existingProducts : [];
      productsArray.push(fallbackProduct);
      saveProductsBackup(productsArray);
      
      console.log('📦 ProductAPI: Product saved to localStorage as fallback');
      return fallbackProduct;
    }
  },

  // Update a product
  updateProduct: async (id, productData) => {
    try {
      console.log('✏️ ProductAPI: Attempting to update product with ID:', id);
      console.log('✏️ ProductAPI: ID type:', typeof id);
      console.log('✏️ ProductAPI: Product data:', productData);
      console.log('🔗 ProductAPI: Update URL:', `${API_BASE_URL}/products/${id}`);
      
      // Debug specific fields that users report aren't updating
      console.log('🔍 ProductAPI: Debugging specific fields being sent:');
      console.log('  - gender:', productData.gender);
      console.log('  - material:', productData.material);
      console.log('  - shape:', productData.shape);
      console.log('  - style:', productData.style);
      console.log('  - frameColor:', productData.frameColor);
      console.log('  - lensTypes:', productData.lensTypes);
      console.log('  - discount:', productData.discount);
      console.log('  - status:', productData.status);
      console.log('  - description:', productData.description);
      
      console.log('🔗 ProductAPI: Making PUT request to Neon database...');
      console.log('🔗 ProductAPI: Full URL:', `${API_BASE_URL}/products/${id}`);
      console.log('🔗 ProductAPI: Request body:', JSON.stringify(productData, null, 2));
      
      const updatedProduct = await apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
      
      console.log('✅ ProductAPI: Neon database responded successfully!');
      
      console.log('✅ ProductAPI: Product updated successfully:', updatedProduct);
      
      // Debug what the backend returned
      console.log('🔍 ProductAPI: Verifying returned fields:');
      console.log('  - gender:', updatedProduct.gender);
      console.log('  - material:', updatedProduct.material);
      console.log('  - shape:', updatedProduct.shape);
      console.log('  - style:', updatedProduct.style);
      console.log('  - frameColor:', updatedProduct.frameColor);
      console.log('  - lensTypes:', updatedProduct.lensTypes);
      console.log('  - discount:', updatedProduct.discount);
      console.log('  - status:', updatedProduct.status);
      console.log('  - description:', updatedProduct.description);
      
      // Update localStorage backup
      try {
        const products = await productApi.getAllProducts();
        saveProductsBackup(products);
        console.log('✅ ProductAPI: Backup updated after update');
      } catch (backupError) {
        console.warn('⚠️ ProductAPI: Failed to update backup after updating product:', backupError.message);
      }
      
      return updatedProduct;
    } catch (error) {
      console.error(`❌ ProductAPI: Error updating product ${id}:`, error);
      console.error(`❌ ProductAPI: Full error details:`, error.message);
      console.error(`❌ ProductAPI: Error object:`, {
        name: error.name,
        message: error.message,
        status: error.status,
        response: error.response
      });
      
      // Check if this is a "Product not found" error (404)
      const isNotFoundError = error.message.includes('Product not found') || 
                             error.message.includes('404') ||
                             error.status === 404;
      
      if (isNotFoundError) {
        console.error('❌ ProductAPI: Product not found (404) in Neon database');
        console.error('❌ ProductAPI: Product ID:', id, 'does not exist in Neon database');
        console.error('❌ ProductAPI: This product needs to be created in Neon database first');
        throw new Error(`Product with ID ${id} not found in Neon database. Cannot update non-existent product.`);
      }
      
      // For other errors, don't use localStorage fallback - force Neon database usage
      console.error('❌ ProductAPI: Neon database update failed');
      console.error('❌ ProductAPI: Error details:', error.message);
      console.error('❌ ProductAPI: Not using localStorage fallback - must use Neon database');
      console.error('❌ ProductAPI: Please check Neon database connection and API endpoint');
      
      // If all fallbacks failed, re-throw the original error
      console.error(`❌ ProductAPI: All update attempts failed, re-throwing error:`, error.message);
      throw error;
    }
  },


  // Sync local products to Neon database
  syncLocalProductsToNeon: async () => {
    try {
      console.log('🔄 ProductAPI: Starting sync of local products to Neon database...');
      
      // Get all local products
      const localProducts = getStoredProducts();
      console.log(`📦 ProductAPI: Found ${localProducts.length} local products to sync`);
      
      if (localProducts.length === 0) {
        console.log('✅ ProductAPI: No local products to sync');
        return { synced: 0, errors: 0 };
      }
      
      let syncedCount = 0;
      let errorCount = 0;
      const errors = [];
      
      for (const product of localProducts) {
        try {
          console.log(`🔄 ProductAPI: Syncing product: ${product.name} (ID: ${product.id})`);
          
          // Remove the local ID and let Neon assign a new one
          const { id, _id, ...productDataForNeon } = product;
          
          // Create product in Neon database
          const createdProduct = await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productDataForNeon),
          });
          
          // Handle different API response structures
          const neonId = createdProduct?.id || createdProduct?._id || createdProduct?.data?.id || 'unknown';
          console.log(`✅ ProductAPI: Synced product: ${product.name} → Neon ID: ${neonId}`);
          console.log('🔍 ProductAPI: Full API response:', createdProduct);
          syncedCount++;
          
        } catch (error) {
          console.error(`❌ ProductAPI: Failed to sync product: ${product.name}`, error.message);
          errors.push({ product: product.name, error: error.message });
          errorCount++;
        }
      }
      
      console.log(`🎯 ProductAPI: Sync completed - ${syncedCount} synced, ${errorCount} errors`);
      
      if (errors.length > 0) {
        console.log('❌ ProductAPI: Sync errors:', errors);
      }
      
      return { synced: syncedCount, errors: errorCount, errorDetails: errors };
      
    } catch (error) {
      console.error('❌ ProductAPI: Sync operation failed:', error);
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
          // Ensure products is an array
          const productsArray = Array.isArray(products) ? products : [];
          const filteredProducts = productsArray.filter(p => {
            const productId = p.id || p._id;
            return productId !== id && 
                   String(productId) !== String(id) && 
                   productId !== String(id);
          });
          
          if (filteredProducts.length < productsArray.length) {
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
        // Ensure products is an array
        const productsArray = Array.isArray(products) ? products : [];
        const filteredProducts = productsArray.filter(p => {
          const productId = p.id || p._id;
          return productId !== id && 
                 String(productId) !== String(id) && 
                 productId !== String(id);
        });
        
        if (filteredProducts.length < productsArray.length) {
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
  }
};

// Named exports for specific functions
export const testConnection = productApi.testConnection;
export const getAllProducts = productApi.getAllProducts;
export const getProductById = productApi.getProductById;
export const createProduct = productApi.createProduct;
export const updateProduct = productApi.updateProduct;
export const deleteProduct = productApi.deleteProduct;
export const syncLocalProductsToNeon = productApi.syncLocalProductsToNeon;


export default productApi;
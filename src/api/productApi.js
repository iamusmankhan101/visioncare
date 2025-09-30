import sampleProducts from '../utils/addSampleProducts';

// Backend API configuration with Vercel deployment support
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // Debug environment variables
  console.log('🔍 Environment Variables Check:');
  console.log('REACT_APP_PRODUCTS_API_URL:', process.env.REACT_APP_PRODUCTS_API_URL);
  console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
  console.log('Current hostname:', hostname);
  
  // Check if we have a custom API URL from environment
  if (process.env.REACT_APP_PRODUCTS_API_URL) {
    console.log(`🌐 Using environment API URL: ${process.env.REACT_APP_PRODUCTS_API_URL}`);
    return process.env.REACT_APP_PRODUCTS_API_URL;
  }
  
  // Check if this is a deployed environment (not localhost or IP)
  const isDeployedEnvironment = !hostname.includes('localhost') && 
                               !hostname.includes('127.0.0.1') && 
                               !hostname.match(/^\d+\.\d+\.\d+\.\d+$/); // Not an IP address
  
  if (isDeployedEnvironment) {
    console.log(`🌐 Deployed environment detected: ${hostname}`);
    console.log(`🚀 Using Vercel API endpoints`);
    // For deployed environments, use the same domain's API endpoints
    return `https://${hostname}/api`;
  }
  
  // If accessing via IP address (mobile accessing desktop), use the same IP for API
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    console.log(`📱 Mobile detected: Using ${hostname} for API requests`);
    return `http://${hostname}:5004/api`;
  }
  
  // Default to localhost for desktop development (Upstash server)
  console.log('🚀 Using Upstash server: http://localhost:5004/api');
  return 'http://localhost:5004/api';
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
      console.error(`❌ Make sure the API server is accessible at ${API_BASE_URL}`);
      if (API_BASE_URL.includes('localhost')) {
        console.error(`❌ Start server with: cd server && npm run dev:products`);
        console.error(`❌ Check if mobile device can access localhost:5004`);
      }
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
      console.log('🔍 Attempting to fetch products from Upstash API...');
      console.log(`🔗 API URL: ${API_BASE_URL}/products`);
      console.log('🚀 Expected: Products from Upstash Redis database');
      
      const response = await apiRequest('/products');
      
      // Check if response has the expected structure
      if (response && response.data) {
        const products = response.data;
        console.log(`✅ Successfully fetched ${products.length} products from Upstash`);
        console.log('📊 Products:', products.map(p => `${p.name} ($${p.price})`).join(', '));
        
        // Save as backup for offline use
        saveProductsBackup(products);
        return products;
      } else if (Array.isArray(response)) {
        // Handle direct array response
        console.log(`✅ Successfully fetched ${response.length} products from Upstash`);
        console.log('📊 Products:', response.map(p => `${p.name} ($${p.price})`).join(', '));
        
        saveProductsBackup(response);
        return response;
      } else {
        console.warn('⚠️ Unexpected API response format:', response);
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('❌ Upstash API failed, using localStorage backup:', error.message);
      console.error('🔍 Full error:', error);
      
      if (API_BASE_URL.includes('localhost')) {
        console.warn('🚨 UPSTASH SERVER NOT RESPONDING!');
        console.warn('💡 Make sure your Upstash server is running: npm run dev:upstash');
        console.warn('🔗 Test manually: http://localhost:5004/api/products');
      } else {
        console.warn('🌐 Deployed API error - check Vercel function logs');
      }
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
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  // Update a product
  updateProduct: async (id, productData) => {
    try {
      const updatedProduct = await apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
      
      // Update localStorage backup
      try {
        const products = await productApi.getAllProducts();
        saveProductsBackup(products);
      } catch (backupError) {
        console.warn('Failed to update backup after updating product:', backupError.message);
      }
      
      return updatedProduct;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },

  // Delete a product
  deleteProduct: async (id) => {
    try {
      const result = await apiRequest(`/products/${id}`, {
        method: 'DELETE',
      });
      
      // Update localStorage backup
      try {
        const products = await productApi.getAllProducts();
        saveProductsBackup(products);
      } catch (backupError) {
        console.warn('Failed to update backup after deleting product:', backupError.message);
      }
      
      return result;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
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

export default productApi;
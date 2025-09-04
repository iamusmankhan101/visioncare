import sampleProducts from '../utils/addSampleProducts';

// Local storage key for products
const PRODUCTS_STORAGE_KEY = 'eyewear_products';

// Helper function to get products from localStorage
const getStoredProducts = () => {
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // If no products in storage, initialize with sample products
    const initialProducts = sampleProducts.map((product, index) => ({
      ...product,
      id: index + 1
    }));
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
    return initialProducts;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return sampleProducts.map((product, index) => ({
      ...product,
      id: index + 1
    }));
  }
};

// Helper function to save products to localStorage
const saveProducts = (products) => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw new Error('Failed to save products');
  }
};

// Helper function to generate new ID
const generateNewId = (products) => {
  return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
};

const productApi = {
  // Get all products
  getAllProducts: async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return getStoredProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  },

  // Get a single product by ID
  getProductById: async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const products = getStoredProducts();
      const product = products.find(p => p.id === parseInt(id));
      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw new Error(error.message || `Failed to fetch product ${id}`);
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const products = getStoredProducts();
      const newProduct = {
        ...productData,
        id: generateNewId(products),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      products.push(newProduct);
      saveProducts(products);
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  },

  // Update a product
  updateProduct: async (id, productData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const products = getStoredProducts();
      const index = products.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        throw new Error(`Product with ID ${id} not found`);
      }
      const updatedProduct = {
        ...products[index],
        ...productData,
        id: parseInt(id), // Ensure ID remains the same
        updatedAt: new Date().toISOString()
      };
      products[index] = updatedProduct;
      saveProducts(products);
      return updatedProduct;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw new Error(error.message || `Failed to update product ${id}`);
    }
  },

  // Delete a product
  deleteProduct: async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const products = getStoredProducts();
      const index = products.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        throw new Error(`Product with ID ${id} not found`);
      }
      const deletedProduct = products[index];
      products.splice(index, 1);
      saveProducts(products);
      return { message: 'Product deleted successfully', product: deletedProduct };
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw new Error(error.message || `Failed to delete product ${id}`);
    }
  }
};

export default productApi;
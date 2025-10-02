import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productApi from '../../api/productApi';
import sampleProducts from '../../utils/addSampleProducts';

// Async thunks for API operations
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    try {
      return await productApi.getAllProducts();
    } catch (error) {
      // If API fails, use sample products as fallback
      console.warn('API failed, using sample products:', error.message);
      return sampleProducts.map((product, index) => ({
        ...product,
        id: index + 1
      }));
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      return await productApi.getProductById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProductAsync = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      return await productApi.createProduct(productData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProductAsync = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      return await productApi.updateProduct(id, productData);
    } catch (error) {
      const errorMessage = error?.message || error?.error || error || 'Unknown error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteProductAsync = createAsyncThunk(
  'products/deleteProduct',
  async (productName, { rejectWithValue }) => {
    try {
      await productApi.deleteProduct(productName);
      return productName;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  filteredItems: [],
  filters: {
    category: null,
    brand: null,
    featured: null,
    bestSelling: null,
    search: null,
    priceRange: { min: 0, max: 1000 },
    material: null,
    shape: null,
    color: null,
    style: null,
    gender: null,
    type: null,
    features: []
  },
  sortOption: 'featured',
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
    },
    setSortOption(state, action) {
      state.sortOption = action.payload;
      state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
    },
    resetFilters(state) {
      state.filters = initialState.filters;
      state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
    },
    initializeFilteredItems(state) {
      state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
    },
    // Keep these sync reducers for local operations
    addProduct(state, action) {
      const newProduct = action.payload;
      state.items.push(newProduct);
      state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
    },
    updateProduct(state, action) {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
      }
    },
    deleteProduct(state, action) {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
    },
    removeAllProducts(state) {
      state.items = [];
      state.filteredItems = [];
    },
    removeLensProducts(state) {
      const lensCategories = ['Contact Lenses', 'Transparent Lenses', 'Colored Lenses'];
      const lensNames = ['FreshKon Mosaic', 'Acuvue Oasys', 'Bella Elite', 'Dailies AquaComfort', 'Solotica Natural', 'Air Optix Colors'];
      
      state.items = state.items.filter(item => {
        // Remove by category
        if (lensCategories.includes(item.category)) return false;
        
        // Remove by name pattern (in case category was changed)
        if (lensNames.some(name => item.name.includes(name))) return false;
        
        // Remove by brand (lens brands)
        const lensBrands = ['FreshKon', 'Acuvue', 'Bella', 'Alcon', 'Solotica'];
        if (lensBrands.includes(item.brand)) return false;
        
        return true;
      });
      
      state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Handle API response structure: { success: true, products: [...], count: N }
        const products = action.payload.products || action.payload || [];
        state.items = Array.isArray(products) ? products : [];
        state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Handle createProductAsync
      .addCase(createProductAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
      })
      
      // Handle updateProductAsync
      .addCase(updateProductAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        const updatedProduct = action.payload;
        console.log('✏️ Redux: Updating product:', updatedProduct.name);
        console.log('✏️ Redux: Updated product ID:', updatedProduct.id || updatedProduct._id);
        
        // Try different ID matching strategies for live database compatibility
        const index = state.items.findIndex(item => {
          const itemId = item.id || item._id;
          const updatedId = updatedProduct.id || updatedProduct._id;
          return itemId === updatedId || 
                 String(itemId) === String(updatedId) || 
                 itemId === String(updatedId);
        });
        
        if (index !== -1) {
          state.items[index] = updatedProduct;
          state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
          console.log('✅ Redux: Product updated successfully in store');
        } else {
          console.warn('⚠️ Redux: Product not found in store for update');
        }
        state.status = 'succeeded';
      })
      .addCase(updateProductAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('❌ Redux: Update product failed:', action.payload);
      })
      
      // Handle deleteProductAsync
      .addCase(deleteProductAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        const deletedProductName = action.payload;
        console.log('🗑️ Redux: Deleting product with name:', deletedProductName);
        console.log('🗑️ Redux: Before deletion, items count:', state.items.length);
        
        // Filter by product name instead of ID
        state.items = state.items.filter(item => {
          const itemName = item.name;
          // Keep items that DON'T match the deleted product name
          const shouldKeep = itemName !== deletedProductName && 
                            String(itemName).toLowerCase() !== String(deletedProductName).toLowerCase();
          console.log('🗑️ Redux: Item name:', itemName, 'Deleted name:', deletedProductName, 'Keep:', shouldKeep);
          return shouldKeep;
        });
        
        console.log('🗑️ Redux: After deletion, items count:', state.items.length);
        state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
        state.status = 'succeeded';
      })
      .addCase(deleteProductAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('🗑️ Redux: Delete product failed:', action.payload);
        
        // If it's a 404 error, the product doesn't exist anyway
        // So we can try to remove it from the local state
        if (action.payload && (action.payload.includes('Product not found') || action.payload.includes('404'))) {
          console.log('🗑️ Redux: Product not found in database, removing from local state anyway');
          // We don't have the ID in rejected action, but the error handling in AdminPage will refresh the list
        }
      })
      
      // Handle fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update or add the product to the items array
        const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
        if (existingIndex !== -1) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
        state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

// The async thunks are already exported above where they're defined

// Export the synchronous action creators
export const { 
  setFilters, 
  setSortOption, 
  resetFilters, 
  initializeFilteredItems,
  addProduct,
  updateProduct,
  deleteProduct,
  removeAllProducts,
  removeLensProducts 
} = productSlice.actions;

export default productSlice.reducer;

// Helper function to apply filters and sorting
const applyFilters = (items, filters, sortOption) => {
  // Ensure items is an array
  if (!Array.isArray(items)) {
    console.warn('applyFilters received non-array items:', items);
    return [];
  }
  let result = [...items];
  
  // First, exclude lens categories from general product listings
  const lensCategories = ['Contact Lenses', 'Transparent Lenses', 'Colored Lenses', 'contact-lenses', 'transparent-lenses', 'colored-lenses'];
  result = result.filter(item => !lensCategories.includes(item.category));
  
  // Apply category filter - handle both old and new formats
  if (filters.category) {
    result = result.filter(item => {
      if (!item.category) return false;
      
      // Direct match
      if (item.category === filters.category) return true;
      
      // Convert category to lowercase with dashes for comparison
      const normalizeCategory = (cat) => cat.toLowerCase().replace(/\s+/g, '-');
      const itemCategoryNormalized = normalizeCategory(item.category);
      const filterCategoryNormalized = normalizeCategory(filters.category);
      
      return itemCategoryNormalized === filterCategoryNormalized;
    });
  }
  
  // Apply brand filter
  if (filters.brand) {
    result = result.filter(item => item.brand === filters.brand);
  }
  
  // Apply featured filter
  if (filters.featured) {
    result = result.filter(item => item.featured === true);
  }
  
  // Apply best selling filter
  if (filters.bestSelling) {
    result = result.filter(item => item.bestSeller === true || item.bestSelling === true);
  }
  
  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    result = result.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm)) ||
      (item.category && item.category.toLowerCase().includes(searchTerm)) ||
      (item.description && item.description.toLowerCase().includes(searchTerm))
    );
  }
  
  // Apply price range filter
  result = result.filter(item => 
    item.price >= filters.priceRange.min && 
    item.price <= filters.priceRange.max
  );
  
  // Apply material filter
  if (filters.material) {
    result = result.filter(item => item.material === filters.material);
  }
  
  // Apply shape filter
  if (filters.shape) {
    result = result.filter(item => item.shape === filters.shape);
  }
  
  // Apply style filter
  if (filters.style) {
    result = result.filter(item => {
      return item.style && item.style === filters.style;
    });
  }
  
  // Apply color filter
  if (filters.color) {
    result = result.filter(item => item.color === filters.color);
  }
  
  // Apply gender filter
  if (filters.gender) {
    result = result.filter(item => {
      if (!item.gender) return false;
      return item.gender.toLowerCase() === filters.gender.toLowerCase();
    });
  }
  
  // Apply type filter (for subcategories like reading, computer, etc.)
  if (filters.type) {
    result = result.filter(item => {
      if (!item.type) {
        // If no type field, check if category matches the type
        const itemCategory = item.category ? item.category.toLowerCase() : '';
        const filterType = filters.type.toLowerCase();
        
        // Handle special cases
        if (filterType === 'reading' && (itemCategory.includes('reading') || itemCategory === 'reading-glasses')) return true;
        if (filterType === 'computer' && (itemCategory.includes('computer') || itemCategory === 'computer-glasses')) return true;
        if (filterType === 'polarized' && (itemCategory.includes('polarized') || item.features?.includes('Polarized'))) return true;
        if (filterType === 'aviator' && (itemCategory.includes('aviator') || item.shape === 'Aviator')) return true;
        
        return false;
      }
      return item.type.toLowerCase() === filters.type.toLowerCase();
    });
  }
  
  // Apply features filter
  if (filters.features.length > 0) {
    result = result.filter(item => 
      item.features && filters.features.every(feature => item.features.includes(feature))
    );
  }
  
  // Apply sorting
  switch (sortOption) {
    case 'price-low-high':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-high-low':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'name-a-z':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-z-a':
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'featured':
    default:
      // Featured sorting (default) - no change to order
      break;
  }
  
  return result;
};
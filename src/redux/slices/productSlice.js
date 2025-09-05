import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productApi from '../../api/productApi';
import sampleProducts from '../../utils/addSampleProducts';

// Async thunks for API operations
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
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
  async (id, { rejectWithValue }) => {
    try {
      await productApi.deleteProduct(id);
      return id;
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
        state.items = action.payload;
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
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
        }
      })
      
      // Handle deleteProductAsync
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.filteredItems = applyFilters(state.items, state.filters, state.sortOption);
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
  removeAllProducts 
} = productSlice.actions;

export default productSlice.reducer;

// Helper function to apply filters and sorting
const applyFilters = (items, filters, sortOption) => {
  let result = [...items];
  
  // Apply category filter
  if (filters.category) {
    result = result.filter(item => item.category === filters.category);
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
    result = result.filter(item => item.bestSeller === true);
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
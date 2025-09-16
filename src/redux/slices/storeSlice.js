import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for store management
export const createStore = createAsyncThunk(
  'store/createStore',
  async (storeData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5003/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(storeData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create store');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStores = createAsyncThunk(
  'store/fetchStores',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5003/api/stores', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateStore = createAsyncThunk(
  'store/updateStore',
  async ({ storeId, storeData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5003/api/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(storeData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update store');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const storeSlice = createSlice({
  name: 'store',
  initialState: {
    stores: [],
    currentStore: null,
    storeSettings: {
      theme: 'modern',
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      logo: null,
      storeName: '',
      storeDescription: '',
      currency: 'USD',
      timezone: 'UTC',
      paymentMethods: ['stripe', 'paypal'],
      shippingZones: [],
      taxSettings: {
        enabled: false,
        rate: 0
      }
    },
    analytics: {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      topProducts: [],
      salesData: []
    },
    loading: false,
    error: null
  },
  reducers: {
    setCurrentStore: (state, action) => {
      state.currentStore = action.payload;
    },
    updateStoreSettings: (state, action) => {
      state.storeSettings = { ...state.storeSettings, ...action.payload };
    },
    updateAnalytics: (state, action) => {
      state.analytics = { ...state.analytics, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create store
      .addCase(createStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.loading = false;
        state.stores.push(action.payload);
        state.currentStore = action.payload;
      })
      .addCase(createStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch stores
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update store
      .addCase(updateStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.stores.findIndex(store => store.id === action.payload.id);
        if (index !== -1) {
          state.stores[index] = action.payload;
        }
        if (state.currentStore?.id === action.payload.id) {
          state.currentStore = action.payload;
        }
      })
      .addCase(updateStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setCurrentStore, updateStoreSettings, updateAnalytics, clearError } = storeSlice.actions;
export default storeSlice.reducer;

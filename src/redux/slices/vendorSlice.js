import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for vendor management
export const fetchVendors = createAsyncThunk(
  'vendor/fetchVendors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5003/api/vendors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createVendor = createAsyncThunk(
  'vendor/createVendor',
  async (vendorData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5003/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(vendorData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create vendor');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVendorStatus = createAsyncThunk(
  'vendor/updateVendorStatus',
  async ({ vendorId, status }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5003/api/vendors/${vendorId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update vendor status');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const vendorSlice = createSlice({
  name: 'vendor',
  initialState: {
    vendors: [],
    vendorApplications: [],
    currentVendor: null,
    vendorStats: {
      totalVendors: 0,
      activeVendors: 0,
      pendingApplications: 0,
      totalCommission: 0
    },
    loading: false,
    error: null
  },
  reducers: {
    setCurrentVendor: (state, action) => {
      state.currentVendor = action.payload;
    },
    addVendorApplication: (state, action) => {
      state.vendorApplications.push(action.payload);
    },
    updateVendorStats: (state, action) => {
      state.vendorStats = { ...state.vendorStats, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch vendors
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
        state.vendorStats.totalVendors = action.payload.length;
        state.vendorStats.activeVendors = action.payload.filter(v => v.status === 'active').length;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create vendor
      .addCase(createVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors.push(action.payload);
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update vendor status
      .addCase(updateVendorStatus.fulfilled, (state, action) => {
        const index = state.vendors.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vendors[index] = action.payload;
        }
      });
  }
});

export const { setCurrentVendor, addVendorApplication, updateVendorStats, clearError } = vendorSlice.actions;
export default vendorSlice.reducer;

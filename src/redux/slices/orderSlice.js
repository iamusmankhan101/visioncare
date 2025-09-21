import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for order management
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async ({ page = 1, limit = 20, status, vendorId } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(vendorId && { vendorId })
      });
      
      const response = await fetch(`http://localhost:5005/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status, trackingNumber }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5005/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, trackingNumber })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const processRefund = createAsyncThunk(
  'order/processRefund',
  async ({ orderId, amount, reason }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5005/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount, reason })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process refund');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    orderStats: {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    },
    currentOrder: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20
    },
    filters: {
      status: '',
      dateRange: null,
      vendorId: ''
    },
    loading: false,
    error: null
  },
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateOrderStats: (state, action) => {
      state.orderStats = { ...state.orderStats, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
        
        // Update stats
        const orders = action.payload.orders;
        state.orderStats.totalOrders = orders.length;
        state.orderStats.pendingOrders = orders.filter(o => o.status === 'pending').length;
        state.orderStats.processingOrders = orders.filter(o => o.status === 'processing').length;
        state.orderStats.shippedOrders = orders.filter(o => o.status === 'shipped').length;
        state.orderStats.deliveredOrders = orders.filter(o => o.status === 'delivered').length;
        state.orderStats.cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
        state.orderStats.totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        state.orderStats.averageOrderValue = state.orderStats.totalRevenue / (state.orderStats.totalOrders || 1);
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      // Process refund
      .addCase(processRefund.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  }
});

export const { setCurrentOrder, setFilters, updateOrderStats, clearError } = orderSlice.actions;
export default orderSlice.reducer;

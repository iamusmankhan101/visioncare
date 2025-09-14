import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  prescriptions: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.prescriptions = action.payload.prescriptions || [];
      state.error = null;
    },
    loginFailure(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },
    registerStart(state) {
      state.loading = true;
      state.error = null;
    },
    registerSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    registerFailure(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.prescriptions = [];
    },
    addPrescription(state, action) {
      state.prescriptions.push(action.payload);
    },
    updatePrescription(state, action) {
      const index = state.prescriptions.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.prescriptions[index] = action.payload;
      }
    },
    deletePrescription(state, action) {
      state.prescriptions = state.prescriptions.filter(p => p.id !== action.payload);
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  addPrescription,
  updatePrescription,
  deletePrescription,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;

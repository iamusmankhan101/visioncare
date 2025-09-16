import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import authReducer from './slices/authSlice';
import wishlistReducer from './slices/wishlistSlice';
// import storeReducer from './slices/storeSlice';
// import vendorReducer from './slices/vendorSlice';
// import orderReducer from './slices/orderSlice';

// Persist config for cart
const cartPersistConfig = {
  key: 'cart',
  storage,
};

// Persist config for auth
const authPersistConfig = {
  key: 'auth',
  storage,
};

const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    cart: persistedCartReducer,
    products: productReducer, // No longer persisted since we'll fetch from API
    auth: persistedAuthReducer,
    wishlist: wishlistReducer,
    // store: storeReducer,
    // vendor: vendorReducer,
    // order: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
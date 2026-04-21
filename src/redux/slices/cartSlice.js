import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const newItem = action.payload;
      // Create a unique identifier based on product configuration including customizations
      const customizationKey = newItem.customizations ? JSON.stringify(newItem.customizations) : 'none';
      const itemKey = `${newItem.id}-${newItem.color || 'default'}-${newItem.size || 'default'}-${customizationKey}`;
      const existingItem = state.items.find(item => item.itemKey === itemKey);
      
      if (!existingItem) {
        state.items.push({
          ...newItem,
          itemKey,
          quantity: newItem.quantity || 1,
          totalPrice: newItem.price * (newItem.quantity || 1)
        });
      } else {
        existingItem.quantity += newItem.quantity || 1;
        existingItem.totalPrice += newItem.price * (newItem.quantity || 1);
      }
      
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
    },
    removeFromCart(state, action) {
      const itemKey = action.payload;
      state.items = state.items.filter(item => item.itemKey !== itemKey);
      
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
    },
    updateQuantity(state, action) {
      const { itemKey, quantity } = action.payload;
      const existingItem = state.items.find(item => item.itemKey === itemKey);
      
      if (existingItem && quantity > 0) {
        existingItem.quantity = quantity;
        existingItem.totalPrice = existingItem.price * quantity;
      }
      
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
    },
    increaseQuantity(state, action) {
      const itemKey = action.payload;
      const existingItem = state.items.find(item => item.itemKey === itemKey);
      
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
      }
      
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
    },
    decreaseQuantity(state, action) {
      const itemKey = action.payload;
      const existingItem = state.items.find(item => item.itemKey === itemKey);
      
      if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity -= 1;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
      }
      
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, increaseQuantity, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
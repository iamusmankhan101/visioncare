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
      // Create a unique identifier based on product configuration
      const itemKey = `${newItem.id}-${newItem.selectedColor || 'default'}-${newItem.selectedSize || 'default'}-${newItem.lensType || 'none'}`;
      const existingItem = state.items.find(item => item.itemKey === itemKey);
      
      if (!existingItem) {
        state.items.push({
          ...newItem,
          itemKey,
          quantity: newItem.quantity || 1,
          totalPrice: newItem.price * (newItem.quantity || 1),
          selectedColor: newItem.selectedColor || 'Black',
          selectedSize: newItem.selectedSize || 'Medium',
          lensType: newItem.lensType || 'Non-Prescription',
          lensColor: newItem.lensColor || 'Clear',
          prescription: newItem.prescription || null,
          addOns: newItem.addOns || {}
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
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
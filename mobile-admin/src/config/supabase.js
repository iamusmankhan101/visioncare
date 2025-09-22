// Mock Supabase configuration for demo
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Supabase configuration for demo
export const supabase = {
  auth: {
    signInWithPassword: async () => ({ data: null, error: new Error('Mock auth') }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    resetPasswordForEmail: async () => ({ error: null }),
    updateUser: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null })
      })
    }),
    insert: async () => ({ error: null }),
    update: () => ({
      eq: async () => ({ error: null })
    }),
    delete: () => ({
      eq: async () => ({ error: null })
    })
  }),
  channel: () => ({
    on: () => ({
      subscribe: () => ({})
    })
  }),
  removeChannel: () => {}
};

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CUSTOMER: 'customer',
};

// Mock realtime subscriptions helper
export const subscribeToTable = (table, callback, filter = '') => {
  return {};
};

export const unsubscribeFromTable = (subscription) => {
  // Mock unsubscribe
};

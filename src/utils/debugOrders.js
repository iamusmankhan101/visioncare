// Debug utility to check orders in IndexedDB
import { openDB } from 'idb';

const DB_NAME = 'EyewearrDB';
const ORDER_STORE = 'orders';

export const debugOrders = async () => {
  try {
    console.log('🔍 Debugging Orders in IndexedDB...');
    
    const db = await openDB(DB_NAME, 1);
    const tx = db.transaction(ORDER_STORE, 'readonly');
    const store = tx.objectStore(ORDER_STORE);
    
    const orders = await store.getAll();
    
    console.log('📊 Orders found:', orders.length);
    console.log('📋 Order details:', orders);
    
    if (orders.length === 0) {
      console.log('❌ No orders found in database');
      console.log('💡 Possible issues:');
      console.log('  - Order not being saved during checkout');
      console.log('  - Database initialization issue');
      console.log('  - Different database name/version');
    } else {
      orders.forEach((order, index) => {
        console.log(`📦 Order ${index + 1}:`, {
          id: order.id,
          orderNumber: order.orderNumber,
          customerEmail: order.customerInfo?.email,
          total: order.total,
          status: order.status,
          orderDate: order.orderDate
        });
      });
    }
    
    return orders;
  } catch (error) {
    console.error('❌ Error debugging orders:', error);
    return [];
  }
};

// Add to window for easy debugging
window.debugOrders = debugOrders;

export default debugOrders;

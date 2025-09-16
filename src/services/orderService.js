// Order service for managing orders
import { openDB } from 'idb';
import { sendOrderWhatsAppNotification } from './whatsappService';

const DB_NAME = 'EyewearrDB';
const DB_VERSION = 1;
const ORDER_STORE = 'orders';

// Initialize IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(ORDER_STORE)) {
        const orderStore = db.createObjectStore(ORDER_STORE, { keyPath: 'id', autoIncrement: true });
        orderStore.createIndex('orderNumber', 'orderNumber', { unique: true });
        orderStore.createIndex('status', 'status');
        orderStore.createIndex('customerEmail', 'customerInfo.email');
        orderStore.createIndex('orderDate', 'orderDate');
      }
    },
  });
};

// Save order to IndexedDB and send notifications
export const saveOrder = async (orderData) => {
  try {
    const db = await initDB();
    const tx = db.transaction(ORDER_STORE, 'readwrite');
    const store = tx.objectStore(ORDER_STORE);
    
    const order = {
      ...orderData,
      id: Date.now(), // Simple ID generation
      orderDate: new Date().toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await store.add(order);
    await tx.complete;
    
    // Send notifications after successful order save
    await sendOrderNotifications(order);
    
    return order;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

// Send all order notifications (Push + WhatsApp)
const sendOrderNotifications = async (orderData) => {
  try {
    console.log('Sending order notifications for:', orderData.orderNumber);
    
    // 1. Send Push Notification to Admin
    await sendPushNotification(orderData);
    
    // 2. Send WhatsApp Notification
    await sendOrderWhatsAppNotification(orderData);
    
  } catch (error) {
    console.error('Error sending order notifications:', error);
    // Don't throw error - notifications are non-critical
  }
};

// Send push notification to admin
const sendPushNotification = async (orderData) => {
  try {
    const notificationData = {
      title: `🛍️ New Order #${orderData.orderNumber}`,
      body: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName} placed an order for Rs ${orderData.total}`,
      data: {
        orderId: orderData.id.toString(),
        orderNumber: orderData.orderNumber,
        customerName: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
        total: orderData.total.toString(),
        items: orderData.items.length.toString(),
        timestamp: new Date().toISOString()
      }
    };
    
    // Send to notification server
    const response = await fetch('http://localhost:5002/api/webhook/order-placed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    if (response.ok) {
      console.log('Push notification sent successfully');
    } else {
      console.error('Failed to send push notification');
    }
  } catch (error) {
    console.error('Push notification error:', error);
  }
};

// Get all orders
export const getAllOrders = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(ORDER_STORE, 'readonly');
    const store = tx.objectStore(ORDER_STORE);
    
    const orders = await store.getAll();
    return orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

// Get order by ID
export const getOrderById = async (id) => {
  try {
    const db = await initDB();
    const tx = db.transaction(ORDER_STORE, 'readonly');
    const store = tx.objectStore(ORDER_STORE);
    
    return await store.get(id);
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const db = await initDB();
    const tx = db.transaction(ORDER_STORE, 'readwrite');
    const store = tx.objectStore(ORDER_STORE);
    
    const order = await store.get(orderId);
    if (order) {
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      await store.put(order);
      await tx.complete;
      return order;
    }
    
    throw new Error('Order not found');
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Delete order
export const deleteOrder = async (orderId) => {
  try {
    const db = await initDB();
    const tx = db.transaction(ORDER_STORE, 'readwrite');
    const store = tx.objectStore(ORDER_STORE);
    
    await store.delete(orderId);
    await tx.complete;
    
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
  try {
    const db = await initDB();
    const tx = db.transaction(ORDER_STORE, 'readonly');
    const store = tx.objectStore(ORDER_STORE);
    const index = store.index('status');
    
    const orders = await index.getAll(status);
    return orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    return [];
  }
};

// Search orders
export const searchOrders = async (searchTerm) => {
  try {
    const allOrders = await getAllOrders();
    
    if (!searchTerm) return allOrders;
    
    const term = searchTerm.toLowerCase();
    
    return allOrders.filter(order => 
      order.orderNumber.toLowerCase().includes(term) ||
      order.customerInfo.email.toLowerCase().includes(term) ||
      order.customerInfo.firstName.toLowerCase().includes(term) ||
      order.customerInfo.lastName.toLowerCase().includes(term) ||
      order.customerInfo.phone.includes(term)
    );
  } catch (error) {
    console.error('Error searching orders:', error);
    return [];
  }
};

// Get order statistics
export const getOrderStats = async () => {
  try {
    const orders = await getAllOrders();
    
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.total || 0), 0)
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting order stats:', error);
    return {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0
    };
  }
};

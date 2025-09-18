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
    await tx.done;
    
    // Send notifications after successful order save
    await sendOrderNotifications(order);
    
    // Trigger mobile notification check (for the mobile app)
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('newOrder', { detail: order }));
    }
    
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
    // Send to notification server
    const response = await fetch('http://localhost:5002/api/webhook/order-placed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      })
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
      const oldStatus = order.status;
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      
      // Add status history
      if (!order.statusHistory) {
        order.statusHistory = [];
      }
      order.statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        previousStatus: oldStatus
      });
      
      await store.put(order);
      await tx.done;
      
      // Send notifications for status change
      try {
        const { sendOrderStatusNotification } = await import('./orderNotificationService');
        await sendOrderStatusNotification(order, oldStatus, newStatus);
      } catch (notificationError) {
        console.error('Error sending status notification:', notificationError);
        // Don't throw error - status update should succeed even if notification fails
      }
      
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
    await tx.done;
    
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

// Bulk update order status
export const bulkUpdateOrderStatus = async (orderIds, newStatus) => {
  try {
    const db = await initDB();
    const tx = db.transaction(ORDER_STORE, 'readwrite');
    const store = tx.objectStore(ORDER_STORE);
    
    const updatePromises = orderIds.map(async (orderId) => {
      const order = await store.get(orderId);
      if (order) {
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        await store.put(order);
      }
    });
    
    await Promise.all(updatePromises);
    await tx.done;
    
    return true;
  } catch (error) {
    console.error('Error bulk updating order status:', error);
    throw error;
  }
};

// Bulk delete orders
export const bulkDeleteOrders = async (orderIds) => {
  try {
    const db = await initDB();
    const tx = db.transaction(ORDER_STORE, 'readwrite');
    const store = tx.objectStore(ORDER_STORE);
    
    const deletePromises = orderIds.map(orderId => store.delete(orderId));
    await Promise.all(deletePromises);
    await tx.done;
    
    return true;
  } catch (error) {
    console.error('Error bulk deleting orders:', error);
    throw error;
  }
};

// Get orders with advanced filtering
export const getOrdersWithFilters = async (filters = {}) => {
  try {
    let orders = await getAllOrders();
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      orders = orders.filter(order => order.status === filters.status);
    }
    
    // Apply date range filter
    if (filters.dateFrom || filters.dateTo) {
      orders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        if (filters.dateFrom && orderDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && orderDate > new Date(filters.dateTo)) return false;
        return true;
      });
    }
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      orders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.customerInfo.email.toLowerCase().includes(searchTerm) ||
        order.customerInfo.firstName.toLowerCase().includes(searchTerm) ||
        order.customerInfo.lastName.toLowerCase().includes(searchTerm) ||
        order.customerInfo.phone.includes(searchTerm) ||
        order.items?.some(item => item.name.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply sorting
    if (filters.sortBy) {
      orders.sort((a, b) => {
        switch (filters.sortBy) {
          case 'newest':
            return new Date(b.orderDate) - new Date(a.orderDate);
          case 'oldest':
            return new Date(a.orderDate) - new Date(b.orderDate);
          case 'highest':
            return (b.total || 0) - (a.total || 0);
          case 'lowest':
            return (a.total || 0) - (b.total || 0);
          case 'customer':
            return `${a.customerInfo.firstName} ${a.customerInfo.lastName}`.localeCompare(
              `${b.customerInfo.firstName} ${b.customerInfo.lastName}`
            );
          default:
            return new Date(b.orderDate) - new Date(a.orderDate);
        }
      });
    }
    
    return orders;
  } catch (error) {
    console.error('Error getting filtered orders:', error);
    return [];
  }
};

// Get order analytics data
export const getOrderAnalytics = async (timeRange = 30) => {
  try {
    const orders = await getAllOrders();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    
    const filteredOrders = orders.filter(order => new Date(order.orderDate) >= cutoffDate);
    
    // Calculate metrics
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueCustomers = new Set(filteredOrders.map(order => order.customerInfo.email)).size;
    
    // Status breakdown
    const statusBreakdown = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    // Daily data for charts
    const dailyData = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.toDateString() === date.toDateString();
      });
      
      dailyData.push({
        date: date.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      });
    }
    
    // Top products
    const productCounts = {};
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        if (!productCounts[item.name]) {
          productCounts[item.name] = { count: 0, revenue: 0 };
        }
        productCounts[item.name].count += item.quantity || 1;
        productCounts[item.name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    
    const topProducts = Object.entries(productCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      uniqueCustomers,
      statusBreakdown,
      dailyData,
      topProducts
    };
  } catch (error) {
    console.error('Error getting order analytics:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      uniqueCustomers: 0,
      statusBreakdown: {},
      dailyData: [],
      topProducts: []
    };
  }
};

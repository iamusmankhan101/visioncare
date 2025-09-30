// Order API service for backend database integration
import { sendOrderWhatsAppNotification } from './whatsappService';

// Use environment variable or smart URL detection for Upstash API
const getOrderApiUrl = () => {
  const hostname = window.location.hostname;
  
  console.log('🔍 OrderAPI: Environment Check');
  console.log('REACT_APP_ORDER_API_URL:', process.env.REACT_APP_ORDER_API_URL);
  console.log('REACT_APP_PRODUCTS_API_URL:', process.env.REACT_APP_PRODUCTS_API_URL);
  console.log('Current hostname:', hostname);
  
  // Check for order-specific API URL first
  if (process.env.REACT_APP_ORDER_API_URL) {
    console.log('🌐 OrderAPI: Using order-specific API URL:', process.env.REACT_APP_ORDER_API_URL);
    return process.env.REACT_APP_ORDER_API_URL;
  }
  
  // Use products API URL if available
  if (process.env.REACT_APP_PRODUCTS_API_URL) {
    console.log('🌐 OrderAPI: Using products API URL for orders:', process.env.REACT_APP_PRODUCTS_API_URL);
    return process.env.REACT_APP_PRODUCTS_API_URL;
  }
  
  // Check if this is a deployed environment (not localhost or IP)
  const isDeployedEnvironment = !hostname.includes('localhost') && 
                               !hostname.includes('127.0.0.1') && 
                               !hostname.match(/^\d+\.\d+\.\d+\.\d+$/);
  
  if (isDeployedEnvironment) {
    console.log('🌐 OrderAPI: Deployed environment detected - using Vercel API');
    // For deployed environments, use the same domain's API endpoints
    return `https://${hostname}/api`;
  }
  
  // If accessing via IP address (mobile accessing desktop), use the same IP for API
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    console.log('📱 OrderAPI: Mobile detected - using IP for API requests');
    return `http://${hostname}:5004/api`;
  }
  
  // Local development - use Upstash server
  console.log('🚀 OrderAPI: Using local Upstash server');
  return 'http://localhost:5004/api';
};

const API_BASE_URL = getOrderApiUrl();

// Helper function to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp.slice(-6)}-${random}`;
};

// Save order to backend database
export const saveOrder = async (orderData) => {
  try {
    console.log('🚀 OrderAPI: Starting saveOrder...');
    console.log('📥 OrderAPI: Input orderData:', orderData);
    console.log('🛒 OrderAPI: Items in orderData:', orderData.items);
    console.log('📊 OrderAPI: Items count:', orderData.items ? orderData.items.length : 'No items');
    
    const orderNumber = generateOrderNumber();
    console.log('🔢 OrderAPI: Generated order number:', orderNumber);
    
    // If no API URL, use localStorage fallback
    if (!API_BASE_URL) {
      console.log('📦 OrderAPI: No API URL - using localStorage fallback');
      const orderWithNumber = { ...orderData, orderNumber, id: orderNumber };
      
      // Save to localStorage for fallback
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(orderWithNumber);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      console.log('✅ OrderAPI: Order saved to localStorage:', orderNumber);
      return { success: true, orderNumber, order: orderWithNumber };
    }
    
    // Prepare order data for backend
    const backendOrderData = {
      order_number: orderNumber,
      customer_email: orderData.customerInfo.email,
      customer_name: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
      customer_phone: orderData.customerInfo.phone,
      shipping_address: JSON.stringify({
        street: orderData.shippingAddress.street,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        zipCode: orderData.shippingAddress.zipCode,
        country: orderData.shippingAddress.country || 'Pakistan'
      }),
      billing_address: JSON.stringify(orderData.billingAddress || orderData.shippingAddress),
      subtotal: orderData.subtotal || 0,
      shipping_amount: orderData.shippingCost || 0,
      tax_amount: orderData.taxAmount || 0,
      discount_amount: orderData.discountAmount || 0,
      total: orderData.total,
      payment_method: orderData.paymentMethod || 'cash_on_delivery',
      payment_status: 'pending',
      fulfillment_status: 'pending',
      notes: orderData.notes || '',
      items: orderData.items ? orderData.items.map(item => ({
        product_name: item.name,
        product_sku: item.sku || `SKU-${item.id}`,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        variant_info: JSON.stringify({
          color: item.selectedColor,
          size: item.selectedSize,
          lensType: item.selectedLensType,
          prescription: item.prescription
        })
      })) : []
    };

    console.log('📤 OrderAPI: Prepared backend data:', backendOrderData);

    // Send to backend API
    console.log('🌐 OrderAPI: Sending to backend API...');
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendOrderData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OrderAPI: Backend response error:', response.status, response.statusText);
      console.error('❌ OrderAPI: Error details:', errorText);
      throw new Error(`Failed to save order: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const savedOrder = await response.json();
    console.log('✅ OrderAPI: Backend response:', savedOrder);
    
    // Send notifications after successful order save
    await sendOrderNotifications({
      ...orderData,
      orderNumber,
      id: savedOrder.id
    });
    
    // Trigger mobile notification check
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('newOrder', { 
        detail: { ...orderData, orderNumber, id: savedOrder.id }
      }));
    }
    
    return {
      ...orderData,
      orderNumber,
      id: savedOrder.id,
      status: 'pending',
      orderDate: new Date().toISOString()
    };
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

// Get all orders from backend
export const getAllOrders = async (filters = {}) => {
  try {
    // If no API URL, use localStorage fallback
    if (!API_BASE_URL) {
      console.log('📦 OrderAPI: No API URL - fetching from localStorage');
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      console.log('📦 OrderAPI: Found', orders.length, 'orders in localStorage');
      return { orders, total: orders.length };
    }
    
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.status) params.append('status', filters.status);
    if (filters.vendor_id) params.append('vendor_id', filters.vendor_id);

    const response = await fetch(`${API_BASE_URL}/orders?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform backend data to match frontend format
    const transformedOrders = data.orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      orderDate: order.created_at,
      status: order.fulfillment_status,
      paymentStatus: order.payment_status,
      total: order.total,
      customerInfo: {
        firstName: order.customer_name.split(' ')[0] || '',
        lastName: order.customer_name.split(' ').slice(1).join(' ') || '',
        email: order.customer_email,
        phone: order.customer_phone
      },
      shippingAddress: JSON.parse(order.shipping_address || '{}'),
      billingAddress: JSON.parse(order.billing_address || '{}'),
      subtotal: order.subtotal,
      shippingCost: order.shipping_amount,
      taxAmount: order.tax_amount,
      discountAmount: order.discount_amount,
      paymentMethod: order.payment_method,
      trackingNumber: order.tracking_number,
      notes: order.notes,
      vendorName: order.vendor_name,
      storeName: order.store_name,
      itemCount: order.item_count,
      items: order.items ? order.items.map(item => ({
        id: item.id,
        name: item.product_name,
        sku: item.product_sku,
        quantity: item.quantity,
        price: item.unit_price,
        totalPrice: item.total_price,
        selectedColor: item.variant_info?.color,
        selectedSize: item.variant_info?.size,
        selectedLensType: item.variant_info?.lensType,
        prescription: item.variant_info?.prescription
      })) : [],
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }));

    return {
      orders: transformedOrders,
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { orders: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };
  }
};

// Get order by ID
export const getOrderById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    const order = await response.json();
    
    // Transform backend data to match frontend format
    return {
      id: order.id,
      orderNumber: order.order_number,
      orderDate: order.created_at,
      status: order.fulfillment_status,
      paymentStatus: order.payment_status,
      total: order.total,
      customerInfo: {
        firstName: order.customer_name.split(' ')[0] || '',
        lastName: order.customer_name.split(' ').slice(1).join(' ') || '',
        email: order.customer_email,
        phone: order.customer_phone
      },
      shippingAddress: JSON.parse(order.shipping_address || '{}'),
      billingAddress: JSON.parse(order.billing_address || '{}'),
      subtotal: order.subtotal,
      shippingCost: order.shipping_amount,
      taxAmount: order.tax_amount,
      discountAmount: order.discount_amount,
      paymentMethod: order.payment_method,
      trackingNumber: order.tracking_number,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus, trackingNumber = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        status: newStatus,
        tracking_number: trackingNumber
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Delete order
export const deleteOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete order: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
  try {
    const data = await getAllOrders({ status });
    return data.orders;
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    return [];
  }
};

// Search orders
export const searchOrders = async (searchTerm, filters = {}) => {
  try {
    const data = await getAllOrders({ ...filters, search: searchTerm });
    return data.orders;
  } catch (error) {
    console.error('Error searching orders:', error);
    return [];
  }
};

// Get order statistics
export const getOrderStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/overview`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch order stats: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      total: data.totalOrders || 0,
      pending: 0, // Will need to calculate from orders
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: data.totalRevenue || 0
    };
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
    const updatePromises = orderIds.map(orderId => 
      updateOrderStatus(orderId, newStatus)
    );
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error bulk updating order status:', error);
    throw error;
  }
};

// Bulk delete orders
export const bulkDeleteOrders = async (orderIds) => {
  try {
    const deletePromises = orderIds.map(orderId => deleteOrder(orderId));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error bulk deleting orders:', error);
    throw error;
  }
};

// Get orders with advanced filtering
export const getOrdersWithFilters = async (filters = {}) => {
  try {
    const data = await getAllOrders(filters);
    return data.orders;
  } catch (error) {
    console.error('Error getting filtered orders:', error);
    return [];
  }
};

// Get order analytics data
export const getOrderAnalytics = async (timeRange = 30) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/charts?days=${timeRange}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch order analytics: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      totalOrders: data.totalOrders || 0,
      totalRevenue: data.totalRevenue || 0,
      averageOrderValue: data.averageOrderValue || 0,
      uniqueCustomers: data.totalCustomers || 0,
      statusBreakdown: data.statusBreakdown || {},
      dailyData: data.chartData || [],
      topProducts: data.topProducts || []
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

// Order notification service for sending notifications on status changes
import { sendOrderWhatsAppNotification } from './whatsappService';

// Send notification when order status changes
export const sendOrderStatusNotification = async (order, oldStatus, newStatus) => {
  try {
    console.log(`Order ${order.orderNumber} status changed from ${oldStatus} to ${newStatus}`);
    
    // Send customer notification
    await sendCustomerStatusNotification(order, newStatus);
    
    // Send admin notification if needed
    if (shouldNotifyAdmin(oldStatus, newStatus)) {
      await sendAdminStatusNotification(order, newStatus);
    }
    
  } catch (error) {
    console.error('Error sending order status notification:', error);
  }
};

// Send notification to customer about status change
const sendCustomerStatusNotification = async (order, status) => {
  try {
    const customerMessage = generateCustomerMessage(order, status);
    
    // Here you would integrate with your email service
    console.log('Customer notification:', customerMessage);
    
    // You could also send SMS or push notifications here
    
  } catch (error) {
    console.error('Error sending customer notification:', error);
  }
};

// Send notification to admin about status change
const sendAdminStatusNotification = async (order, status) => {
  try {
    const adminMessage = generateAdminMessage(order, status);
    
    // Send WhatsApp notification to admin
    await sendOrderWhatsAppNotification({
      ...order,
      customMessage: adminMessage
    });
    
    // Send push notification to admin
    await sendAdminPushNotification(order, status);
    
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};

// Generate customer-friendly message
const generateCustomerMessage = (order, status) => {
  const statusMessages = {
    pending: {
      subject: 'Order Confirmation',
      message: `Hi ${order.customerInfo.firstName},\n\nThank you for your order #${order.orderNumber}! We've received your order and will begin processing it shortly.\n\nOrder Details:\n${formatOrderItems(order.items)}\n\nTotal: Rs ${order.total}\n\nWe'll keep you updated on your order status.\n\nBest regards,\nEyewearr Team`
    },
    processing: {
      subject: 'Order Being Processed',
      message: `Hi ${order.customerInfo.firstName},\n\nGreat news! Your order #${order.orderNumber} is now being processed. Our team is carefully preparing your items for shipment.\n\nExpected processing time: 1-2 business days\n\nWe'll notify you once your order ships.\n\nBest regards,\nEyewearr Team`
    },
    shipped: {
      subject: 'Order Shipped',
      message: `Hi ${order.customerInfo.firstName},\n\nExciting news! Your order #${order.orderNumber} has been shipped and is on its way to you.\n\nEstimated delivery: 3-5 business days\n\nYou can track your package using the tracking information we'll send separately.\n\nBest regards,\nEyewearr Team`
    },
    delivered: {
      subject: 'Order Delivered',
      message: `Hi ${order.customerInfo.firstName},\n\nWonderful! Your order #${order.orderNumber} has been delivered successfully.\n\nWe hope you love your new eyewear! If you have any questions or concerns, please don't hesitate to contact us.\n\nThank you for choosing Eyewearr!\n\nBest regards,\nEyewearr Team`
    },
    cancelled: {
      subject: 'Order Cancelled',
      message: `Hi ${order.customerInfo.firstName},\n\nWe're sorry to inform you that your order #${order.orderNumber} has been cancelled.\n\nIf you have any questions about this cancellation or need assistance with a new order, please contact our customer service team.\n\nBest regards,\nEyewearr Team`
    }
  };
  
  return statusMessages[status] || {
    subject: 'Order Update',
    message: `Hi ${order.customerInfo.firstName},\n\nYour order #${order.orderNumber} status has been updated to: ${status}\n\nBest regards,\nEyewearr Team`
  };
};

// Generate admin message
const generateAdminMessage = (order, status) => {
  return `🔔 ORDER STATUS UPDATE\n\nOrder #${order.orderNumber}\nCustomer: ${order.customerInfo.firstName} ${order.customerInfo.lastName}\nStatus: ${status.toUpperCase()}\nTotal: Rs ${order.total}\n\nUpdated: ${new Date().toLocaleString()}`;
};

// Check if admin should be notified for this status change
const shouldNotifyAdmin = (oldStatus, newStatus) => {
  // Notify admin for important status changes
  const importantStatuses = ['cancelled', 'delivered'];
  return importantStatuses.includes(newStatus);
};

// Send push notification to admin
const sendAdminPushNotification = async (order, status) => {
  try {
    const notificationData = {
      title: `Order ${order.orderNumber} ${status}`,
      body: `${order.customerInfo.firstName} ${order.customerInfo.lastName}'s order is now ${status}`,
      data: {
        orderId: order.id.toString(),
        orderNumber: order.orderNumber,
        status: status,
        timestamp: new Date().toISOString()
      }
    };
    
    // Send to notification server
    const response = await fetch('http://localhost:5002/api/admin/order-status-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData)
    });
    
    if (response.ok) {
      console.log('Admin push notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending admin push notification:', error);
  }
};

// Format order items for display
const formatOrderItems = (items) => {
  if (!items || items.length === 0) return 'No items';
  
  return items.map(item => 
    `• ${item.name} x${item.quantity || 1} - Rs ${(item.price * (item.quantity || 1)).toFixed(2)}`
  ).join('\n');
};

// Send bulk notification for multiple orders
export const sendBulkOrderNotifications = async (orders, newStatus) => {
  try {
    const notifications = orders.map(order => 
      sendOrderStatusNotification(order, order.status, newStatus)
    );
    
    await Promise.all(notifications);
    console.log(`Bulk notifications sent for ${orders.length} orders`);
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
  }
};

// Send daily order summary to admin
export const sendDailyOrderSummary = async () => {
  try {
    // This would be called by a cron job or scheduled task
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's orders (you'd implement this in orderService)
    // const todaysOrders = await getOrdersByDate(today);
    
    const summaryMessage = `📊 DAILY ORDER SUMMARY\n\nDate: ${today.toDateString()}\n\n• New Orders: 5\n• Total Revenue: Rs 25,000\n• Pending Orders: 3\n• Shipped Orders: 2\n\nHave a great day! 🚀`;
    
    // Send WhatsApp summary
    await fetch('http://localhost:3002/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: summaryMessage,
        type: 'summary'
      })
    });
    
  } catch (error) {
    console.error('Error sending daily summary:', error);
  }
};

// Send low stock alerts related to orders
export const sendLowStockAlert = async (productName, currentStock) => {
  try {
    const alertMessage = `⚠️ LOW STOCK ALERT\n\nProduct: ${productName}\nCurrent Stock: ${currentStock}\n\nPlease restock soon to avoid order fulfillment issues.`;
    
    await fetch('http://localhost:3002/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: alertMessage,
        type: 'alert'
      })
    });
    
  } catch (error) {
    console.error('Error sending low stock alert:', error);
  }
};
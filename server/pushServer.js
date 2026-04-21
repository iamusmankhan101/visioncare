const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// VAPID keys for push notifications
const vapidKeys = {
  publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HcCWLEw6_qOkb2rJxbmKqJBdHNuILSHcCUjFQX6-oK7-FXTLBNd-9qNvAk',
  privateKey: 'dGVzdC1wcml2YXRlLWtleS1mb3ItZXlld2VhcnItYWRtaW4='
};

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:iamusmankhan101@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store active subscriptions (in production, use a database)
let subscriptions = [];

console.log('🚀 Push Notification Server Starting...');
console.log('📧 Contact Email: iamusmankhan101@gmail.com');
console.log('🔑 VAPID Public Key:', vapidKeys.publicKey);

// Routes

// Get VAPID public key
app.get('/api/vapid-public-key', (req, res) => {
  console.log('📤 VAPID public key requested');
  res.json({
    publicKey: vapidKeys.publicKey
  });
});

// Subscribe to push notifications
app.post('/api/admin/subscribe', (req, res) => {
  const subscription = req.body;
  console.log('📝 New push subscription received:', {
    endpoint: subscription.endpoint,
    keys: subscription.keys ? 'Present' : 'Missing'
  });
  
  // Store subscription (remove duplicates)
  subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
  subscriptions.push(subscription);
  
  console.log(`✅ Total active subscriptions: ${subscriptions.length}`);
  
  res.status(201).json({
    success: true,
    message: 'Subscription added successfully',
    totalSubscriptions: subscriptions.length
  });
});

// Send push notification to all subscribers
app.post('/api/admin/send-push', async (req, res) => {
  const { title, message, data = {} } = req.body;
  
  console.log('📤 Sending push notification:', { title, message, data });
  console.log(`📱 Sending to ${subscriptions.length} subscribers`);
  
  if (subscriptions.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No active subscriptions'
    });
  }
  
  const notificationPayload = JSON.stringify({
    title,
    body: message,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'eyewearr-admin',
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300],
    actions: [
      {
        action: 'view',
        title: '👀 View Details'
      },
      {
        action: 'dismiss',
        title: '❌ Dismiss'
      }
    ],
    data: {
      ...data,
      timestamp: Date.now(),
      url: '/'
    }
  });
  
  const results = [];
  
  // Send to all subscriptions
  for (let i = 0; i < subscriptions.length; i++) {
    const subscription = subscriptions[i];
    
    try {
      await webpush.sendNotification(subscription, notificationPayload);
      console.log(`✅ Notification sent to subscription ${i + 1}`);
      results.push({ success: true, subscription: i + 1 });
    } catch (error) {
      console.error(`❌ Failed to send to subscription ${i + 1}:`, error.message);
      results.push({ success: false, subscription: i + 1, error: error.message });
      
      // Remove invalid subscriptions
      if (error.statusCode === 410) {
        console.log(`🗑️ Removing invalid subscription ${i + 1}`);
        subscriptions.splice(i, 1);
        i--; // Adjust index after removal
      }
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`📊 Push notification results: ${successCount}/${results.length} successful`);
  
  res.json({
    success: successCount > 0,
    message: `Sent to ${successCount}/${results.length} subscribers`,
    results,
    totalSubscriptions: subscriptions.length
  });
});

// Send test notification
app.post('/api/admin/test-notification', async (req, res) => {
  console.log('🧪 Test notification requested');
  
  try {
    const result = await sendPushToAll(
      '🧪 Test Mobile Notification',
      'This notification should appear even when the app is closed!',
      {
        type: 'test',
        action: 'view'
      }
    );
    
    res.json({
      success: true,
      message: 'Test notification sent',
      ...result
    });
  } catch (error) {
    console.error('❌ Test notification failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send order notification
app.post('/api/admin/order-notification', async (req, res) => {
  const { orderData } = req.body;
  
  console.log('📦 Order notification requested:', orderData?.orderNumber);
  
  try {
    const customerName = `${orderData.customerInfo?.firstName || ''} ${orderData.customerInfo?.lastName || ''}`.trim();
    const orderTotal = orderData.total ? `PKR ${orderData.total.toFixed(0)}` : 'Unknown amount';
    
    const result = await sendPushToAll(
      `🛍️ New Order #${orderData.orderNumber}`,
      `${customerName || 'Customer'} placed an order for ${orderTotal}`,
      {
        type: 'new_order',
        orderId: orderData.id,
        orderNumber: orderData.orderNumber,
        customerName: customerName,
        total: orderTotal
      }
    );
    
    res.json({
      success: true,
      message: 'Order notification sent',
      ...result
    });
  } catch (error) {
    console.error('❌ Order notification failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to send push to all subscribers
async function sendPushToAll(title, message, data = {}) {
  if (subscriptions.length === 0) {
    throw new Error('No active subscriptions');
  }
  
  const notificationPayload = JSON.stringify({
    title,
    body: message,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'eyewearr-admin',
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300],
    actions: [
      {
        action: 'view',
        title: '👀 View Details'
      }
    ],
    data: {
      ...data,
      timestamp: Date.now(),
      url: '/'
    }
  });
  
  const results = [];
  
  for (let i = 0; i < subscriptions.length; i++) {
    const subscription = subscriptions[i];
    
    try {
      await webpush.sendNotification(subscription, notificationPayload);
      results.push({ success: true, subscription: i + 1 });
    } catch (error) {
      results.push({ success: false, subscription: i + 1, error: error.message });
      
      // Remove invalid subscriptions
      if (error.statusCode === 410) {
        subscriptions.splice(i, 1);
        i--;
      }
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  
  return {
    successCount,
    totalCount: results.length,
    results
  };
}

// Get server status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    subscriptions: subscriptions.length,
    vapidConfigured: !!vapidKeys.publicKey,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Push Notification Server running on http://localhost:${PORT}`);
  console.log(`📊 Server Status: http://localhost:${PORT}/api/status`);
  console.log(`🔑 VAPID Public Key: http://localhost:${PORT}/api/vapid-public-key`);
  console.log(`🧪 Test Notification: POST http://localhost:${PORT}/api/admin/test-notification`);
  console.log('');
  console.log('🚀 Ready to receive push notification subscriptions!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Push Notification Server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Push Notification Server shutting down...');
  process.exit(0);
});

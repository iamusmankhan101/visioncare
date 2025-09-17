const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PUSH_PORT || 5004;

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory storage for testing (use database in production)
let subscriptions = [];
let notifications = [];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Simple Push Notification Server',
    subscriptions: subscriptions.length,
    notifications: notifications.length,
    timestamp: new Date().toISOString()
  });
});

// Mock VAPID public key for testing
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ 
    publicKey: 'mock-vapid-key-for-testing',
    note: 'This is a mock key for testing. Install web-push for real notifications.'
  });
});

// Subscribe to notifications (mock)
app.post('/api/admin/subscribe', (req, res) => {
  const subscription = req.body;
  
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  // Check if subscription already exists
  const existingIndex = subscriptions.findIndex(
    sub => sub.endpoint === subscription.endpoint
  );

  if (existingIndex !== -1) {
    subscriptions[existingIndex] = {
      ...subscription,
      updatedAt: new Date().toISOString()
    };
  } else {
    subscriptions.push({
      ...subscription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  console.log('Mock subscription saved:', subscription.endpoint);
  res.json({ 
    success: true, 
    message: 'Mock subscription saved (install web-push for real notifications)',
    totalSubscriptions: subscriptions.length
  });
});

// Send notification (mock)
app.post('/api/admin/send-notification', async (req, res) => {
  const { title, body, data, tag } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  const notification = {
    id: Date.now(),
    title,
    body,
    data: data || {},
    tag: tag || 'general',
    timestamp: new Date().toISOString(),
    subscribers: subscriptions.length
  };

  // Store notification for testing
  notifications.push(notification);
  
  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications = notifications.slice(-50);
  }

  console.log(`Mock notification sent: "${title}" to ${subscriptions.length} subscribers`);

  res.json({
    success: true,
    message: `Mock notification sent to ${subscriptions.length} subscribers`,
    notification,
    note: 'This is a mock notification. Install web-push for real push notifications.'
  });
});

// Webhook for order notifications
app.post('/api/webhook/order-placed', async (req, res) => {
  const order = req.body;
  
  if (!order || !order.orderNumber) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  const notification = {
    title: `🛍️ New Order #${order.orderNumber}`,
    body: `${order.customerInfo.firstName} ${order.customerInfo.lastName} placed an order for ${order.total ? `PKR ${order.total}` : 'unknown amount'}`,
    data: {
      orderId: order.id?.toString(),
      orderNumber: order.orderNumber,
      customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
      total: order.total?.toString(),
      timestamp: new Date().toISOString(),
      url: '/admin/mobile'
    },
    tag: 'new-order'
  };

  try {
    const response = await fetch(`http://localhost:${PORT}/api/admin/send-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });

    if (response.ok) {
      console.log('Mock order notification sent successfully');
      res.json({ success: true, message: 'Mock order notification sent' });
    } else {
      throw new Error('Failed to send mock notification');
    }
  } catch (error) {
    console.error('Error sending mock order notification:', error);
    res.status(500).json({ error: 'Failed to send mock notification' });
  }
});

// Test notification endpoint
app.post('/api/admin/test-notification', async (req, res) => {
  const testNotification = {
    title: '🧪 Test Notification',
    body: 'This is a test notification from Eyewearr Admin (Mock Mode)',
    data: {
      test: true,
      timestamp: new Date().toISOString()
    },
    tag: 'test'
  };

  try {
    const response = await fetch(`http://localhost:${PORT}/api/admin/send-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testNotification)
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Get recent notifications
app.get('/api/admin/notifications', (req, res) => {
  res.json({
    notifications: notifications.slice(-10).reverse(), // Last 10 notifications
    total: notifications.length
  });
});

// Get subscription stats
app.get('/api/admin/subscription-stats', (req, res) => {
  res.json({
    totalSubscriptions: subscriptions.length,
    subscriptions: subscriptions.map(sub => ({
      endpoint: sub.endpoint.substring(0, 50) + '...',
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt
    }))
  });
});

// Setup instructions endpoint
app.get('/api/setup-instructions', (req, res) => {
  res.json({
    message: 'Push Notification Server Setup Instructions',
    steps: [
      '1. Install web-push: npm install web-push',
      '2. Generate VAPID keys: npx web-push generate-vapid-keys',
      '3. Update vapidKeys in pushNotificationServer.js',
      '4. Restart the server: npm run dev:push',
      '5. Test notifications from the mobile app'
    ],
    currentMode: 'Mock Mode - notifications are simulated',
    upgradeNote: 'Install web-push package for real push notifications'
  });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    server: {
      status: 'running',
      port: PORT,
      mode: 'mock',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    },
    subscriptions: {
      total: subscriptions.length,
      recent: subscriptions.slice(-3).map(sub => ({
        endpoint: sub.endpoint.substring(0, 30) + '...',
        createdAt: sub.createdAt
      }))
    },
    notifications: {
      total: notifications.length,
      recent: notifications.slice(-3).map(notif => ({
        title: notif.title,
        timestamp: notif.timestamp,
        subscribers: notif.subscribers
      }))
    },
    endpoints: [
      'GET /api/health',
      'GET /api/debug',
      'GET /api/vapid-public-key',
      'POST /api/admin/subscribe',
      'POST /api/admin/send-notification',
      'POST /api/admin/test-notification',
      'POST /api/webhook/order-placed'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔔 Simple Push Notification Server running on port ${PORT}`);
  console.log(`📱 Mode: Mock/Testing (install web-push for real notifications)`);
  console.log(`📊 Active subscriptions: ${subscriptions.length}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Setup instructions: http://localhost:${PORT}/api/setup-instructions`);
  console.log(`\n💡 To enable real push notifications:`);
  console.log(`   1. cd server && npm install web-push`);
  console.log(`   2. npx web-push generate-vapid-keys`);
  console.log(`   3. Update vapidKeys in pushNotificationServer.js`);
  console.log(`   4. Use pushNotificationServer.js instead of this file\n`);
});

module.exports = app;
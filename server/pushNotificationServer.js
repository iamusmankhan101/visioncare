const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Check if web-push is available, if not provide fallback
let webpush;
try {
  webpush = require('web-push');
} catch (error) {
  console.warn('web-push not installed. Install with: npm install web-push');
  webpush = null;
}

const app = express();
const PORT = process.env.PUSH_PORT || 5004;

// Middleware
app.use(cors());
app.use(express.json());

// VAPID keys for push notifications (you should generate your own)
const vapidKeys = {
  publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HuWd94XzqJlzOOmFzFJnHqhs1O21HbCUCOlLVJILFXRkXeoHGz-gOhHVA8',
  privateKey: 'UzxN2lXyLtlyaxO4krRjFNneSyVHzSoOSQKgVNdwbsQ'
};

// Set VAPID details if web-push is available
if (webpush) {
  webpush.setVapidDetails(
    'mailto:admin@eyewearr.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

// Store subscriptions (in production, use a database)
let subscriptions = [];
const subscriptionsFile = path.join(__dirname, 'subscriptions.json');

// Load existing subscriptions
try {
  if (fs.existsSync(subscriptionsFile)) {
    const data = fs.readFileSync(subscriptionsFile, 'utf8');
    subscriptions = JSON.parse(data);
    console.log(`Loaded ${subscriptions.length} existing subscriptions`);
  }
} catch (error) {
  console.error('Error loading subscriptions:', error);
}

// Save subscriptions to file
const saveSubscriptions = () => {
  try {
    fs.writeFileSync(subscriptionsFile, JSON.stringify(subscriptions, null, 2));
  } catch (error) {
    console.error('Error saving subscriptions:', error);
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Push Notification Server',
    subscriptions: subscriptions.length,
    timestamp: new Date().toISOString()
  });
});

// Get VAPID public key
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// Subscribe to push notifications
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
    // Update existing subscription
    subscriptions[existingIndex] = {
      ...subscription,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new subscription
    subscriptions.push({
      ...subscription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  saveSubscriptions();
  
  console.log('New push subscription:', subscription.endpoint);
  res.json({ success: true, message: 'Subscription saved' });
});

// Unsubscribe from push notifications
app.post('/api/admin/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  
  subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
  saveSubscriptions();
  
  console.log('Unsubscribed:', endpoint);
  res.json({ success: true, message: 'Unsubscribed successfully' });
});

// Send push notification to all subscribers
app.post('/api/admin/send-notification', async (req, res) => {
  const { title, body, data, tag } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  const payload = JSON.stringify({
    title,
    body,
    data: data || {},
    tag: tag || 'general',
    icon: '/logo192.png',
    badge: '/logo192.png',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  });

  const results = [];
  const failedSubscriptions = [];

  if (!webpush) {
    return res.status(500).json({ 
      error: 'Push notifications not available. Please install web-push: npm install web-push' 
    });
  }

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(subscription, payload);
      results.push({ endpoint: subscription.endpoint, success: true });
    } catch (error) {
      console.error('Error sending notification:', error);
      results.push({ 
        endpoint: subscription.endpoint, 
        success: false, 
        error: error.message 
      });
      
      // Remove invalid subscriptions
      if (error.statusCode === 410 || error.statusCode === 404) {
        failedSubscriptions.push(subscription.endpoint);
      }
    }
  }

  // Remove failed subscriptions
  if (failedSubscriptions.length > 0) {
    subscriptions = subscriptions.filter(
      sub => !failedSubscriptions.includes(sub.endpoint)
    );
    saveSubscriptions();
    console.log(`Removed ${failedSubscriptions.length} invalid subscriptions`);
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`Sent notification to ${successCount}/${subscriptions.length} subscribers`);

  res.json({
    success: true,
    message: `Notification sent to ${successCount} subscribers`,
    results,
    totalSubscriptions: subscriptions.length
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
      console.log('Order notification sent successfully');
      res.json({ success: true, message: 'Order notification sent' });
    } else {
      throw new Error('Failed to send notification');
    }
  } catch (error) {
    console.error('Error sending order notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Test notification endpoint
app.post('/api/admin/test-notification', async (req, res) => {
  const testNotification = {
    title: '🧪 Test Notification',
    body: 'This is a test notification from Eyewearr Admin',
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔔 Push Notification Server running on port ${PORT}`);
  console.log(`📱 VAPID Public Key: ${vapidKeys.publicKey}`);
  console.log(`📊 Active subscriptions: ${subscriptions.length}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
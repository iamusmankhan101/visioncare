const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
let firebaseInitialized = false;

try {
  const serviceAccount = require('./firebase-service-account-key.json');
  
  // Check if this is a real Firebase config (not our temp one)
  if (serviceAccount.project_id !== 'temp-project-id') {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    console.log('⚠️  Using temporary Firebase config - notifications will be simulated');
  }
} catch (error) {
  console.log('⚠️  Firebase not configured - running in demo mode');
}

// Store admin notification tokens
let adminTokens = new Set();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Notification Server',
    timestamp: new Date().toISOString(),
    activeTokens: adminTokens.size
  });
});

// Register admin notification token
app.post('/api/admin/register-notification-token', (req, res) => {
  try {
    const { token, deviceType, userType } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    // Store token (in production, save to database)
    adminTokens.add(token);
    
    console.log(`Admin notification token registered: ${token.substring(0, 20)}...`);
    console.log(`Total active admin tokens: ${adminTokens.size}`);
    
    res.json({ 
      success: true, 
      message: 'Token registered successfully',
      tokenCount: adminTokens.size
    });
  } catch (error) {
    console.error('Error registering token:', error);
    res.status(500).json({ error: 'Failed to register token' });
  }
});

// Send notification to all admin devices
app.post('/api/admin/send-notification', async (req, res) => {
  try {
    const { title, body, data, orderData } = req.body;
    
    if (adminTokens.size === 0) {
      return res.status(400).json({ error: 'No admin tokens registered' });
    }
    
    // Prepare notification payload
    const message = {
      notification: {
        title: title || 'New Order Received',
        body: body || 'A new order has been placed on your store'
      },
      data: {
        orderId: data?.orderId || '',
        orderNumber: data?.orderNumber || '',
        customerName: data?.customerName || '',
        total: data?.total || '',
        timestamp: new Date().toISOString(),
        ...data
      },
      android: {
        notification: {
          sound: 'default',
          priority: 'high',
          channelId: 'order_notifications'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      webpush: {
        notification: {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View Order'
            }
          ]
        }
      }
    };
    
    // Send to all admin tokens
    const tokens = Array.from(adminTokens);
    const results = [];
    
    if (firebaseInitialized) {
      for (const token of tokens) {
        try {
          const result = await admin.messaging().send({
            ...message,
            token: token
          });
          
          results.push({ token: token.substring(0, 20) + '...', success: true, messageId: result });
          console.log(`Notification sent successfully to ${token.substring(0, 20)}...`);
        } catch (error) {
          console.error(`Failed to send to token ${token.substring(0, 20)}...`, error);
          
          // Remove invalid tokens
          if (error.code === 'messaging/registration-token-not-registered' || 
              error.code === 'messaging/invalid-registration-token') {
            adminTokens.delete(token);
            console.log(`Removed invalid token: ${token.substring(0, 20)}...`);
          }
          
          results.push({ token: token.substring(0, 20) + '...', success: false, error: error.message });
        }
      }
    } else {
      // Simulate notifications in demo mode
      for (const token of tokens) {
        results.push({ token: token.substring(0, 20) + '...', success: true, messageId: 'demo-message-id', demo: true });
        console.log(`📱 DEMO: Would send notification to ${token.substring(0, 20)}... - "${title}"`);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Notifications sent',
      results: results,
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length
    });
    
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// Send test notification
app.post('/api/admin/test-notification', async (req, res) => {
  try {
    const testData = {
      title: '🧪 Test Notification',
      body: 'This is a test notification from your admin dashboard',
      data: {
        orderId: 'TEST-001',
        orderNumber: 'TEST-001',
        customerName: 'Test Customer',
        total: '299.99',
        type: 'test'
      }
    };
    
    // Use the existing send notification endpoint
    const response = await fetch(`http://localhost:${PORT}/api/admin/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const result = await response.json();
      res.json(result);
    } else {
      throw new Error('Failed to send test notification');
    }
    
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Webhook endpoint for order notifications (called when order is placed)
app.post('/api/webhook/order-placed', async (req, res) => {
  try {
    const orderData = req.body;
    
    console.log('Order placed webhook received:', orderData.orderNumber);
    
    // Format notification data
    const notificationData = {
      title: `🛍️ New Order #${orderData.orderNumber}`,
      body: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName} placed an order for Rs ${orderData.total}`,
      data: {
        orderId: orderData.id || orderData.orderNumber,
        orderNumber: orderData.orderNumber,
        customerName: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
        total: orderData.total.toString(),
        items: orderData.items.length.toString(),
        timestamp: new Date().toISOString()
      },
      orderData: orderData
    };
    
    // Send push notification
    const notificationResponse = await fetch(`http://localhost:${PORT}/api/admin/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });
    
    if (notificationResponse.ok) {
      console.log('Push notification sent for order:', orderData.orderNumber);
    }
    
    res.json({ 
      success: true, 
      message: 'Order notification processed',
      orderNumber: orderData.orderNumber
    });
    
  } catch (error) {
    console.error('Error processing order webhook:', error);
    res.status(500).json({ error: 'Failed to process order notification' });
  }
});

// Get admin dashboard stats
app.get('/api/admin/stats', (req, res) => {
  // Mock data - replace with actual database queries
  const stats = {
    todayOrders: Math.floor(Math.random() * 20) + 5,
    pendingOrders: Math.floor(Math.random() * 10) + 2,
    totalRevenue: (Math.random() * 5000 + 1000).toFixed(2),
    activeTokens: adminTokens.size,
    lastOrderTime: new Date(Date.now() - Math.random() * 3600000).toISOString()
  };
  
  res.json(stats);
});

// List registered tokens (for debugging)
app.get('/api/admin/tokens', (req, res) => {
  const tokenList = Array.from(adminTokens).map(token => ({
    id: token.substring(0, 20) + '...',
    registeredAt: new Date().toISOString() // In production, store actual registration time
  }));
  
  res.json({
    totalTokens: adminTokens.size,
    tokens: tokenList
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Notification Server running on port ${PORT}`);
  console.log(`📱 Admin notification system ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

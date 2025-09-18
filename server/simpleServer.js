// Super simple server with push notifications
console.log('🚀 Starting Super Simple Server with Push Notifications...');

const http = require('http');
const webpush = require('web-push');

// Configure web-push (using test keys for development)
const vapidKeys = {
  publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HcCWLEw6_qOkb2rJxbmKqJBdHNuILSHcCUjFQX6-oK7-FXTLBNd-9qNvAk',
  privateKey: 'nGzcGpvIjrH6akUgXcmcxXEQy7-NDPLwVADKw1KtLAI'
};

webpush.setVapidDetails(
  'mailto:admin@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store subscriptions in memory (use database in production)
const subscriptions = new Set();

const server = http.createServer((req, res) => {
  console.log(`📡 Request: ${req.method} ${req.url}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  // Route handling
  if (req.url === '/api/health') {
    res.writeHead(200);
    res.end('{"status":"ok","message":"Server is working!","port":3001}');
    return;
  }

  if (req.url === '/api/admin/test-notification' && req.method === 'POST') {
    // Send a test push notification to all subscribed devices
    const testPayload = JSON.stringify({
      title: 'Test Notification',
      body: 'This is a test push notification from your order management system!',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: { type: 'test', timestamp: Date.now() },
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });

    let sentCount = 0;
    for (const subscriptionStr of subscriptions) {
      try {
        const subscription = JSON.parse(subscriptionStr);
        await webpush.sendNotification(subscription, testPayload);
        sentCount++;
      } catch (error) {
        console.error('❌ Test notification error:', error);
        if (error.statusCode === 410) {
          subscriptions.delete(subscriptionStr);
        }
      }
    }

    console.log(`📱 Test notifications sent to ${sentCount} devices`);
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: `Test notification sent to ${sentCount} devices!`,
      sent: sentCount
    }));
    return;
  }

  if (req.url === '/api/vapid-public-key') {
    res.writeHead(200);
    res.end(JSON.stringify({
      publicKey: vapidKeys.publicKey,
      note: "Production VAPID key"
    }));
    return;
  }

  if (req.url === '/api/admin/subscribe' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const subscription = JSON.parse(body);
        subscriptions.add(JSON.stringify(subscription));
        console.log('📱 New push subscription registered');
        res.writeHead(200);
        res.end('{"success":true,"message":"Push subscription saved"}');
      } catch (error) {
        console.error('❌ Subscription error:', error);
        res.writeHead(400);
        res.end('{"error":"Invalid subscription data"}');
      }
    });
    return;
  }

  if (req.url === '/api/admin/send-push' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { title, message, data } = JSON.parse(body);

        const payload = JSON.stringify({
          title: title || 'Order Update',
          body: message || 'New order notification',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: data || {},
          actions: [
            {
              action: 'view',
              title: 'View Order'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        });

        let sentCount = 0;
        let errorCount = 0;

        for (const subscriptionStr of subscriptions) {
          try {
            const subscription = JSON.parse(subscriptionStr);
            await webpush.sendNotification(subscription, payload);
            sentCount++;
          } catch (error) {
            console.error('❌ Push send error:', error);
            errorCount++;
            // Remove invalid subscriptions
            if (error.statusCode === 410) {
              subscriptions.delete(subscriptionStr);
            }
          }
        }

        console.log(`📱 Push notifications sent: ${sentCount}, errors: ${errorCount}`);
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          sent: sentCount,
          errors: errorCount,
          message: `Push notification sent to ${sentCount} devices`
        }));
      } catch (error) {
        console.error('❌ Push notification error:', error);
        res.writeHead(400);
        res.end('{"error":"Failed to send push notification"}');
      }
    });
    return;
  }

  // Default response
  res.writeHead(404);
  res.end('{"error":"Not found"}');
});

const PORT = 3001;

server.listen(PORT, () => {
  console.log('✅ Server is running!');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('🎯 Available Endpoints:');
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   VAPID Key: http://localhost:${PORT}/api/vapid-public-key`);
  console.log(`   Subscribe: POST http://localhost:${PORT}/api/admin/subscribe`);
  console.log(`   Send Push: POST http://localhost:${PORT}/api/admin/send-push`);
  console.log(`   Test Push: POST http://localhost:${PORT}/api/admin/test-notification`);
  console.log('');
  console.log('📱 Push Notifications Ready!');
  console.log(`   Subscriptions: ${subscriptions.size}`);
});

server.on('error', (err) => {
  console.log('❌ Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.log('💡 Port 3001 is in use. Try:');
    console.log('   1. Close other applications');
    console.log('   2. Use a different port');
    console.log('   3. Kill the process using the port');
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  server.close();
  process.exit(0);
});
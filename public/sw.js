// Enhanced Service Worker for Mobile Push Notifications
const CACHE_NAME = 'eyewearr-admin-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache resources and skip waiting
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker installed, skipping waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - take control immediately
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated, claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for offline
        if (event.request.destination === 'document') {
          return caches.match('/mobile-app-working.html');
        }
      })
  );
});

// Enhanced push event for mobile lock screen notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received:', event);
  
  let notificationData = {
    title: '🛍️ Eyewearr Admin Alert',
    body: 'New activity in your store',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'eyewearr-notification',
    requireInteraction: true,
    persistent: true,
    renotify: true,
    silent: false,
    vibrate: [300, 100, 300, 100, 300],
    actions: [
      {
        action: 'view',
        title: '👀 View Details',
        icon: '/logo192.png'
      },
      {
        action: 'dismiss',
        title: '❌ Dismiss',
        icon: '/logo192.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now(),
      type: 'admin_alert'
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      console.log('📱 Push data received:', pushData);
      
      notificationData = {
        ...notificationData,
        title: pushData.title || notificationData.title,
        body: pushData.body || notificationData.body,
        icon: pushData.icon || notificationData.icon,
        badge: pushData.badge || notificationData.badge,
        tag: pushData.tag || notificationData.tag,
        data: {
          ...notificationData.data,
          ...pushData.data
        }
      };

      // Add custom actions if provided
      if (pushData.actions) {
        notificationData.actions = pushData.actions;
      }
    } catch (e) {
      console.error('❌ Error parsing push data:', e);
    }
  }

  console.log('📲 Showing notification:', notificationData);

  event.waitUntil(
    // DISABLED: Notification to prevent popup on website
    Promise.resolve().then(() => {
      console.log('🔕 Mobile notification blocked:', notificationData.title);
        
        // Send analytics or tracking data
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'NOTIFICATION_SHOWN',
              data: notificationData
            });
          });
        });
      })
      .catch((error) => {
        console.error('❌ Error showing notification:', error);
      })
  );
});

// Enhanced notification click handler for mobile
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event.action, event.notification.data);
  
  event.notification.close();
  
  // Handle dismiss action
  if (event.action === 'dismiss') {
    console.log('🚫 Notification dismissed');
    return;
  }
  
  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/';
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then((clientList) => {
      console.log('🔍 Looking for existing clients:', clientList.length);
      
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          console.log('✅ Focusing existing client');
          return client.focus().then(() => {
            // Send message to the client about the notification click
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              action: event.action,
              data: event.notification.data
            });
          });
        }
      }
      
      // Open new window if no existing client
      console.log('🆕 Opening new window:', urlToOpen);
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen).then(windowClient => {
          // Send message to the new client
          if (windowClient) {
            windowClient.postMessage({
              type: 'NOTIFICATION_CLICKED',
              action: event.action,
              data: event.notification.data
            });
          }
        });
      }
    }).catch(error => {
      console.error('❌ Error handling notification click:', error);
    })
  );
});

// Background sync for checking orders
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'check-orders') {
    event.waitUntil(checkForNewOrders());
  }
});

// Function to check for new orders in background
async function checkForNewOrders() {
  try {
    console.log('Checking for new orders in background...');
    
    // This would normally check your server/database
    // For now, we'll simulate checking IndexedDB
    
    // You could implement server-side checking here
    // and trigger notifications for new orders
    
  } catch (error) {
    console.error('Error checking for new orders:', error);
  }
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'NEW_ORDER') {
    // Trigger notification for new order
    const orderData = event.data.order;
    
    const notificationData = {
      title: `🛍️ New Order #${orderData.orderNumber}`,
      body: `${orderData.customerName} placed an order for ${orderData.total}`,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: `order-${orderData.id}`,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      data: {
        orderId: orderData.id,
        orderNumber: orderData.orderNumber,
        url: '/mobile-app-working.html'
      }
    };
    
    // DISABLED: Notification to prevent popup on website
    console.log('🔕 Service worker notification blocked:', notificationData.title);
    // self.registration.showNotification(notificationData.title, notificationData);
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
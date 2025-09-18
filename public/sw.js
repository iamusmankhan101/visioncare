// Enhanced Service Worker for Lock Screen Notifications
const CACHE_NAME = 'eyewearr-admin-v2';
const urlsToCache = [
  '/',
  '/mobile-app-working.html',
  '/manifest.json'
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

// Enhanced push event for lock screen notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: '🛍️ New Order Alert',
    body: 'A new order has been placed on your store',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'order-notification',
    requireInteraction: true,
    persistent: true,
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      {
        action: 'view',
        title: '👀 View Order'
      },
      {
        action: 'dismiss',
        title: '❌ Dismiss'
      }
    ],
    data: {
      url: '/mobile-app-working.html',
      timestamp: Date.now()
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        title: pushData.title || notificationData.title,
        body: pushData.body || notificationData.body,
        data: {
          ...notificationData.data,
          ...pushData.data
        }
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
      .then(() => {
        console.log('Lock screen notification shown');
      })
      .catch((error) => {
        console.error('Error showing notification:', error);
      })
  );
});

// Enhanced notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes('mobile-app-working.html')) {
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow('/mobile-app-working.html');
      }
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
    
    self.registration.showNotification(notificationData.title, notificationData);
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
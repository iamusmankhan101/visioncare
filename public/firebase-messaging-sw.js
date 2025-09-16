// Firebase messaging service worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyBTQTYPToIGHbQMoLgm8VwzmB0bVNwN1J8",
  authDomain: "vision-care-8b4bf.firebaseapp.com",
  projectId: "vision-care-8b4bf",
  storageBucket: "vision-care-8b4bf.firebasestorage.app",
  messagingSenderId: "180564316187",
  appId: "1:180564316187:web:6eb26cb84cd719bfd6e8be"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Order';
  const notificationOptions = {
    body: payload.notification?.body || 'A new order has been placed',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'order-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Order'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: payload.data
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open admin dashboard or specific order page
    const orderId = event.notification.data?.orderId;
    const url = orderId ? `/admin/orders/${orderId}` : '/admin/dashboard';
    
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Enhanced Mobile notification service with push notifications
class MobileNotificationService {
  constructor() {
    this.isEnabled = false;
    this.lastOrderCount = 0;
    this.checkInterval = null;
    this.permission = 'default';
    this.serverUrl = 'http://localhost:3001';
    this.vapidPublicKey = null;
    this.pushSubscription = null;
    this.serviceWorkerRegistration = null;
  }

  // Initialize the notification service
  async init() {
    console.log('🔔 Initializing Enhanced Mobile Notification Service...');
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    // Initialize service worker for push notifications
    await this.initServiceWorker();
    
    // Get VAPID public key from server
    await this.getVapidPublicKey();

    // Request permission
    this.permission = await this.requestPermission();
    
    if (this.permission === 'granted') {
      this.isEnabled = true;
      
      // Subscribe to push notifications
      await this.subscribeToPush();
      
      // Start local order monitoring as backup
      await this.startOrderMonitoring();
      
      console.log('✅ Enhanced mobile notifications enabled');
      return true;
    } else {
      console.warn('Notification permission denied');
      return false;
    }
  }

  // Request notification permission
  async requestPermission() {
    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  // Start monitoring for new orders
  async startOrderMonitoring() {
    // Get initial order count
    this.lastOrderCount = await this.getOrderCount();
    console.log(`📊 Starting order monitoring. Current orders: ${this.lastOrderCount}`);

    // Check for new orders every 10 seconds
    this.checkInterval = setInterval(async () => {
      await this.checkForNewOrders();
    }, 10000); // 10 seconds

    // Also check when page becomes visible (user switches back to app)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForNewOrders();
      }
    });
  }

  // Stop monitoring
  stopOrderMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🛑 Order monitoring stopped');
    }
  }

  // Check for new orders
  async checkForNewOrders() {
    try {
      const currentOrderCount = await this.getOrderCount();
      
      if (currentOrderCount > this.lastOrderCount) {
        const newOrdersCount = currentOrderCount - this.lastOrderCount;
        console.log(`🆕 ${newOrdersCount} new order(s) detected!`);
        
        // Get the latest orders to show details
        const latestOrders = await this.getLatestOrders(newOrdersCount);
        
        // Send notification for each new order
        for (const order of latestOrders) {
          await this.sendOrderNotification(order);
        }
        
        this.lastOrderCount = currentOrderCount;
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  }

  // Get current order count from IndexedDB
  async getOrderCount() {
    return new Promise((resolve) => {
      const request = indexedDB.open('EyewearrDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('orders')) {
          resolve(0);
          return;
        }
        
        const transaction = db.transaction(['orders'], 'readonly');
        const store = transaction.objectStore('orders');
        const countRequest = store.count();
        
        countRequest.onsuccess = () => {
          resolve(countRequest.result);
        };
        
        countRequest.onerror = () => {
          resolve(0);
        };
      };
      
      request.onerror = () => {
        resolve(0);
      };
    });
  }

  // Get latest orders
  async getLatestOrders(count = 1) {
    return new Promise((resolve) => {
      const request = indexedDB.open('EyewearrDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('orders')) {
          resolve([]);
          return;
        }
        
        const transaction = db.transaction(['orders'], 'readonly');
        const store = transaction.objectStore('orders');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const orders = getAllRequest.result;
          // Sort by order date (newest first) and take the requested count
          const sortedOrders = orders
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, count);
          resolve(sortedOrders);
        };
        
        getAllRequest.onerror = () => {
          resolve([]);
        };
      };
      
      request.onerror = () => {
        resolve([]);
      };
    });
  }

  // Send notification for a new order
  async sendOrderNotification(order) {
    if (!this.isEnabled || this.permission !== 'granted') {
      return;
    }

    try {
      const customerName = `${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim();
      const orderTotal = order.total ? `PKR ${order.total.toFixed(0)}` : 'Unknown amount';
      
      const notification = new Notification(`🛍️ New Order #${order.orderNumber}`, {
        body: `${customerName || 'Customer'} placed an order for ${orderTotal}`,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: `order-${order.id}`,
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Order'
          }
        ],
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: customerName,
          total: orderTotal
        }
      });

      // Auto-close after 10 seconds if not interacted with
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        // You could navigate to order details here
        console.log(`Clicked on order ${order.orderNumber}`);
        notification.close();
      };

      console.log(`📱 Notification sent for order ${order.orderNumber}`);
      
      // Also play a sound if possible
      this.playNotificationSound();
      
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Play notification sound
  playNotificationSound() {
    try {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }

  // Initialize service worker
  async initServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered');
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('✅ Service Worker ready');
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  }

  // Get VAPID public key from server
  async getVapidPublicKey() {
    try {
      const response = await fetch(`${this.serverUrl}/api/vapid-public-key`);
      const data = await response.json();
      this.vapidPublicKey = data.publicKey;
      console.log('✅ VAPID public key retrieved');
    } catch (error) {
      console.error('❌ Failed to get VAPID public key:', error);
    }
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    if (!this.serviceWorkerRegistration || !this.vapidPublicKey) {
      console.warn('Service Worker or VAPID key not available');
      return;
    }

    try {
      // Check if already subscribed
      this.pushSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      
      if (!this.pushSubscription) {
        // Create new subscription
        this.pushSubscription = await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
        
        console.log('✅ Push subscription created');
      } else {
        console.log('✅ Push subscription already exists');
      }

      // Send subscription to server
      await this.sendSubscriptionToServer();
      
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer() {
    if (!this.pushSubscription) return;

    try {
      const response = await fetch(`${this.serverUrl}/api/admin/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.pushSubscription)
      });

      if (response.ok) {
        console.log('✅ Push subscription sent to server');
      } else {
        console.error('❌ Failed to send subscription to server');
      }
    } catch (error) {
      console.error('❌ Error sending subscription to server:', error);
    }
  }

  // Convert VAPID key to Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send push notification via server
  async sendPushNotification(title, message, data = {}) {
    try {
      const response = await fetch(`${this.serverUrl}/api/admin/send-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          data
        })
      });

      const result = await response.json();
      console.log('📱 Push notification sent:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to send push notification:', error);
      throw error;
    }
  }

  // Send test notification (both local and push)
  async sendTestNotification() {
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission required');
      }
      this.permission = permission;
    }

    try {
      // Send push notification via server
      await fetch(`${this.serverUrl}/api/admin/test-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📱 Test push notification sent');
      return true;
    } catch (error) {
      console.error('❌ Failed to send test push notification:', error);
      
      // Fallback to local notification
      const notification = new Notification('🧪 Test Notification (Local)', {
        body: 'Push notification failed, showing local notification',
        icon: '/logo192.png',
        tag: 'test-notification'
      });

      setTimeout(() => notification.close(), 5000);
      this.playNotificationSound();
      return true;
    }
  }

  // Get notification status
  getStatus() {
    return {
      supported: 'Notification' in window,
      pushSupported: 'serviceWorker' in navigator && 'PushManager' in window,
      permission: this.permission,
      enabled: this.isEnabled,
      monitoring: this.checkInterval !== null,
      lastOrderCount: this.lastOrderCount,
      pushSubscribed: !!this.pushSubscription,
      serviceWorkerReady: !!this.serviceWorkerRegistration,
      vapidKeyLoaded: !!this.vapidPublicKey
    };
  }
}

// Create global instance
const mobileNotificationService = new MobileNotificationService();

// Export for use in other files
export default mobileNotificationService;
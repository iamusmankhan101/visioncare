// Mobile Push Notification Service for Background Notifications
class MobilePushService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.permission = Notification.permission;
    this.subscription = null;
    this.serverUrl = 'http://localhost:3001';
    this.vapidPublicKey = null;
    this.serviceWorkerRegistration = null;
    this.isInitialized = false;
  }

  // Initialize the mobile push service
  async init() {
    console.log('📱 Initializing Mobile Push Service...');
    
    if (!this.isSupported) {
      console.warn('❌ Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Get VAPID public key
      await this.getVapidPublicKey();
      
      // Request permission
      this.permission = await this.requestPermission();
      
      if (this.permission === 'granted') {
        // Subscribe to push notifications
        await this.subscribeToPush();
        
        // Set up message listeners
        this.setupMessageListeners();
        
        this.isInitialized = true;
        console.log('✅ Mobile Push Service initialized successfully');
        return true;
      } else {
        console.warn('❌ Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Mobile Push Service:', error);
      return false;
    }
  }

  // Register service worker
  async registerServiceWorker() {
    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker registered:', this.serviceWorkerRegistration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');
      
      return this.serviceWorkerRegistration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  }

  // Request notification permission
  async requestPermission() {
    if (this.permission === 'granted') {
      return 'granted';
    }

    if (this.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('📱 Permission result:', permission);
      return permission;
    }

    return this.permission;
  }

  // Get VAPID public key from server
  async getVapidPublicKey() {
    try {
      const response = await fetch(`${this.serverUrl}/api/vapid-public-key`);
      const data = await response.json();
      this.vapidPublicKey = data.publicKey;
      console.log('🔑 VAPID public key retrieved');
      return this.vapidPublicKey;
    } catch (error) {
      console.error('❌ Failed to get VAPID public key:', error);
      // Use fallback key for testing
      this.vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HcCWLEw6_qOkb2rJxbmKqJBdHNuILSHcCUjFQX6-oK7-FXTLBNd-9qNvAk';
      return this.vapidPublicKey;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    if (!this.serviceWorkerRegistration || !this.vapidPublicKey) {
      throw new Error('Service Worker or VAPID key not available');
    }

    try {
      // Check if already subscribed
      this.subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      
      if (!this.subscription) {
        // Create new subscription
        this.subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
        
        console.log('✅ New push subscription created');
      } else {
        console.log('✅ Using existing push subscription');
      }

      // Send subscription to server
      await this.sendSubscriptionToServer();
      
      return this.subscription;
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
      throw error;
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer() {
    if (!this.subscription) return;

    try {
      const response = await fetch(`${this.serverUrl}/api/admin/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.subscription)
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

  // Setup message listeners for service worker communication
  setupMessageListeners() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message from Service Worker:', event.data);
        
        switch (event.data.type) {
          case 'NOTIFICATION_SHOWN':
            this.onNotificationShown(event.data.data);
            break;
          case 'NOTIFICATION_CLICKED':
            this.onNotificationClicked(event.data.action, event.data.data);
            break;
          default:
            console.log('Unknown message type:', event.data.type);
        }
      });
    }
  }

  // Handle notification shown event
  onNotificationShown(notificationData) {
    console.log('📱 Notification was shown:', notificationData);
    // You can add analytics or other tracking here
  }

  // Handle notification clicked event
  onNotificationClicked(action, data) {
    console.log('👆 Notification was clicked:', action, data);
    
    // Handle different actions
    switch (action) {
      case 'view':
        // Navigate to specific page or show modal
        if (data.orderId) {
          this.showOrderDetails(data.orderId);
        }
        break;
      default:
        // Default action - just focus the app
        window.focus();
    }
  }

  // Show order details (example implementation)
  showOrderDetails(orderId) {
    console.log('📋 Showing order details for:', orderId);
    // Implement your order details logic here
    // For example, navigate to order page or show modal
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
          data: {
            ...data,
            timestamp: Date.now()
          }
        })
      });

      const result = await response.json();
      console.log('📤 Push notification sent:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to send push notification:', error);
      throw error;
    }
  }

  // Send test notification
  async sendTestNotification() {
    if (!this.isInitialized) {
      throw new Error('Mobile Push Service not initialized');
    }

    try {
      const result = await this.sendPushNotification(
        '🧪 Test Mobile Notification',
        'This notification should appear even when the app is closed!',
        {
          type: 'test',
          action: 'view'
        }
      );
      
      console.log('✅ Test notification sent successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to send test notification:', error);
      throw error;
    }
  }

  // Send order notification
  async sendOrderNotification(orderData) {
    if (!this.isInitialized) {
      console.warn('Mobile Push Service not initialized');
      return;
    }

    try {
      const customerName = `${orderData.customerInfo?.firstName || ''} ${orderData.customerInfo?.lastName || ''}`.trim();
      const orderTotal = orderData.total ? `PKR ${orderData.total.toFixed(0)}` : 'Unknown amount';
      
      const result = await this.sendPushNotification(
        `🛍️ New Order #${orderData.orderNumber}`,
        `${customerName || 'Customer'} placed an order for ${orderTotal}`,
        {
          type: 'new_order',
          orderId: orderData.id,
          orderNumber: orderData.orderNumber,
          customerName: customerName,
          total: orderTotal,
          action: 'view'
        }
      );
      
      console.log('📦 Order notification sent successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to send order notification:', error);
      throw error;
    }
  }

  // Get service status
  getStatus() {
    return {
      supported: this.isSupported,
      permission: this.permission,
      initialized: this.isInitialized,
      subscribed: !!this.subscription,
      serviceWorkerReady: !!this.serviceWorkerRegistration,
      vapidKeyLoaded: !!this.vapidPublicKey
    };
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (this.subscription) {
      try {
        await this.subscription.unsubscribe();
        this.subscription = null;
        console.log('✅ Unsubscribed from push notifications');
        return true;
      } catch (error) {
        console.error('❌ Failed to unsubscribe:', error);
        return false;
      }
    }
    return true;
  }
}

// Create global instance
const mobilePushService = new MobilePushService();

export default mobilePushService;
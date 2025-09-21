// Notification initialization service
import notificationService from './notificationService';

class NotificationInitService {
  constructor() {
    this.isInitialized = false;
    this.services = {
      mobileNotification: null,
      mobilePush: null
    };
  }

  // Initialize all notification services
  async init() {
    console.log('🔔 Initializing Notification Services...');
    
    try {
      // Initialize the main notification service (FCM + PWA)
      console.log('📱 Initializing Push Notification Service...');
      const notificationResult = await notificationService.initialize();
      this.services.mobilePush = notificationResult;
      
      if (notificationResult) {
        console.log('✅ Push Notification Service initialized successfully');
      } else {
        console.warn('⚠️ Push Notification Service failed to initialize');
      }

      // Set initialization status
      this.isInitialized = notificationResult;
      
      if (this.isInitialized) {
        console.log('🎉 Notification Services initialized successfully!');
        
        // Set up order notification integration
        this.setupOrderNotifications();
        
        // Add services to window for debugging
        window.notificationService = notificationService;
        window.notificationInit = this;
        
        return true;
      } else {
        console.error('❌ Notification service failed to initialize');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error initializing notification services:', error);
      return false;
    }
  }

  // Set up order notification integration
  setupOrderNotifications() {
    console.log('🔗 Setting up order notification integration...');
    
    // Listen for order events from the main app
    window.addEventListener('newOrder', (event) => {
      const orderData = event.detail;
      console.log('📦 New order event received:', orderData);
      this.handleNewOrder(orderData);
    });

    // Listen for storage changes (new orders in IndexedDB)
    window.addEventListener('storage', (event) => {
      if (event.key === 'newOrder') {
        const orderData = JSON.parse(event.newValue || '{}');
        console.log('💾 New order from storage:', orderData);
        this.handleNewOrder(orderData);
      }
    });
  }

  // Handle new order notifications
  async handleNewOrder(orderData) {
    console.log('🛍️ Processing new order notification:', orderData.orderNumber);
    
    try {
      // Send push notification if service is available
      if (this.services.mobilePush && notificationService.token) {
        // Show local notification
        notificationService.showCustomNotification({
          title: `🛍️ New Order #${orderData.orderNumber}`,
          body: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName} placed an order for Rs ${orderData.total}`,
          data: {
            orderId: orderData.id?.toString(),
            orderNumber: orderData.orderNumber,
            customerName: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
            total: orderData.total?.toString()
          }
        });
      }

      console.log('✅ Order notifications sent successfully');
    } catch (error) {
      console.error('❌ Error sending order notifications:', error);
    }
  }

  // Send test notification
  async sendTestNotification() {
    console.log('🧪 Sending test notifications...');
    
    const results = {
      mobilePush: false
    };

    try {
      // Test push notification service
      if (this.services.mobilePush && notificationService.token) {
        await notificationService.sendTestNotification();
        results.mobilePush = true;
        console.log('✅ Mobile push test sent');
      }

      console.log('🧪 Test notification results:', results);
      return results;
    } catch (error) {
      console.error('❌ Error sending test notifications:', error);
      return results;
    }
  }

  // Get overall status
  getStatus() {
    return {
      initialized: this.isInitialized,
      services: {
        mobilePush: {
          initialized: this.services.mobilePush,
          hasToken: !!notificationService.token,
          isSupported: notificationService.isSupported
        }
      }
    };
  }

  // Request permissions for all services
  async requestPermissions() {
    console.log('🔐 Requesting notification permissions...');
    
    const results = {
      mobilePush: 'denied'
    };

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      results.mobilePush = permission;
      
      if (permission === 'granted') {
        // Re-initialize to get token
        await notificationService.initialize();
      }
      
      console.log('🔐 Permission results:', results);
      return results;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return results;
    }
  }

  // Trigger order notification manually (for testing)
  async triggerOrderNotification(orderData = null) {
    const testOrderData = orderData || {
      id: `test-${Date.now()}`,
      orderNumber: `TEST-${Date.now()}`,
      customerInfo: {
        firstName: 'Test',
        lastName: 'Customer',
        email: 'test@example.com'
      },
      items: [
        {
          name: 'Test Eyeglasses',
          price: 2500,
          quantity: 1
        }
      ],
      total: 2500,
      orderDate: new Date().toISOString()
    };

    console.log('🎯 Triggering test order notification:', testOrderData.orderNumber);
    await this.handleNewOrder(testOrderData);
  }
}

// Create global instance
const notificationInit = new NotificationInitService();

// Export for use in other files
export default notificationInit;

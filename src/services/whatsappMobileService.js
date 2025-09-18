// WhatsApp notification service for mobile alerts
class WhatsAppMobileService {
  constructor() {
    this.isEnabled = false;
    this.phoneNumber = '';
    this.lastOrderCount = 0;
    this.checkInterval = null;
  }

  // Initialize WhatsApp notifications
  async init(phoneNumber) {
    this.phoneNumber = phoneNumber;
    this.isEnabled = true;
    
    console.log(`📱 WhatsApp notifications enabled for: ${phoneNumber}`);
    
    // Start monitoring for new orders
    await this.startOrderMonitoring();
    
    return true;
  }

  // Start monitoring for new orders
  async startOrderMonitoring() {
    this.lastOrderCount = await this.getOrderCount();
    console.log(`📊 WhatsApp monitoring started. Current orders: ${this.lastOrderCount}`);

    // Check for new orders every 10 seconds
    this.checkInterval = setInterval(async () => {
      await this.checkForNewOrders();
    }, 10000);
  }

  // Check for new orders
  async checkForNewOrders() {
    try {
      const currentOrderCount = await this.getOrderCount();
      
      if (currentOrderCount > this.lastOrderCount) {
        const newOrdersCount = currentOrderCount - this.lastOrderCount;
        console.log(`🆕 ${newOrdersCount} new order(s) detected for WhatsApp!`);
        
        const latestOrders = await this.getLatestOrders(newOrdersCount);
        
        for (const order of latestOrders) {
          await this.sendWhatsAppNotification(order);
        }
        
        this.lastOrderCount = currentOrderCount;
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  }

  // Send WhatsApp notification
  async sendWhatsAppNotification(order) {
    if (!this.isEnabled || !this.phoneNumber) {
      return;
    }

    try {
      const customerName = `${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim();
      const orderTotal = order.total ? `PKR ${order.total.toFixed(0)}` : 'Unknown amount';
      
      const message = `🔔 NEW ORDER ALERT 🔔

📋 Order #${order.orderNumber}
👤 Customer: ${customerName || 'Unknown'}
💰 Amount: ${orderTotal}
📅 Time: ${new Date().toLocaleString()}

📦 Items:
${order.items?.map(item => `• ${item.name} x${item.quantity || 1}`).join('\n') || 'No items listed'}

🚀 Action Required: Please check your admin panel to process this order.

📱 Mobile App: ${window.location.origin}/mobile-app-working.html`;

      // Create WhatsApp link
      const whatsappUrl = `https://wa.me/${this.phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      
      // For mobile, automatically open WhatsApp
      if (this.isMobile()) {
        window.open(whatsappUrl, '_blank');
      } else {
        // For desktop, show the message and link
        console.log('WhatsApp message:', message);
        console.log('WhatsApp URL:', whatsappUrl);
      }
      
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
    }
  }

  // Check if device is mobile
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Get order count from IndexedDB
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
        
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => resolve(0);
      };
      
      request.onerror = () => resolve(0);
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
          const sortedOrders = orders
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, count);
          resolve(sortedOrders);
        };
        
        getAllRequest.onerror = () => resolve([]);
      };
      
      request.onerror = () => resolve([]);
    });
  }

  // Send test WhatsApp message
  async sendTestMessage() {
    if (!this.phoneNumber) {
      throw new Error('Phone number required');
    }

    const testMessage = `🧪 TEST NOTIFICATION

This is a test message from your Eyewearr Admin Mobile App!

✅ WhatsApp notifications are working
📱 You will receive messages like this when new orders are placed
🚀 Your mobile notification system is ready!

Time: ${new Date().toLocaleString()}`;

    const whatsappUrl = `https://wa.me/${this.phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(testMessage)}`;
    
    if (this.isMobile()) {
      window.open(whatsappUrl, '_blank');
    } else {
      console.log('Test WhatsApp message:', testMessage);
      window.open(whatsappUrl, '_blank');
    }
    
    return true;
  }

  // Stop monitoring
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      this.isEnabled = false;
      console.log('🛑 WhatsApp monitoring stopped');
    }
  }
}

// Export for global use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WhatsAppMobileService;
} else {
  window.WhatsAppMobileService = WhatsAppMobileService;
}
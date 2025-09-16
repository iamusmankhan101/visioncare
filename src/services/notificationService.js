import { getNotificationToken, onMessageListener } from '../config/firebase';

class NotificationService {
  constructor() {
    this.token = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Initialize notification service
  async initialize() {
    console.log('🔔 Initializing notification service...');
    
    // Check if running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  window.navigator.standalone || 
                  document.referrer.includes('android-app://');
    console.log('Running as PWA:', isPWA);
    
    // Detect mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('Mobile device detected:', isMobile);
    
    if (!this.isSupported) {
      console.warn('Push notifications are not supported');
      return false;
    }

    // For mobile browsers (not PWA), show installation prompt
    if (isMobile && !isPWA) {
      console.log('📱 Mobile browser detected - PWA installation recommended');
      this.showPWAInstallPrompt();
    }

    try {
      // Request permission
      console.log('📱 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        
        // Get FCM token
        console.log('🔑 Getting FCM token...');
        this.token = await getNotificationToken();
        console.log('Token received:', this.token ? 'Yes' : 'No');
        
        if (this.token) {
          // Send token to your backend to store for admin
          console.log('📤 Registering token with backend...');
          await this.registerToken(this.token);
          
          // Listen for foreground messages
          this.setupForegroundListener();
          
          console.log('🎉 Notification service initialized successfully');
          return true;
        } else {
          console.error('❌ Failed to get FCM token');
          return false;
        }
      } else {
        console.log('❌ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
      return false;
    }
  }

  // Show PWA installation prompt for mobile
  showPWAInstallPrompt() {
    const installBanner = document.createElement('div');
    installBanner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #007bff;
      color: white;
      padding: 1rem;
      text-align: center;
      z-index: 10000;
      font-size: 0.9rem;
    `;
    installBanner.innerHTML = `
      📱 For mobile notifications, install this app to your home screen!
      <button onclick="this.parentElement.remove()" style="margin-left: 1rem; background: white; color: #007bff; border: none; padding: 0.5rem; border-radius: 4px;">Got it</button>
    `;
    document.body.appendChild(installBanner);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (installBanner.parentNode) {
        installBanner.remove();
      }
    }, 10000);
  }

  // Register token with backend
  async registerToken(token) {
    try {
      const response = await fetch('http://localhost:5002/api/admin/register-notification-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          deviceType: 'web',
          userType: 'admin',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('Notification token registered successfully');
        localStorage.setItem('fcm_token', token);
      }
    } catch (error) {
      console.error('Error registering token:', error);
    }
  }

  // Setup foreground message listener
  setupForegroundListener() {
    onMessageListener()
      .then((payload) => {
        console.log('Received foreground message:', payload);
        
        // Show custom notification
        this.showCustomNotification({
          title: payload.notification?.title || 'New Order',
          body: payload.notification?.body || 'A new order has been placed',
          data: payload.data
        });
      })
      .catch((err) => console.log('Failed to receive message: ', err));
  }

  // Show custom notification with actions
  showCustomNotification({ title, body, data }) {
    // Create notification sound
    this.playNotificationSound();

    // Show browser notification
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
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
        data: data
      });

      notification.onclick = () => {
        window.focus();
        if (data?.orderId) {
          window.location.href = `/admin/orders/${data.orderId}`;
        }
        notification.close();
      };
    }

    // Also show in-app notification
    this.showInAppNotification({ title, body, data });
  }

  // Play notification sound
  playNotificationSound() {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Notification sound not available');
    }
  }

  // Show in-app notification
  showInAppNotification({ title, body, data }) {
    // Create and show toast notification
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-body">${body}</div>
        <div class="notification-actions">
          <button onclick="window.location.href='/admin/orders/${data?.orderId || ''}'">View Order</button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()">Dismiss</button>
        </div>
      </div>
    `;

    // Add styles
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 350px;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Auto remove after 10 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 10000);
  }

  // Send test notification
  async sendTestNotification() {
    try {
      const response = await fetch('http://localhost:5002/api/admin/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.token
        })
      });

      if (response.ok) {
        console.log('Test notification sent');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;

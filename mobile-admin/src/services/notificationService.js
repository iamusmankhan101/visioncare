import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      
      console.log('Push token:', token);
    } catch (e) {
      console.error('Error getting push token:', e);
      token = `ExponentPushToken[${Math.random().toString(36).substr(2, 9)}]`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

// Send local notification
export async function sendLocalNotification(title, body, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
}

// Cancel all notifications
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

// Get notification permissions
export async function getNotificationPermissions() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Error getting notification permissions:', error);
    return 'undetermined';
  }
}

// Request notification permissions
export async function requestNotificationPermissions() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return 'denied';
  }
}

// Notification types for the admin app
export const NOTIFICATION_TYPES = {
  NEW_ORDER: 'new_order',
  ORDER_STATUS_CHANGE: 'order_status_change',
  LOW_STOCK: 'low_stock',
  CUSTOMER_MESSAGE: 'customer_message',
  SYSTEM_ALERT: 'system_alert',
};

// Create notification content based on type
export function createNotificationContent(type, data) {
  switch (type) {
    case NOTIFICATION_TYPES.NEW_ORDER:
      return {
        title: '🛍️ New Order Received!',
        body: `Order #${data.orderNumber} from ${data.customerName} - ${data.amount}`,
        data: {
          type: 'order',
          orderId: data.orderId,
          action: 'view_order',
        },
      };
      
    case NOTIFICATION_TYPES.ORDER_STATUS_CHANGE:
      return {
        title: '📦 Order Status Updated',
        body: `Order #${data.orderNumber} is now ${data.status}`,
        data: {
          type: 'order',
          orderId: data.orderId,
          action: 'view_order',
        },
      };
      
    case NOTIFICATION_TYPES.LOW_STOCK:
      return {
        title: '⚠️ Low Stock Alert',
        body: `${data.productName} is running low (${data.quantity} left)`,
        data: {
          type: 'product',
          productId: data.productId,
          action: 'view_product',
        },
      };
      
    case NOTIFICATION_TYPES.CUSTOMER_MESSAGE:
      return {
        title: '💬 New Customer Message',
        body: `${data.customerName}: ${data.message}`,
        data: {
          type: 'customer',
          customerId: data.customerId,
          action: 'view_customer',
        },
      };
      
    case NOTIFICATION_TYPES.SYSTEM_ALERT:
      return {
        title: '🔔 System Alert',
        body: data.message,
        data: {
          type: 'system',
          action: 'view_dashboard',
        },
      };
      
    default:
      return {
        title: 'Notification',
        body: data.message || 'You have a new notification',
        data: data,
      };
  }
}

// Notification scheduling helpers
export async function scheduleOrderReminder(orderData, delayMinutes = 30) {
  try {
    const trigger = new Date(Date.now() + delayMinutes * 60 * 1000);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Order Reminder',
        body: `Don't forget to process order #${orderData.orderNumber}`,
        data: {
          type: 'order',
          orderId: orderData.orderId,
          action: 'view_order',
        },
        sound: true,
      },
      trigger,
    });
  } catch (error) {
    console.error('Error scheduling order reminder:', error);
  }
}

// Badge management
export async function setBadgeCount(count) {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

export async function clearBadge() {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing badge:', error);
  }
}

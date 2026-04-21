// Firebase configuration for push notifications
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBTQTYPToIGHbQMoLgm8VwzmB0bVNwN1J8",
  authDomain: "vision-care-8b4bf.firebaseapp.com",
  projectId: "vision-care-8b4bf",
  storageBucket: "vision-care-8b4bf.firebasestorage.app",
  messagingSenderId: "180564316187",
  appId: "1:180564316187:web:6eb26cb84cd719bfd6e8be"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

// Get registration token for push notifications
export const getNotificationToken = async () => {
  try {
    console.log('🔑 Attempting to get FCM token...');
    
    // First try without VAPID key (for testing)
    let token;
    try {
      token = await getToken(messaging);
      console.log('✅ Got token without VAPID key:', token ? 'Success' : 'Failed');
    } catch (error) {
      console.log('❌ Failed without VAPID key, trying with VAPID...');
      // If that fails, you need to get the correct VAPID key from Firebase Console
      // Go to Project Settings > Cloud Messaging > Web Push certificates
      token = await getToken(messaging, {
        vapidKey: 'BKqV9Z8f1Z2Z3Y4X5W6V7U8T9S0R1Q2P3O4N5M6L7K8J9I0H1G2F3E4D5C6B7A8Z9Y0X1W2V3U4T5S6R7Q8P9O0N1M2L3K4J5I6H7G8F9E0D1C2B3A4' // Default VAPID key - replace with your actual key
      });
    }
    
    if (token) {
      console.log('✅ FCM token obtained successfully');
      console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
      return token;
    } else {
      console.log('❌ No registration token available');
      return null;
    }
  } catch (err) {
    console.error('❌ Error getting FCM token:', err);
    return null;
  }
};

// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      resolve(payload);
    });
  });

export { messaging };

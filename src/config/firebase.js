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
        vapidKey: 'YOUR_ACTUAL_VAPID_KEY_HERE' // Replace with real VAPID key from Firebase Console
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

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
    const token = await getToken(messaging, {
      vapidKey: 'BG-HQ9TSKB1SX' // Your VAPID key from Firebase Console
    });
    
    if (token) {
      console.log('Notification token:', token);
      return token;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
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

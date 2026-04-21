# Admin Mobile Notification System Setup Guide

## Overview
This system provides instant push notifications to your mobile device whenever a new order is placed on your eyewear store. It includes both push notifications and WhatsApp notifications for maximum reliability.

## Features
- 📱 **Instant Push Notifications** - Get notified immediately on your phone/tablet
- 🔔 **Background Notifications** - Receive notifications even when the app is closed
- 📊 **Admin Dashboard** - Real-time order monitoring and statistics
- 📱 **Progressive Web App** - Install on your phone like a native app
- 🔄 **Multiple Notification Channels** - Push notifications + WhatsApp backup
- 🎵 **Sound Alerts** - Audio notifications for immediate attention

## Quick Setup (5 minutes)

### Step 1: Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Cloud Messaging** in your project
4. Generate a **Web Push Certificate** (VAPID key)
5. Download the **Service Account Key** JSON file

### Step 2: Configure Firebase
1. Update `src/config/firebase.js` with your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

2. Update the VAPID key in the same file:
```javascript
vapidKey: 'your-vapid-key-from-firebase-console'
```

3. Place your service account key file in `server/firebase-service-account-key.json`

### Step 3: Install Dependencies
```bash
# Install Firebase for frontend
npm install firebase

# Install server dependencies
cd server
npm install firebase-admin
```

### Step 4: Start the Notification Server
```bash
cd server
npm run notifications
```

### Step 5: Access Admin Dashboard
1. Open your browser and go to: `http://localhost:3000/admin/dashboard`
2. Click "Enable Notifications" button
3. Allow notification permissions when prompted
4. Click "Send Test Notification" to verify setup

## Mobile Installation (PWA)

### For Android/iPhone:
1. Open `http://localhost:3000/admin/dashboard` in your mobile browser
2. Tap the browser menu (3 dots)
3. Select "Add to Home Screen" or "Install App"
4. The app will be installed like a native app
5. Open the installed app and enable notifications

## How It Works

### When an Order is Placed:
1. **Order Saved** → System saves order to database
2. **Push Notification Sent** → Instant notification to your phone
3. **WhatsApp Message** → Backup notification via WhatsApp
4. **Dashboard Updated** → Real-time stats update

### Notification Content:
- **Title**: "🛍️ New Order #1234"
- **Message**: "John Doe placed an order for Rs 2,999"
- **Actions**: "View Order" button to go directly to order details
- **Sound**: Notification sound plays automatically

## Admin Dashboard Features

### Real-time Stats:
- Today's order count
- Pending orders
- Total revenue
- Active notification devices

### Quick Actions:
- View all orders
- Manage products
- Send test notifications
- Enable/disable notifications

### Recent Notifications:
- List of recent order notifications
- Order details and timestamps
- Direct links to order management

## Troubleshooting

### Notifications Not Working?
1. **Check Browser Permissions**: Ensure notifications are allowed
2. **Verify Firebase Config**: Double-check all Firebase settings
3. **Server Running**: Make sure notification server is running on port 5002
4. **Network Issues**: Check if localhost:5002 is accessible

### Test Commands:
```bash
# Test notification server health
curl http://localhost:5002/health

# Test notification sending
curl -X POST http://localhost:5002/api/admin/test-notification \
  -H "Content-Type: application/json" \
  -d '{"token":"your-device-token"}'
```

### Common Issues:

**Issue**: "No admin tokens registered"
**Solution**: Open admin dashboard and click "Enable Notifications"

**Issue**: Notifications work in browser but not on mobile
**Solution**: Install the PWA app on your phone and enable notifications in the app

**Issue**: Firebase errors
**Solution**: Verify your Firebase config and service account key are correct

## Production Deployment

### Environment Variables:
Create a `.env` file in the server directory:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email
PORT=5002
```

### Deploy to Cloud:
1. Deploy notification server to Heroku/Railway/Vercel
2. Update notification URLs in frontend to use production server
3. Configure Firebase for production domain
4. Test notifications in production environment

## Security Notes
- Service account keys should be kept secure
- Use environment variables for production
- Implement proper authentication for admin routes
- Consider rate limiting for notification endpoints

## Support
If you need help setting up the notification system:
1. Check the browser console for error messages
2. Verify all Firebase configuration steps
3. Test with the provided curl commands
4. Ensure all dependencies are installed correctly

---

**🎉 Once setup is complete, you'll receive instant notifications on your phone whenever customers place orders, enabling faster order processing and better customer service!**

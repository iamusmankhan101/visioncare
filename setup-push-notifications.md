# 📱 Push Notifications Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   Or directly:
   ```bash
   node server/simpleServer.js
   ```

3. **Test Push Notifications**
   Open in your browser:
   - Main test page: `http://localhost:3001/../public/test-push-notifications.html`
   - Mobile app: `http://localhost:3001/../public/mobile-app-working.html`

## Features

### ✅ What's Working
- **Real-time push notifications** to mobile devices
- **Service Worker integration** for background notifications
- **Lock screen notifications** that work even when browser is closed
- **VAPID authentication** for secure push messaging
- **Multiple notification channels** (browser + push)
- **Automatic subscription management**
- **Test notification system**

### 🔧 Server Endpoints
- `GET /api/health` - Server health check
- `GET /api/vapid-public-key` - Get VAPID public key for push subscriptions
- `POST /api/admin/subscribe` - Subscribe device to push notifications
- `POST /api/admin/send-push` - Send push notification to all subscribed devices
- `POST /api/admin/test-notification` - Send test push notification

### 📱 How It Works

1. **Service Worker Registration**: Automatically registers `/sw.js` for background processing
2. **VAPID Key Exchange**: Gets public key from server for secure push messaging
3. **Push Subscription**: Creates browser push subscription and sends to server
4. **Notification Delivery**: Server sends push messages to all subscribed devices
5. **Background Processing**: Service worker handles notifications even when app is closed

### 🧪 Testing

1. **Open Test Page**: Navigate to `test-push-notifications.html`
2. **Initialize**: Click "Initialize Notifications" and grant permissions
3. **Test Push**: Click "Send Test Push" to test the system
4. **Simulate Order**: Click "Simulate New Order" to test order notifications

### 📋 Status Indicators

The test page shows real-time status for:
- Browser notification support
- Push notification support  
- Permission status
- Service worker status
- VAPID key loading
- Push subscription status
- Order monitoring status

### 🔔 Notification Types

1. **Browser Notifications**: Local notifications shown immediately
2. **Push Notifications**: Server-sent notifications that work in background
3. **Lock Screen Notifications**: Persistent notifications with actions
4. **Sound Alerts**: Audio feedback for new notifications

### 🛠️ Troubleshooting

**Notifications not working?**
- Check browser permissions (click lock icon in address bar)
- Ensure server is running on port 3001
- Check browser console for errors
- Try refreshing the page and re-initializing

**Push notifications not received?**
- Verify service worker is registered
- Check VAPID key is loaded
- Ensure push subscription was created
- Look for server errors in terminal

**Lock screen notifications not showing?**
- Enable "Show notifications on lock screen" in browser settings
- Ensure "Persistent notifications" are enabled
- Check that service worker is active

### 🔐 Security Notes

- Uses test VAPID keys (replace in production)
- Subscriptions stored in memory (use database in production)
- CORS enabled for development (restrict in production)

### 📈 Next Steps

- Integrate with real order system
- Add notification preferences
- Implement notification history
- Add push notification analytics
- Set up production VAPID keys
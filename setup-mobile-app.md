# Quick Mobile App Setup

Follow these steps to get your mobile admin app working:

## Step 1: Start the Simple Push Server

```bash
# Navigate to server directory
cd server

# Start the simple push server (no additional dependencies needed)
node simplePushServer.js
```

You should see:
```
🔔 Simple Push Notification Server running on port 5004
📱 Mode: Mock/Testing (install web-push for real notifications)
```

## Step 2: Test the Server

Open your browser and go to:
- `http://localhost:5004/api/health` - Should show server status
- `http://localhost:5004/api/setup-instructions` - Shows upgrade instructions

## Step 3: Access Mobile Test Page

On your phone or computer, go to:
`http://localhost:3000/admin/mobile/test`

Test each feature:
1. ✅ Test Notification Permission
2. ✅ Test Service Worker  
3. ✅ Test Push Server
4. ✅ Send Test Notification

## Step 4: Access Full Mobile App

Once tests pass, go to:
`http://localhost:3000/admin/mobile`

## Troubleshooting

### If you get "Error sending test notification":

1. **Check if server is running:**
   ```bash
   curl http://localhost:5004/api/health
   ```

2. **Check server logs** - Look for error messages in the terminal

3. **Try the simple server first:**
   ```bash
   cd server
   node simplePushServer.js
   ```

4. **Check network connectivity:**
   - Make sure both React app (port 3000) and push server (port 5004) are running
   - Check firewall settings

### Common Issues:

- **CORS errors**: The simple server includes CORS headers
- **Port conflicts**: Change PORT in the server file if needed
- **Network issues**: Make sure you're accessing the correct IP address

## Upgrade to Real Push Notifications

Once the mock version works, upgrade to real notifications:

```bash
cd server
npm install web-push
npx web-push generate-vapid-keys
```

Then update `pushNotificationServer.js` with your VAPID keys and use that instead.

## Success Indicators

✅ Server health check returns status "ok"  
✅ Test notification shows success message  
✅ Mobile app loads without errors  
✅ Stats display correctly  
✅ Recent orders show up  

## Next Steps

1. Install the mobile app as PWA on your phone
2. Enable notifications when prompted
3. Test with real orders
4. Upgrade to real push notifications when ready

Need help? Check the server logs and browser console for detailed error messages.
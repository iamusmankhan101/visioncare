# WhatsApp Order Notification Setup Guide

This guide will help you set up WhatsApp notifications for order confirmations so you can dispatch orders faster.

## 🚀 Quick Start

Your WhatsApp notification system is now integrated! When customers place orders, you'll automatically receive WhatsApp messages with all order details.

## 📋 What's Included

### 1. WhatsApp Service (`src/services/whatsappService.js`)
- Formats order details into WhatsApp messages
- Supports multiple WhatsApp APIs (Twilio, WhatsApp Business API)
- Includes customer info, items, pricing, and shipping details

### 2. Backend Server (`server/whatsappServer.js`)
- Express server with WhatsApp API endpoints
- Supports Twilio and WhatsApp Business API
- Fallback mechanisms if one service fails

### 3. Checkout Integration
- Automatically sends WhatsApp notifications after successful orders
- Non-blocking (won't stop orders if WhatsApp fails)
- Includes all order details for quick dispatch

## 🔧 Setup Options

### Option 1: Twilio WhatsApp API (Recommended)
1. **Create Twilio Account**: Go to [twilio.com](https://www.twilio.com)
2. **Get WhatsApp Sandbox**: Enable WhatsApp in Twilio Console
3. **Get Credentials**:
   - Account SID
   - Auth Token
   - WhatsApp Phone Number (usually `whatsapp:+14155238886`)

### Option 2: WhatsApp Business API
1. **Facebook Business Account**: Create at [business.facebook.com](https://business.facebook.com)
2. **WhatsApp Business API**: Apply for access
3. **Get Credentials**:
   - Access Token
   - Phone Number ID
   - Webhook verification

## 🛠️ Configuration

### 1. Environment Variables
Copy `.env.example` to `.env` and update with your credentials:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Your Business WhatsApp Number
BUSINESS_WHATSAPP=whatsapp:+923001234567  # Replace with your number

# WhatsApp Business API (if using)
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

### 2. Update Your WhatsApp Number
In `.env` file, change `BUSINESS_WHATSAPP` to your actual WhatsApp number:
```
BUSINESS_WHATSAPP=whatsapp:+92XXXXXXXXXX  # Your number with country code
```

## 🚀 Running the Service

### Install Dependencies
```bash
cd server
npm install
```

### Start WhatsApp Server
```bash
# Development mode
npm run whatsapp-dev

# Production mode
npm run whatsapp
```

The server will run on `http://localhost:3002`

## 📱 Message Format

When an order is placed, you'll receive a WhatsApp message like:

```
🔔 NEW ORDER RECEIVED 🔔

📋 Order Details:
Order #: EW123456
Date: January 15, 2024 at 2:30 PM

👤 Customer Information:
Name: John Doe
Email: john@example.com
Phone: +1234567890

📦 Items Ordered:
• Ray-Ban Aviator (Black) - Size: Medium - Qty: 1 - Rs 15000
• Blue Light Glasses (Clear) - Size: Large - Qty: 2 - Rs 8000

💰 Order Summary:
Subtotal: Rs 31000.00
Shipping: Rs 200.00
Total: Rs 31200.00

🚚 Shipping Address:
123 Main Street
New York, NY 10001
United States

💳 Payment Method:
💵 Cash on Delivery

⚡ Action Required:
Please prepare this order for dispatch.
```

## 🧪 Testing

### Test WhatsApp Service
```bash
curl -X POST http://localhost:3002/api/test-whatsapp
```

### Health Check
```bash
curl http://localhost:3002/api/health
```

## 🔧 Troubleshooting

### Common Issues:

1. **WhatsApp not sending**:
   - Check your credentials in `.env`
   - Verify your WhatsApp number format
   - Check server logs for errors

2. **Twilio Sandbox**:
   - Join the Twilio WhatsApp sandbox first
   - Send "join [sandbox-name]" to the Twilio WhatsApp number

3. **Server not starting**:
   - Run `npm install` in the server directory
   - Check if port 3002 is available

### Manual Fallback
If WhatsApp APIs fail, the system will log the formatted message to the console. You can copy and manually send it via WhatsApp Web.

## 🎯 Benefits

- **Instant Notifications**: Get order details immediately
- **Complete Information**: All customer and order details in one message
- **Faster Dispatch**: No need to check email or admin panel
- **Mobile Friendly**: Receive notifications on your phone
- **Reliable**: Multiple fallback methods ensure delivery

## 🔐 Security Notes

- Keep your API credentials secure
- Use environment variables, never hardcode credentials
- Consider using webhook verification for production
- Regularly rotate access tokens

## 📞 Support

If you need help setting up:
1. Check the console logs for error messages
2. Verify your credentials are correct
3. Test with the provided endpoints
4. Ensure your WhatsApp number is properly formatted

Your WhatsApp order notification system is ready to help you dispatch orders faster! 🚀

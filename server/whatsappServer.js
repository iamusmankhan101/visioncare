// WhatsApp notification server for order confirmations
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration - Add these to your environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'your_twilio_account_sid';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your_twilio_auth_token';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// Your business WhatsApp number
const BUSINESS_WHATSAPP = process.env.BUSINESS_WHATSAPP || 'whatsapp:+923001234567'; // Replace with your number

// WhatsApp Business API configuration
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'your_access_token';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || 'your_phone_number_id';

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Route 1: Send WhatsApp via Twilio
app.post('/api/send-whatsapp-twilio', async (req, res) => {
  try {
    const { to, message, orderNumber } = req.body;

    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: TWILIO_WHATSAPP_NUMBER,
      to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    });

    console.log(`WhatsApp sent via Twilio for order ${orderNumber}:`, twilioMessage.sid);
    
    res.json({
      success: true,
      messageSid: twilioMessage.sid,
      status: twilioMessage.status,
      orderNumber
    });
  } catch (error) {
    console.error('Twilio WhatsApp error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route 2: Send WhatsApp via WhatsApp Business API
app.post('/api/send-whatsapp-business', async (req, res) => {
  try {
    const { to, message, orderNumber } = req.body;

    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`WhatsApp sent via Business API for order ${orderNumber}:`, response.data);
    
    res.json({
      success: true,
      messageId: response.data.messages[0].id,
      orderNumber
    });
  } catch (error) {
    console.error('WhatsApp Business API error:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// Route 3: Generic WhatsApp endpoint (fallback)
app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { phone, message, orderData } = req.body;

    // Log the message for manual sending if APIs fail
    console.log('\n=== NEW ORDER WHATSAPP NOTIFICATION ===');
    console.log(`Order: ${orderData.orderNumber}`);
    console.log(`Send to: ${phone}`);
    console.log('Message:');
    console.log(message);
    console.log('=== END NOTIFICATION ===\n');

    // Try Twilio first
    try {
      const twilioMessage = await twilioClient.messages.create({
        body: message,
        from: TWILIO_WHATSAPP_NUMBER,
        to: phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`
      });

      return res.json({
        success: true,
        method: 'twilio',
        messageSid: twilioMessage.sid,
        orderNumber: orderData.orderNumber
      });
    } catch (twilioError) {
      console.log('Twilio failed, trying Business API...');
    }

    // Try WhatsApp Business API
    try {
      const cleanPhone = phone.replace('whatsapp:', '').replace('+', '');
      const response = await axios.post(
        `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: {
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return res.json({
        success: true,
        method: 'business_api',
        messageId: response.data.messages[0].id,
        orderNumber: orderData.orderNumber
      });
    } catch (businessError) {
      console.log('Business API failed');
    }

    // If both fail, return the message for manual sending
    res.json({
      success: false,
      error: 'All WhatsApp methods failed',
      message: message,
      manualSend: true,
      orderNumber: orderData.orderNumber
    });

  } catch (error) {
    console.error('WhatsApp service error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WhatsApp Notification Server',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.post('/api/test-whatsapp', async (req, res) => {
  const testMessage = `🧪 Test message from Eyewearr WhatsApp service\nTime: ${new Date().toLocaleString()}\nStatus: Working ✅`;
  
  try {
    const twilioMessage = await twilioClient.messages.create({
      body: testMessage,
      from: TWILIO_WHATSAPP_NUMBER,
      to: BUSINESS_WHATSAPP
    });

    res.json({
      success: true,
      message: 'Test WhatsApp sent successfully',
      messageSid: twilioMessage.sid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Test failed - check your Twilio credentials'
    });
  }
});

app.listen(PORT, () => {
  console.log(`WhatsApp notification server running on port ${PORT}`);
  console.log(`Business WhatsApp: ${BUSINESS_WHATSAPP}`);
  console.log(`Twilio WhatsApp: ${TWILIO_WHATSAPP_NUMBER}`);
  console.log('\nAvailable endpoints:');
  console.log('- POST /api/send-whatsapp-twilio');
  console.log('- POST /api/send-whatsapp-business');
  console.log('- POST /api/send-whatsapp');
  console.log('- POST /api/test-whatsapp');
  console.log('- GET /api/health');
});

module.exports = app;

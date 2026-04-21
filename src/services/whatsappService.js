// WhatsApp notification service for order confirmations
// Using WhatsApp Business API or third-party services like Twilio

// Configuration - Replace with your actual credentials
const WHATSAPP_CONFIG = {
  // Option 1: Twilio WhatsApp API
  twilioAccountSid: process.env.REACT_APP_TWILIO_ACCOUNT_SID || 'your_twilio_account_sid',
  twilioAuthToken: process.env.REACT_APP_TWILIO_AUTH_TOKEN || 'your_twilio_auth_token',
  twilioWhatsAppNumber: process.env.REACT_APP_TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
  
  // Your business WhatsApp number to receive notifications
  businessWhatsAppNumber: process.env.REACT_APP_BUSINESS_WHATSAPP || '+923001234567', // Replace with your WhatsApp number
  
  // Option 2: WhatsApp Business API
  whatsappApiUrl: process.env.REACT_APP_WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0',
  whatsappAccessToken: process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN || 'your_access_token',
  whatsappPhoneNumberId: process.env.REACT_APP_WHATSAPP_PHONE_NUMBER_ID || 'your_phone_number_id'
};

// Format order details for WhatsApp message
const formatOrderForWhatsApp = (orderData) => {
  const items = orderData.items.map(item => 
    `• ${item.name} ${item.selectedColor ? `(${item.selectedColor})` : ''} ${item.selectedSize ? `- Size: ${item.selectedSize}` : ''} - Qty: ${item.quantity || 1} - Rs ${item.price}`
  ).join('\n');

  const customerInfo = orderData.customerInfo;
  
  return `🔔 *NEW ORDER RECEIVED* 🔔

📋 *Order Details:*
Order #: ${orderData.orderNumber}
Date: ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

👤 *Customer Information:*
Name: ${customerInfo.firstName} ${customerInfo.lastName}
Email: ${customerInfo.email}
Phone: ${customerInfo.phone}

📦 *Items Ordered:*
${items}

💰 *Order Summary:*
Subtotal: Rs ${orderData.subtotal.toFixed(2)}
Shipping: Rs ${orderData.shipping.toFixed(2)}
${orderData.discount > 0 ? `Discount: -Rs ${orderData.discount.toFixed(2)}\n` : ''}*Total: Rs ${orderData.total.toFixed(2)}*

🚚 *Shipping Address:*
${customerInfo.address}
${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}
${customerInfo.country}

💳 *Payment Method:*
${orderData.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}

⚡ *Action Required:*
Please prepare this order for dispatch.

---
Eyewearr Order Management System`;
};

// Send WhatsApp notification using Twilio API
export const sendWhatsAppNotificationTwilio = async (orderData) => {
  try {
    const message = formatOrderForWhatsApp(orderData);
    
    // This would typically be called from your backend
    // For demo purposes, we'll show the structure
    const response = await fetch('/api/send-whatsapp-twilio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: WHATSAPP_CONFIG.businessWhatsAppNumber,
        message: message,
        orderNumber: orderData.orderNumber
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('WhatsApp notification sent via Twilio:', result);
      return { success: true, result };
    } else {
      throw new Error('Failed to send WhatsApp notification via Twilio');
    }
  } catch (error) {
    console.error('Twilio WhatsApp notification failed:', error);
    return { success: false, error: error.message };
  }
};

// Send WhatsApp notification using WhatsApp Business API
export const sendWhatsAppNotificationBusiness = async (orderData) => {
  try {
    const message = formatOrderForWhatsApp(orderData);
    
    // This would typically be called from your backend
    const response = await fetch('/api/send-whatsapp-business', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: WHATSAPP_CONFIG.businessWhatsAppNumber.replace('+', ''),
        message: message,
        orderNumber: orderData.orderNumber
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('WhatsApp notification sent via Business API:', result);
      return { success: true, result };
    } else {
      throw new Error('Failed to send WhatsApp notification via Business API');
    }
  } catch (error) {
    console.error('WhatsApp Business API notification failed:', error);
    return { success: false, error: error.message };
  }
};

// Alternative: Send via third-party WhatsApp API service
export const sendWhatsAppNotificationThirdParty = async (orderData) => {
  try {
    const message = formatOrderForWhatsApp(orderData);
    
    // Using a service like WhatsApp API providers (e.g., 360Dialog, MessageBird, etc.)
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: WHATSAPP_CONFIG.businessWhatsAppNumber,
        message: message,
        orderData: orderData
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('WhatsApp notification sent:', result);
      return { success: true, result };
    } else {
      throw new Error('Failed to send WhatsApp notification');
    }
  } catch (error) {
    console.error('WhatsApp notification failed:', error);
    return { success: false, error: error.message };
  }
};

// Main function to send WhatsApp notification (tries multiple methods)
export const sendOrderWhatsAppNotification = async (orderData) => {
  console.log('Sending WhatsApp order notification:', orderData.orderNumber);
  
  // Try different methods in order of preference
  try {
    // Method 1: Try Twilio WhatsApp API
    const twilioResult = await sendWhatsAppNotificationTwilio(orderData);
    if (twilioResult.success) {
      return twilioResult;
    }
    
    // Method 2: Try WhatsApp Business API
    const businessResult = await sendWhatsAppNotificationBusiness(orderData);
    if (businessResult.success) {
      return businessResult;
    }
    
    // Method 3: Try third-party service
    const thirdPartyResult = await sendWhatsAppNotificationThirdParty(orderData);
    if (thirdPartyResult.success) {
      return thirdPartyResult;
    }
    
    // If all methods fail, log the formatted message for manual sending
    console.log('All WhatsApp methods failed. Message to send manually:');
    console.log(formatOrderForWhatsApp(orderData));
    
    return { 
      success: false, 
      error: 'All WhatsApp notification methods failed',
      message: formatOrderForWhatsApp(orderData)
    };
    
  } catch (error) {
    console.error('WhatsApp notification service error:', error);
    return { success: false, error: error.message };
  }
};

// Utility function to validate WhatsApp phone number format
export const validateWhatsAppNumber = (phoneNumber) => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid length (10-15 digits)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return false;
  }
  
  return true;
};

// Format phone number for WhatsApp
export const formatWhatsAppNumber = (phoneNumber, countryCode = '+92') => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // If number doesn't start with country code, add it
  if (!cleaned.startsWith(countryCode.replace('+', ''))) {
    return `${countryCode}${cleaned}`;
  }
  
  return `+${cleaned}`;
};

export default {
  sendOrderWhatsAppNotification,
  sendWhatsAppNotificationTwilio,
  sendWhatsAppNotificationBusiness,
  sendWhatsAppNotificationThirdParty,
  validateWhatsAppNumber,
  formatWhatsAppNumber
};

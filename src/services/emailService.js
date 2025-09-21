// Email service for sending order confirmations
import emailjs from '@emailjs/browser';

// EmailJS configuration
// TODO: Replace these with your actual EmailJS credentials
const EMAIL_SERVICE_ID = 'service_c8oh7k9'; // Replace with your EmailJS service ID from step 2
const EMAIL_TEMPLATE_ID = 'template_bf0ab4b'; // This should match your template ID
const EMAIL_PUBLIC_KEY = 'PA1sBHzR3bGsllCLx'; // Replace with your EmailJS public key from Account > General

// Contact form specific EmailJS configuration
const CONTACT_SERVICE_ID = 'service_c8oh7k9'; // Replace with your contact form service ID
const CONTACT_TEMPLATE_ID = 'template_6yf73tb'; // Contact form template ID

// Admin email addresses
const ADMIN_EMAILS = [
  'visioncareoptometryclicnic@gmail.com',
  'iamusmankhan101@gmail.com'
];

// Initialize EmailJS
try {
  emailjs.init(EMAIL_PUBLIC_KEY);
  console.log('EmailJS initialized successfully');
} catch (error) {
  console.error('Failed to initialize EmailJS:', error);
}

// Debug function to show EmailJS configuration
export const debugEmailJSConfig = () => {
  console.log('=== EmailJS Configuration Debug ===');
  console.log('Service ID:', EMAIL_SERVICE_ID);
  console.log('Template ID:', EMAIL_TEMPLATE_ID);
  console.log('Public Key:', EMAIL_PUBLIC_KEY);
  console.log('Contact Service ID:', CONTACT_SERVICE_ID);
  console.log('Contact Template ID:', CONTACT_TEMPLATE_ID);
  console.log('Admin Emails:', ADMIN_EMAILS);
  console.log('EmailJS initialized:', typeof emailjs !== 'undefined');
  console.log('===================================');
  
  return {
    serviceId: EMAIL_SERVICE_ID,
    templateId: EMAIL_TEMPLATE_ID,
    publicKey: EMAIL_PUBLIC_KEY,
    contactServiceId: CONTACT_SERVICE_ID,
    contactTemplateId: CONTACT_TEMPLATE_ID,
    adminEmails: ADMIN_EMAILS,
    initialized: typeof emailjs !== 'undefined'
  };
};

// Test EmailJS connection with real email
export const testEmailJSWithRealEmail = async (testEmail = 'iamusmankhan101@gmail.com') => {
  try {
    console.log('Testing EmailJS with real email:', testEmail);
    console.log('Service ID:', EMAIL_SERVICE_ID);
    console.log('Template ID:', EMAIL_TEMPLATE_ID);
    console.log('Public Key:', EMAIL_PUBLIC_KEY);
    
    const testParams = {
      // Multiple email field formats to ensure compatibility
      to_email: testEmail,
      email: testEmail,
      to_name: 'Test User',
      customer_name: 'Test User',
      order_number: 'TEST-123',
      order_date: new Date().toLocaleDateString(),
      items: 'Test Item - Qty: 1 - PKR 100',
      subtotal: 'PKR 100',
      shipping: 'PKR 50',
      discount: 'None',
      total: 'PKR 150',
      shipping_address: 'Test Address, Test City',
      phone: '+92 300 1234567',
      payment_method: 'Test Payment',
      // Additional common EmailJS fields
      from_name: 'Eyewearr',
      from_email: 'noreply@eyewearr.com',
      reply_to: 'support@eyewearr.com'
    };
    
    console.log('Sending test email with params:', testParams);
    
    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      testParams
    );
    
    console.log('EmailJS test email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('EmailJS test email failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      text: error.text,
      name: error.name
    });
    return { success: false, error: error.text || error.message || 'Test email failed' };
  }
};

// Test EmailJS connection (basic test)
export const testEmailJSConnection = async () => {
  try {
    console.log('Testing EmailJS connection...');
    console.log('Service ID:', EMAIL_SERVICE_ID);
    console.log('Template ID:', EMAIL_TEMPLATE_ID);
    console.log('Public Key:', EMAIL_PUBLIC_KEY);
    
    // Use admin email for testing
    return await testEmailJSWithRealEmail('iamusmankhan101@gmail.com');
  } catch (error) {
    console.error('EmailJS connection test failed:', error);
    return { success: false, error: error.text || error.message || 'Connection test failed' };
  }
};

// Send order notification to admin emails
export const sendOrderNotificationToAdmin = async (orderData) => {
  try {
    console.log('Sending order notification to admin emails...');
    
    // Ensure order data is available
    if (!orderData || !orderData.customerInfo) {
      console.error('Order data is missing');
      return { success: false, error: 'Order data is required' };
    }
    
    // Format order items for admin email
    const orderItemsText = orderData.items?.map(item => 
      `${item.name} - Qty: ${item.quantity || 1} - PKR ${item.price}`
    ).join('\n') || 'No items';
    
    const results = [];
    
    // Send notification to each admin email
    for (const adminEmail of ADMIN_EMAILS) {
      try {
        console.log(`Sending notification to: ${adminEmail}`);
        
        const adminTemplateParams = {
          // Send to current admin email
          to_email: adminEmail,
          email: adminEmail,
          to_name: 'Admin',
          customer_name: `${orderData.customerInfo?.firstName || ''} ${orderData.customerInfo?.lastName || ''}`.trim(),
          customer_email: orderData.customerInfo.email,
          order_number: orderData.orderNumber || `ORD-${Date.now()}`,
          order_date: new Date().toLocaleDateString(),
          items: orderItemsText,
          subtotal: `PKR ${(orderData.subtotal || 0).toFixed(2)}`,
          shipping: `PKR ${(orderData.shipping || 0).toFixed(2)}`,
          discount: orderData.discount > 0 ? `PKR ${orderData.discount.toFixed(2)}` : 'None',
          total: `PKR ${(orderData.total || 0).toFixed(2)}`,
          shipping_address: `${orderData.customerInfo?.address || ''}, ${orderData.customerInfo?.city || ''}, ${orderData.customerInfo?.state || ''} ${orderData.customerInfo?.zipCode || ''}`,
          phone: `${orderData.customerInfo?.countryCode || ''} ${orderData.customerInfo?.phone || ''}`,
          payment_method: orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
          // Additional fields for admin notification
          from_name: 'Eyewearr Order System',
          from_email: 'orders@eyewearr.com',
          reply_to: orderData.customerInfo.email,
          // Admin-specific message
          admin_message: `New order received from ${orderData.customerInfo?.firstName} ${orderData.customerInfo?.lastName} (${orderData.customerInfo.email}). Order total: PKR ${(orderData.total || 0).toFixed(2)}. Please process this order for dispatch.`
        };

        const response = await emailjs.send(
          EMAIL_SERVICE_ID,
          EMAIL_TEMPLATE_ID,
          adminTemplateParams
        );

        console.log(`Admin notification sent successfully to ${adminEmail}:`, response);
        results.push({ email: adminEmail, success: true, response });
        
        // Add small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Failed to send admin notification to ${adminEmail}:`, error);
        results.push({ 
          email: adminEmail, 
          success: false, 
          error: error.text || error.message || 'Failed to send' 
        });
      }
    }
    
    // Check if at least one email was sent successfully
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`Admin notifications: ${successCount}/${totalCount} sent successfully`);
    
    if (successCount > 0) {
      return { 
        success: true, 
        results, 
        message: `${successCount}/${totalCount} admin notifications sent successfully` 
      };
    } else {
      return { 
        success: false, 
        results, 
        error: 'Failed to send notifications to any admin email' 
      };
    }
    
  } catch (error) {
    console.error('Failed to send admin order notifications:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      text: error.text,
      name: error.name,
      stack: error.stack
    });
    
    const errorMessage = error.text || error.message || JSON.stringify(error);
    return { success: false, error: errorMessage };
  }
};

// Contact form notification service - sends to admin email
export const sendContactFormNotification = async (formData) => {
  try {
    // Validate form data
    if (!formData.email || !formData.firstName || !formData.message) {
      console.error('Missing required form data:', formData);
      return { success: false, error: 'Missing required form fields' };
    }

    const templateParams = {
      // Send notification to admin emails (using first admin email as primary)
      to_email: ADMIN_EMAILS[0],
      email: ADMIN_EMAILS[0],
      customer_name: `${formData.firstName} ${formData.lastName}`,
      from_email: formData.email,
      order_id: `CONTACT-${Date.now()}`,
      orders: `New Contact Form Submission`,
      order_items: `Customer: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nMessage: ${formData.message}`,
      item_quantity: '1',
      price: 'Contact Form',
      shipping_amount: 'N/A',
      total_amount: 'Contact Inquiry',
      message: `New contact form submission from ${formData.firstName} ${formData.lastName} (${formData.email}): ${formData.message}`
    };

    console.log('Sending admin notification with params:', templateParams);

    const response = await emailjs.send(
      CONTACT_SERVICE_ID,
      CONTACT_TEMPLATE_ID,
      templateParams
    );

    console.log('Contact form notification sent to admin:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send contact form notification:', error);
    return { success: false, error: error.message || error };
  }
};

// Contact form confirmation service - sends to customer email
export const sendContactFormConfirmation = async (formData) => {
  try {
    // Validate form data
    if (!formData.email || !formData.firstName) {
      console.error('Missing required form data for customer confirmation:', formData);
      return { success: false, error: 'Missing customer email or name' };
    }

    const templateParams = {
      // Send confirmation to customer's email
      to_email: formData.email,
      email: formData.email,
      customer_name: `${formData.firstName} ${formData.lastName}`,
      from_email: 'iamusmankhan101@gmail.com',
      order_id: `CONTACT-${Date.now()}`,
      orders: 'Contact Form Submission Received',
      order_items: `Thank you for contacting us! We have received your message and will get back to you soon.`,
      item_quantity: '1',
      price: 'Thank You',
      shipping_amount: 'N/A',
      total_amount: 'Contact Received',
      message: `Dear ${formData.firstName}, thank you for contacting Eyewearr! We have received your message and will respond within 24 hours.`
    };

    console.log('Sending customer confirmation with params:', templateParams);

    const response = await emailjs.send(
      CONTACT_SERVICE_ID,
      CONTACT_TEMPLATE_ID,
      templateParams
    );

    console.log('Contact form confirmation sent to customer:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send contact form confirmation:', error);
    return { success: false, error: error.message || error };
  }
};

export const sendOrderConfirmationEmail = async (orderData) => {
  try {
    // Check if EmailJS is properly configured
    if (!EMAIL_SERVICE_ID || !EMAIL_TEMPLATE_ID || !EMAIL_PUBLIC_KEY) {
      console.error('EmailJS configuration is incomplete');
      return { success: false, error: 'EmailJS configuration is incomplete' };
    }

    // Debug log to check email data
    console.log('Order data for email:', orderData);
    console.log('Customer email:', orderData.customerInfo?.email);
    
    // Ensure customer email is available
    if (!orderData.customerInfo?.email) {
      console.error('Customer email is missing from order data');
      return { success: false, error: 'Customer email is required' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.customerInfo.email)) {
      console.error('Invalid email format:', orderData.customerInfo.email);
      return { success: false, error: 'Invalid email format' };
    }
    
    // Format order items for email
    const orderItemsText = orderData.items?.map(item => 
      `${item.name} - Qty: ${item.quantity || 1} - PKR ${item.price}`
    ).join('\n') || 'No items';
    
    const templateParams = {
      // Multiple email field formats to ensure compatibility
      to_email: orderData.customerInfo.email,
      email: orderData.customerInfo.email,
      to_name: `${orderData.customerInfo?.firstName || ''} ${orderData.customerInfo?.lastName || ''}`.trim(),
      customer_name: `${orderData.customerInfo?.firstName || ''} ${orderData.customerInfo?.lastName || ''}`.trim(),
      order_number: orderData.orderNumber || `ORD-${Date.now()}`,
      order_date: new Date().toLocaleDateString(),
      items: orderItemsText,
      subtotal: `PKR ${(orderData.subtotal || 0).toFixed(2)}`,
      shipping: `PKR ${(orderData.shipping || 0).toFixed(2)}`,
      discount: orderData.discount > 0 ? `PKR ${orderData.discount.toFixed(2)}` : 'None',
      total: `PKR ${(orderData.total || 0).toFixed(2)}`,
      shipping_address: `${orderData.customerInfo?.address || ''}, ${orderData.customerInfo?.city || ''}, ${orderData.customerInfo?.state || ''} ${orderData.customerInfo?.zipCode || ''}`,
      phone: `${orderData.customerInfo?.countryCode || ''} ${orderData.customerInfo?.phone || ''}`,
      payment_method: orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
      // Additional common EmailJS fields
      from_name: 'Eyewearr',
      from_email: 'noreply@eyewearr.com',
      reply_to: 'support@eyewearr.com'
    };
    
    console.log('Email template params:', templateParams);

    console.log('Attempting to send email with EmailJS...');
    console.log('Service ID:', EMAIL_SERVICE_ID);
    console.log('Template ID:', EMAIL_TEMPLATE_ID);
    console.log('Public Key:', EMAIL_PUBLIC_KEY);

    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send email:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      text: error.text,
      name: error.name,
      stack: error.stack
    });
    
    // Return a more detailed error message
    const errorMessage = error.text || error.message || JSON.stringify(error);
    return { success: false, error: errorMessage };
  }
};

// Alternative email service using Nodemailer (for backend implementation)
export const sendEmailWithNodemailer = async (orderData) => {
  // This would be implemented on the backend
  const emailData = {
    to: orderData.customerInfo.email,
    subject: `Order Confirmation - ${orderData.orderNumber}`,
    html: generateOrderConfirmationHTML(orderData)
  };

  // Send to backend API endpoint
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      return { success: true };
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

// Generate HTML email template
const generateOrderConfirmationHTML = (orderData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #48b2ee; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .order-details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #48b2ee; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName},</h2>
          <p>Your order has been confirmed and is being processed.</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            
            <h4>Items Ordered:</h4>
            ${orderData.items.map(item => `
              <div class="item">
                <strong>${item.name}</strong><br>
                Price: PKR ${item.price}
              </div>
            `).join('')}
            
            <div style="margin-top: 20px;">
              <p>Subtotal: PKR ${orderData.subtotal.toFixed(2)}</p>
              <p>Shipping: PKR ${orderData.shipping.toFixed(2)}</p>
              ${orderData.discount > 0 ? `<p>Discount: -PKR ${orderData.discount.toFixed(2)}</p>` : ''}
              <p class="total">Total: PKR ${orderData.total.toFixed(2)}</p>
            </div>
          </div>
          
          <div class="order-details">
            <h3>Shipping Address</h3>
            <p>${orderData.customerInfo.address}<br>
            ${orderData.customerInfo.city}, ${orderData.customerInfo.state} ${orderData.customerInfo.zipCode}<br>
            Phone: ${orderData.customerInfo.countryCode} ${orderData.customerInfo.phone}</p>
          </div>
          
          <div class="order-details">
            <h3>Payment Method</h3>
            <p>${orderData.payment === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for shopping with Eyewearr!</p>
          <p>If you have any questions, please contact us at support@eyewearr.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

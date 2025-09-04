// Email service for sending order confirmations
import emailjs from '@emailjs/browser';

// EmailJS configuration
// TODO: Replace these with your actual EmailJS credentials
const EMAIL_SERVICE_ID = 'service_c8oh7k9'; // Replace with your EmailJS service ID from step 2
const EMAIL_TEMPLATE_ID = 'template_bf0ab4b'; // This should match your template ID
const EMAIL_PUBLIC_KEY = 'PA1sBHzR3bGsllCLx'; // Replace with your EmailJS public key from Account > General

// Contact form specific EmailJS configuration
const CONTACT_SERVICE_ID = 'service_c8oh7k9'; // Replace with your contact form service ID
const CONTACT_TEMPLATE_ID = 'template_6yf73tb'; // Replace with your contact form template ID

// Initialize EmailJS

emailjs.init(EMAIL_PUBLIC_KEY);

// Contact form notification service - sends to admin email
export const sendContactFormNotification = async (formData) => {
  try {
    // Validate form data
    if (!formData.email || !formData.firstName || !formData.message) {
      console.error('Missing required form data:', formData);
      return { success: false, error: 'Missing required form fields' };
    }

    const templateParams = {
      // Send notification to your personal email
      to_email: 'iamusmankhan101@gmail.com',
      email: 'iamusmankhan101@gmail.com',
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
    // Debug log to check email data
    console.log('Order data for email:', orderData);
    console.log('Customer email:', orderData.customerInfo?.email);
    
    // Ensure customer email is available
    if (!orderData.customerInfo?.email) {
      console.error('Customer email is missing from order data');
      return { success: false, error: 'Customer email is required' };
    }
    
    const templateParams = {
      // Match EmailJS template field names exactly
      email: orderData.customerInfo.email,
      order_id: orderData.orderNumber || `ORD-${Date.now()}`,
      orders: orderData.items?.map(item => 
        `${item.name} ${item.quantity ? `(QTY: ${item.quantity})` : ''}`
      ).join('\n') || 'No items',
      order_items: orderData.items?.map(item => 
        `${item.name} ${item.quantity ? `(QTY: ${item.quantity})` : ''}`
      ).join('\n') || 'No items',
      item_quantity: orderData.items?.map(item => item.quantity || 1).join(', ') || '1',
      price: orderData.items?.map(item => `Rs ${item.price}`).join('\n') || 'Rs 0',
      shipping_amount: `Rs ${(orderData.shipping || 0).toFixed(2)}`,
      total_amount: `Rs ${(orderData.total || 0).toFixed(2)}`,
      customer_name: `${orderData.customerInfo?.firstName || ''} ${orderData.customerInfo?.lastName || ''}`.trim(),
      from_email: orderData.customerInfo.email
    };
    
    console.log('Email template params:', templateParams);

    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
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

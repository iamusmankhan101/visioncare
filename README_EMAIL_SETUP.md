# Email Confirmation Setup Guide

## Overview
The order confirmation email system has been implemented using EmailJS for client-side email sending. Follow these steps to configure it properly.

## Setup Instructions

### 1. Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Create a new email service (Gmail, Outlook, etc.)

### 2. Configure Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Add your email service (Gmail recommended)
3. Note down your **Service ID**

### 3. Create Email Template
1. Go to "Email Templates" in EmailJS dashboard
2. Create a new template with ID: `order_confirmation`
3. Use these template variables:
   - `{{to_email}}` - Customer email
   - `{{customer_name}}` - Customer full name
   - `{{order_number}}` - Order number
   - `{{order_date}}` - Order date
   - `{{items}}` - Order items list
   - `{{subtotal}}` - Subtotal amount
   - `{{shipping}}` - Shipping cost
   - `{{discount}}` - Discount amount
   - `{{total}}` - Total amount
   - `{{shipping_address}}` - Full shipping address
   - `{{phone}}` - Customer phone
   - `{{payment_method}}` - Payment method

### 4. Get API Keys
1. Go to "Account" → "General"
2. Copy your **Public Key**
3. Note down your **Template ID**

### 5. Update Configuration
Edit `src/services/emailService.js` and replace:
```javascript
const EMAIL_SERVICE_ID = 'your_service_id'; // Replace with your Service ID
const EMAIL_TEMPLATE_ID = 'order_confirmation'; // Your template ID
const EMAIL_PUBLIC_KEY = 'your_public_key'; // Replace with your Public Key
```

### 6. Email Template Example
```html
Subject: Order Confirmation - {{order_number}}

Dear {{customer_name}},

Thank you for your order! Here are the details:

Order Number: {{order_number}}
Order Date: {{order_date}}

Items:
{{items}}

Subtotal: {{subtotal}}
Shipping: {{shipping}}
Discount: {{discount}}
Total: {{total}}

Shipping Address:
{{shipping_address}}
Phone: {{phone}}

Payment Method: {{payment_method}}

Thank you for shopping with Eyewearr!
```

## Features Implemented

✅ **Email Service Integration**: EmailJS client-side email sending
✅ **Order Confirmation**: Automatic email on order placement
✅ **Email Field**: Added email input to checkout form
✅ **Email Validation**: Proper email format validation
✅ **Error Handling**: Graceful handling of email failures
✅ **HTML Template**: Professional email template with order details

## Testing
1. Complete the setup above
2. Place a test order with a valid email
3. Check the email inbox for confirmation
4. Verify all order details are correct

## Troubleshooting
- Ensure EmailJS service is properly configured
- Check browser console for any errors
- Verify email template variables match the code
- Test with different email providers

## Security Notes
- EmailJS public key is safe to use in frontend
- No sensitive data is exposed
- Email sending happens through EmailJS servers

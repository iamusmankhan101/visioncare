// Simple EmailJS test function
import emailjs from '@emailjs/browser';

const EMAIL_SERVICE_ID = 'service_c8oh7k9';
const EMAIL_TEMPLATE_ID = 'template_bf0ab4b';
const EMAIL_PUBLIC_KEY = 'PA1sBHzR3bGsllCLx';

emailjs.init(EMAIL_PUBLIC_KEY);

export const testEmail = async (testEmail) => {
  try {
    console.log('Testing email with:', {
      service: EMAIL_SERVICE_ID,
      template: EMAIL_TEMPLATE_ID,
      email: testEmail
    });

    const result = await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      {
        to_email: testEmail,
        customer_name: 'Test Customer',
        order_number: 'TEST123',
        order_date: new Date().toLocaleDateString(),
        items: 'Test Glasses - PKR 1000',
        subtotal: 'PKR 1000.00',
        shipping: 'PKR 200.00',
        discount: 'None',
        total: 'PKR 1200.00',
        shipping_address: 'Test Address, Test City',
        phone: '+92 300 1234567',
        payment_method: 'Cash on Delivery'
      }
    );

    console.log('Email sent successfully:', result);
    alert('Test email sent! Check your inbox.');
    return result;
  } catch (error) {
    console.error('Email test failed:', error);
    alert(`Email test failed: ${error.message}`);
    return error;
  }
};

// Add this to window for easy testing
window.testEmail = testEmail;

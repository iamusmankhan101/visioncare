// Test script to create a sample order and verify it appears in admin panel
import { saveOrder } from './src/services/orderService.js';

const createTestOrder = async () => {
  const testOrder = {
    orderNumber: `ORD-${Date.now()}`,
    customerInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+92-300-1234567',
      address: '123 Main Street',
      city: 'Karachi',
      state: 'Sindh',
      zipCode: '75000',
      countryCode: '+92'
    },
    items: [
      {
        id: 1,
        name: 'Ray-Ban Aviator Sunglasses',
        price: 2500,
        quantity: 1,
        image: 'https://example.com/rayban.jpg'
      },
      {
        id: 2,
        name: 'Oakley Sports Glasses',
        price: 3500,
        quantity: 1,
        image: 'https://example.com/oakley.jpg'
      }
    ],
    subtotal: 6000,
    shipping: 200,
    discount: 0,
    total: 6200,
    payment: 'cod',
    notes: 'Test order created for admin panel verification'
  };

  try {
    console.log('Creating test order...');
    const savedOrder = await saveOrder(testOrder);
    console.log('Test order created successfully:', savedOrder);
    return savedOrder;
  } catch (error) {
    console.error('Error creating test order:', error);
    throw error;
  }
};

// Run the test
createTestOrder()
  .then(order => {
    console.log('✅ Test order created with ID:', order.id);
    console.log('📋 Order Number:', order.orderNumber);
    console.log('👤 Customer:', order.customerInfo.firstName, order.customerInfo.lastName);
    console.log('💰 Total:', order.total);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });
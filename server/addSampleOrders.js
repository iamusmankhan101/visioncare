const upstashService = require('./upstashService');

async function addSampleOrders() {
  console.log('🛍️ Adding sample orders to Upstash Redis...\n');

  const sampleOrders = [
    {
      orderNumber: 'ORD-001-2025',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      customerPhone: '+1-555-0123',
      total: 299.99,
      status: 'pending',
      items: [
        {
          id: 'prod_001',
          name: 'Classic Aviator Sunglasses',
          price: 149.99,
          quantity: 1,
          color: 'Black',
          size: 'Medium'
        },
        {
          id: 'prod_002',
          name: 'Blue Light Blocking Glasses',
          price: 149.99,
          quantity: 1,
          color: 'Tortoise',
          size: 'Large'
        }
      ],
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'Credit Card',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      orderNumber: 'ORD-002-2025',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@email.com',
      customerPhone: '+1-555-0456',
      total: 199.99,
      status: 'processing',
      items: [
        {
          id: 'prod_003',
          name: 'Reading Glasses',
          price: 99.99,
          quantity: 1,
          color: 'Brown',
          size: 'Small'
        },
        {
          id: 'prod_004',
          name: 'Lens Cleaning Kit',
          price: 29.99,
          quantity: 1
        }
      ],
      shippingAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      paymentMethod: 'PayPal',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      orderNumber: 'ORD-003-2025',
      customerName: 'Mike Wilson',
      customerEmail: 'mike.wilson@email.com',
      customerPhone: '+1-555-0789',
      total: 449.99,
      status: 'shipped',
      items: [
        {
          id: 'prod_005',
          name: 'Progressive Lenses',
          price: 399.99,
          quantity: 1,
          color: 'Clear',
          size: 'Medium'
        },
        {
          id: 'prod_006',
          name: 'Premium Frame',
          price: 49.99,
          quantity: 1,
          color: 'Silver',
          size: 'Medium'
        }
      ],
      shippingAddress: {
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      },
      paymentMethod: 'Credit Card',
      trackingNumber: 'TRK123456789',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      orderNumber: 'ORD-004-2025',
      customerName: 'Emily Davis',
      customerEmail: 'emily.davis@email.com',
      customerPhone: '+1-555-0321',
      total: 179.99,
      status: 'delivered',
      items: [
        {
          id: 'prod_007',
          name: 'Designer Sunglasses',
          price: 179.99,
          quantity: 1,
          color: 'Rose Gold',
          size: 'Small'
        }
      ],
      shippingAddress: {
        street: '321 Elm St',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'USA'
      },
      paymentMethod: 'Apple Pay',
      trackingNumber: 'TRK987654321',
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      orderNumber: 'ORD-005-2025',
      customerName: 'David Brown',
      customerEmail: 'david.brown@email.com',
      customerPhone: '+1-555-0654',
      total: 89.99,
      status: 'cancelled',
      items: [
        {
          id: 'prod_008',
          name: 'Basic Reading Glasses',
          price: 89.99,
          quantity: 1,
          color: 'Black',
          size: 'Large'
        }
      ],
      shippingAddress: {
        street: '654 Maple Ave',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      },
      paymentMethod: 'Credit Card',
      cancelledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      cancelReason: 'Customer requested cancellation',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    }
  ];

  try {
    console.log('📦 Adding orders to Upstash Redis...');
    
    for (const order of sampleOrders) {
      const result = await upstashService.saveOrder(order);
      if (result) {
        console.log(`✅ Added order: ${order.orderNumber} - ${order.customerName} ($${order.total})`);
      } else {
        console.log(`❌ Failed to add order: ${order.orderNumber}`);
      }
    }

    // Verify orders were added
    console.log('\n📊 Verifying orders in database...');
    const allOrders = await upstashService.getAllOrders();
    console.log(`✅ Total orders in database: ${allOrders.length}`);
    
    console.log('\n📋 Order Summary:');
    allOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderNumber} - ${order.customerName} - $${order.total} (${order.status})`);
    });

    // Test order statistics
    console.log('\n📈 Order Statistics:');
    const statusCounts = allOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`- ${status}: ${count} orders`);
    });

    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    console.log(`💰 Total Revenue: $${totalRevenue.toFixed(2)}`);

    console.log('\n🎉 Sample orders added successfully!');
    console.log('🔄 Refresh your admin panel to see the orders.');

  } catch (error) {
    console.error('❌ Error adding sample orders:', error.message);
  }
}

// Run the script
addSampleOrders().then(() => {
  console.log('\n✅ Sample orders setup completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Setup error:', error);
  process.exit(1);
});

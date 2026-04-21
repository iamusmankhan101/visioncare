// Mock Order Service for Demo
const API_BASE_URL = 'http://localhost:5005/api';

// Mock orders data
const mockOrders = [
  {
    id: 1,
    orderNumber: 'ORD-001',
    customerId: 1,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    status: 'processing',
    total: 149.99,
    subtotal: 129.99,
    tax: 10.00,
    shipping: 10.00,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T14:20:00Z',
    items: [
      {
        id: 1,
        name: 'Blue Light Blocking Glasses',
        quantity: 1,
        price: 129.99,
        color: 'Black',
        size: 'Medium'
      }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    customerId: 2,
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    status: 'delivered',
    total: 89.99,
    subtotal: 79.99,
    tax: 0.00,
    shipping: 10.00,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
    items: [
      {
        id: 2,
        name: 'Reading Glasses',
        quantity: 1,
        price: 79.99,
        color: 'Brown',
        size: 'Small'
      }
    ]
  },
  {
    id: 3,
    orderNumber: 'ORD-003',
    customerId: 1,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    status: 'pending',
    total: 199.99,
    subtotal: 179.99,
    tax: 10.00,
    shipping: 10.00,
    createdAt: '2024-01-22T14:45:00Z',
    updatedAt: '2024-01-22T14:45:00Z',
    items: [
      {
        id: 3,
        name: 'Prescription Sunglasses',
        quantity: 1,
        price: 179.99,
        color: 'Black',
        size: 'Large'
      }
    ]
  }
];

class OrderService {
  // Get all orders
  async getOrders() {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app:
      // const response = await fetch(`${API_BASE_URL}/orders`);
      // return await response.json();
      
      return mockOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Get single order
  async getOrder(orderId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In real app:
      // const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
      // return await response.json();
      
      const order = mockOrders.find(o => o.id.toString() === orderId.toString());
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Get orders for specific customer
  async getCustomerOrders(customerId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In real app:
      // const response = await fetch(`${API_BASE_URL}/customers/${customerId}/orders`);
      // return await response.json();
      
      return mockOrders.filter(order => order.customerId.toString() === customerId.toString());
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw new Error('Failed to fetch customer orders');
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In real app:
      // const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status })
      // });
      // return await response.json();
      
      const orderIndex = mockOrders.findIndex(o => o.id.toString() === orderId.toString());
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }
      
      mockOrders[orderIndex].status = status;
      mockOrders[orderIndex].updatedAt = new Date().toISOString();
      
      return mockOrders[orderIndex];
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Get order statistics
  async getOrderStats() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // In real app:
      // const response = await fetch(`${API_BASE_URL}/orders/stats`);
      // return await response.json();
      
      const stats = {
        total: mockOrders.length,
        pending: mockOrders.filter(o => o.status === 'pending').length,
        processing: mockOrders.filter(o => o.status === 'processing').length,
        shipped: mockOrders.filter(o => o.status === 'shipped').length,
        delivered: mockOrders.filter(o => o.status === 'delivered').length,
        cancelled: mockOrders.filter(o => o.status === 'cancelled').length,
        totalRevenue: mockOrders.reduce((sum, o) => sum + o.total, 0),
        averageOrderValue: mockOrders.reduce((sum, o) => sum + o.total, 0) / mockOrders.length
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw new Error('Failed to fetch order statistics');
    }
  }

  // Search orders
  async searchOrders(query) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In real app:
      // const response = await fetch(`${API_BASE_URL}/orders/search?q=${encodeURIComponent(query)}`);
      // return await response.json();
      
      const lowerQuery = query.toLowerCase();
      return mockOrders.filter(order =>
        order.orderNumber.toLowerCase().includes(lowerQuery) ||
        order.customerName.toLowerCase().includes(lowerQuery) ||
        order.customerEmail.toLowerCase().includes(lowerQuery) ||
        order.items.some(item => item.name.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('Error searching orders:', error);
      throw new Error('Failed to search orders');
    }
  }
}

export default new OrderService();

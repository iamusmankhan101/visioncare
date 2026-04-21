// Mock customer service - replace with real API calls
const API_BASE_URL = 'http://localhost:5005/api';

// Mock data
const mockCustomers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    status: 'active',
    isVip: true,
    totalOrders: 8,
    totalSpent: 599.99,
    averageOrderValue: 74.99,
    lastOrderDate: '2024-01-15T10:30:00Z',
    notes: [
      { text: 'Prefers blue light glasses', createdAt: '2024-01-10T09:00:00Z' }
    ],
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1987654321',
    status: 'active',
    isVip: false,
    totalOrders: 3,
    totalSpent: 189.99,
    averageOrderValue: 63.33,
    lastOrderDate: '2024-01-12T14:20:00Z',
    notes: [],
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    }
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+1555123456',
    status: 'inactive',
    isVip: false,
    totalOrders: 1,
    totalSpent: 89.99,
    averageOrderValue: 89.99,
    lastOrderDate: '2023-12-01T16:45:00Z',
    notes: [
      { text: 'Interested in prescription glasses', createdAt: '2023-12-01T16:50:00Z' }
    ]
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+1444555666',
    status: 'active',
    isVip: true,
    totalOrders: 12,
    totalSpent: 899.99,
    averageOrderValue: 74.99,
    lastOrderDate: '2024-01-18T11:15:00Z',
    notes: [
      { text: 'VIP customer - priority shipping', createdAt: '2024-01-01T10:00:00Z' },
      { text: 'Prefers designer frames', createdAt: '2024-01-05T14:30:00Z' }
    ]
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david@example.com',
    phone: '+1777888999',
    status: 'blocked',
    isVip: false,
    totalOrders: 2,
    totalSpent: 159.99,
    averageOrderValue: 79.99,
    lastOrderDate: '2023-11-20T09:30:00Z',
    notes: [
      { text: 'Blocked due to payment issues', createdAt: '2023-11-25T15:00:00Z' }
    ]
  }
];

class CustomerService {
  // Get all customers
  async getCustomers() {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, make API call:
      // const response = await fetch(`${API_BASE_URL}/customers`);
      // return await response.json();
      
      return mockCustomers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  // Get single customer
  async getCustomer(customerId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In real app:
      // const response = await fetch(`${API_BASE_URL}/customers/${customerId}`);
      // return await response.json();
      
      const customer = mockCustomers.find(c => c.id.toString() === customerId.toString());
      if (!customer) {
        throw new Error('Customer not found');
      }
      return customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw new Error('Failed to fetch customer');
    }
  }

  // Update customer
  async updateCustomer(customerId, updates) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In real app:
      // const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // });
      // return await response.json();
      
      const customerIndex = mockCustomers.findIndex(c => c.id.toString() === customerId.toString());
      if (customerIndex === -1) {
        throw new Error('Customer not found');
      }
      
      mockCustomers[customerIndex] = { ...mockCustomers[customerIndex], ...updates };
      return mockCustomers[customerIndex];
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new Error('Failed to update customer');
    }
  }

  // Add customer note
  async addCustomerNote(customerId, noteText) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const note = {
        text: noteText,
        createdAt: new Date().toISOString()
      };
      
      // In real app:
      // const response = await fetch(`${API_BASE_URL}/customers/${customerId}/notes`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(note)
      // });
      // return await response.json();
      
      const customerIndex = mockCustomers.findIndex(c => c.id.toString() === customerId.toString());
      if (customerIndex === -1) {
        throw new Error('Customer not found');
      }
      
      if (!mockCustomers[customerIndex].notes) {
        mockCustomers[customerIndex].notes = [];
      }
      
      mockCustomers[customerIndex].notes.push(note);
      return mockCustomers[customerIndex];
    } catch (error) {
      console.error('Error adding customer note:', error);
      throw new Error('Failed to add customer note');
    }
  }

  // Search customers
  async searchCustomers(query) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In real app:
      // const response = await fetch(`${API_BASE_URL}/customers/search?q=${encodeURIComponent(query)}`);
      // return await response.json();
      
      const lowerQuery = query.toLowerCase();
      return mockCustomers.filter(customer =>
        customer.name?.toLowerCase().includes(lowerQuery) ||
        customer.email?.toLowerCase().includes(lowerQuery) ||
        customer.phone?.includes(query)
      );
    } catch (error) {
      console.error('Error searching customers:', error);
      throw new Error('Failed to search customers');
    }
  }

  // Get customer statistics
  async getCustomerStats() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // In real app:
      // const response = await fetch(`${API_BASE_URL}/customers/stats`);
      // return await response.json();
      
      const stats = {
        total: mockCustomers.length,
        active: mockCustomers.filter(c => c.status === 'active').length,
        vip: mockCustomers.filter(c => c.isVip).length,
        blocked: mockCustomers.filter(c => c.status === 'blocked').length,
        totalRevenue: mockCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
        averageOrderValue: mockCustomers.reduce((sum, c) => sum + (c.averageOrderValue || 0), 0) / mockCustomers.length
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw new Error('Failed to fetch customer statistics');
    }
  }
}

export default new CustomerService();

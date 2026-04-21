import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { saveOrder, getAllOrders } from '../services/orderService';

const TestContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const SectionTitle = styled.h3`
  color: #555;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const OrderList = styled.div`
  margin-top: 1rem;
`;

const OrderItem = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  border-left: 4px solid #007bff;
`;

const Status = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => props.type === 'success' ? '#d4edda' : props.type === 'error' ? '#f8d7da' : '#d1ecf1'};
  color: ${props => props.type === 'success' ? '#155724' : props.type === 'error' ? '#721c24' : '#0c5460'};
  border-radius: 6px;
`;

const OrderTest = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });

  const showStatus = (message, type = 'info') => {
    setStatus({ message, type });
    setTimeout(() => setStatus({ message: '', type: '' }), 5000);
  };

  const createTestOrder = async () => {
    setLoading(true);
    try {
      const testOrderData = {
        customerInfo: {
          firstName: 'Test',
          lastName: 'Customer',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Pakistan'
        },
        items: [
          {
            id: 1,
            name: 'Test Eyewear Frame',
            price: 2999,
            quantity: 1,
            selectedColor: 'Black',
            selectedSize: 'Medium',
            selectedLensType: 'Standard'
          }
        ],
        subtotal: 2999,
        shippingCost: 200,
        taxAmount: 0,
        discountAmount: 0,
        total: 3199,
        paymentMethod: 'cash_on_delivery',
        notes: 'Cross-browser test order'
      };

      const savedOrder = await saveOrder(testOrderData);
      showStatus(`✅ Order created successfully! Order #${savedOrder.orderNumber}`, 'success');
      await fetchOrders(); // Refresh the orders list
    } catch (error) {
      showStatus(`❌ Failed to create order: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await getAllOrders();
      setOrders(fetchedOrders);
      showStatus(`📋 Fetched ${fetchedOrders.length} orders from database`, 'success');
    } catch (error) {
      showStatus(`❌ Failed to fetch orders: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <TestContainer>
      <Title>🧪 Cross-Browser Order Test</Title>
      
      <Section>
        <SectionTitle>Test Actions</SectionTitle>
        <p>Use these buttons to test order functionality across different browsers:</p>
        <Button onClick={createTestOrder} disabled={loading}>
          {loading ? '⏳ Creating...' : '➕ Create Test Order'}
        </Button>
        <Button onClick={fetchOrders} disabled={loading}>
          {loading ? '⏳ Loading...' : '🔄 Refresh Orders'}
        </Button>
      </Section>

      <Section>
        <SectionTitle>Orders ({orders.length})</SectionTitle>
        <p>Orders should appear here regardless of which browser you're using:</p>
        <OrderList>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No orders found. Create a test order to see it appear here.
            </div>
          ) : (
            orders.map((order, index) => (
              <OrderItem key={order.id || index}>
                <strong>Order #{order.orderNumber}</strong><br />
                Customer: {order.customerInfo?.firstName} {order.customerInfo?.lastName}<br />
                Total: Rs {order.total}<br />
                Status: {order.status}<br />
                Date: {new Date(order.orderDate).toLocaleString()}<br />
                {order.notes && <em>Notes: {order.notes}</em>}
              </OrderItem>
            ))
          )}
        </OrderList>
      </Section>

      <Section>
        <SectionTitle>Instructions</SectionTitle>
        <ol>
          <li>Create a test order using the button above</li>
          <li>Open this page in a different browser (Chrome, Firefox, Edge, etc.)</li>
          <li>Click "Refresh Orders" in the other browser</li>
          <li>You should see the same orders in both browsers! 🎉</li>
        </ol>
        <p><strong>Note:</strong> Orders are now stored in a backend database instead of browser-specific local storage, so they will be visible across all browsers and devices.</p>
      </Section>

      {status.message && (
        <Status type={status.type}>
          {status.message}
        </Status>
      )}
    </TestContainer>
  );
};

export default OrderTest;

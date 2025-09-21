import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import OrderManagement from './admin/OrderManagement';
import { getAllOrders } from '../services/orderService';

const DebugContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
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
`;

const ResultBox = styled.pre`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  white-space: pre-wrap;
  margin-top: 1rem;
  max-height: 300px;
  overflow-y: auto;
`;

const AdminDebug = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showOrderManagement, setShowOrderManagement] = useState(false);

  const testOrderFetch = async () => {
    setLoading(true);
    try {
      console.log('🔄 AdminDebug: Testing order fetch...');
      const orderData = await getAllOrders();
      console.log('📦 AdminDebug: Received orders:', orderData);
      setOrders(orderData);
      setResult(`✅ Successfully fetched ${Array.isArray(orderData) ? orderData.length : 'unknown'} orders:\n${JSON.stringify(orderData, null, 2)}`);
    } catch (error) {
      console.error('❌ AdminDebug: Error:', error);
      setResult(`❌ Error fetching orders:\n${error.message}\n${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5005/api/orders');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setResult(`✅ Direct API successful:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Direct API failed:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-test on load
    testOrderFetch();
  }, []);

  return (
    <DebugContainer>
      <h2>🔧 Admin Panel Debug</h2>
      <p>Debug the admin panel orders issue:</p>
      
      <Section>
        <h3>API Tests</h3>
        <Button onClick={testDirectAPI} disabled={loading}>
          {loading ? '⏳ Testing...' : '🌐 Test Direct API'}
        </Button>
        
        <Button onClick={testOrderFetch} disabled={loading}>
          {loading ? '⏳ Testing...' : '📋 Test Order Service'}
        </Button>

        <Button onClick={() => setShowOrderManagement(!showOrderManagement)}>
          {showOrderManagement ? '🙈 Hide Order Management' : '👁️ Show Order Management'}
        </Button>

        {result && <ResultBox>{result}</ResultBox>}
      </Section>

      <Section>
        <h3>Order Summary</h3>
        <p><strong>Orders found:</strong> {Array.isArray(orders) ? orders.length : 'Not an array'}</p>
        {Array.isArray(orders) && orders.length > 0 && (
          <div>
            <p><strong>First order:</strong></p>
            <ResultBox>{JSON.stringify(orders[0], null, 2)}</ResultBox>
          </div>
        )}
      </Section>

      {showOrderManagement && (
        <Section>
          <h3>Order Management Component</h3>
          <p>This is the actual OrderManagement component used in the admin panel:</p>
          <div style={{ border: '2px solid #007bff', borderRadius: '8px', padding: '1rem' }}>
            <OrderManagement />
          </div>
        </Section>
      )}
    </DebugContainer>
  );
};

export default AdminDebug;

import React, { useState } from 'react';
import styled from 'styled-components';
import { saveOrder } from '../services/orderService';

const DebugContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  max-height: 400px;
  overflow-y: auto;
`;

const OrderItemsDebug = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testOrderWithItems = async () => {
    setLoading(true);
    try {
      // Create a test order with proper items structure
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
        billingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Pakistan'
        },
        items: [
          {
            id: 1,
            name: 'Classic Aviator Sunglasses',
            price: 2999,
            quantity: 1,
            selectedColor: 'Black',
            selectedSize: 'Medium',
            selectedLensType: 'Standard',
            sku: 'AVT-001'
          },
          {
            id: 2,
            name: 'Blue Light Blocking Glasses',
            price: 3499,
            quantity: 2,
            selectedColor: 'Tortoise',
            selectedSize: 'Large',
            selectedLensType: 'Blue Light',
            sku: 'BLB-002'
          }
        ],
        subtotal: 9997, // 2999 + (3499 * 2)
        shippingCost: 200,
        taxAmount: 0,
        discountAmount: 0,
        total: 10197,
        paymentMethod: 'cash_on_delivery',
        notes: 'Test order with multiple items'
      };

      console.log('🧪 Testing order with items:', testOrderData);
      
      const savedOrder = await saveOrder(testOrderData);
      setResult(`✅ Order created successfully!\n\nOrder Details:\n${JSON.stringify(savedOrder, null, 2)}\n\nOriginal Items:\n${JSON.stringify(testOrderData.items, null, 2)}`);
    } catch (error) {
      setResult(`❌ Failed to create order:\n${error.message}\n\nStack:\n${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  const testBackendDirectly = async () => {
    setLoading(true);
    try {
      const testData = {
        order_number: `TEST-ITEMS-${Date.now()}`,
        customer_email: 'test@example.com',
        customer_name: 'Test User',
        customer_phone: '+1234567890',
        shipping_address: JSON.stringify({
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Pakistan'
        }),
        billing_address: JSON.stringify({
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Pakistan'
        }),
        subtotal: 5000,
        shipping_amount: 200,
        tax_amount: 0,
        discount_amount: 0,
        total: 5200,
        payment_method: 'cash_on_delivery',
        notes: 'Direct backend test',
        items: [
          {
            product_name: 'Test Frame 1',
            product_sku: 'TEST-001',
            quantity: 1,
            unit_price: 2500,
            total_price: 2500,
            variant_info: JSON.stringify({
              color: 'Black',
              size: 'Medium',
              lensType: 'Standard'
            })
          },
          {
            product_name: 'Test Frame 2',
            product_sku: 'TEST-002',
            quantity: 1,
            unit_price: 2500,
            total_price: 2500,
            variant_info: JSON.stringify({
              color: 'Brown',
              size: 'Large',
              lensType: 'Blue Light'
            })
          }
        ]
      };

      const response = await fetch('http://localhost:5005/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      setResult(`✅ Direct backend test successful!\n\nResponse:\n${JSON.stringify(result, null, 2)}\n\nSent Data:\n${JSON.stringify(testData, null, 2)}`);
    } catch (error) {
      setResult(`❌ Direct backend test failed:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkOrderItems = async () => {
    setLoading(true);
    try {
      // Get orders from API
      const response = await fetch('http://localhost:5005/api/orders');
      const data = await response.json();
      
      setResult(`📋 Current Orders:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Failed to fetch orders:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DebugContainer>
      <h2>🔧 Order Items Debug</h2>
      <p>Debug why orders are showing "No items":</p>
      
      <Button onClick={testOrderWithItems} disabled={loading}>
        {loading ? '⏳ Testing...' : '🧪 Test Order with Items'}
      </Button>
      
      <Button onClick={testBackendDirectly} disabled={loading}>
        {loading ? '⏳ Testing...' : '🌐 Test Backend Directly'}
      </Button>
      
      <Button onClick={checkOrderItems} disabled={loading}>
        {loading ? '⏳ Loading...' : '📋 Check Current Orders'}
      </Button>

      {result && <ResultBox>{result}</ResultBox>}
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f9ff', borderRadius: '6px' }}>
        <h3>🔍 What This Tests:</h3>
        <ul>
          <li><strong>Test Order with Items:</strong> Tests the full frontend → backend flow</li>
          <li><strong>Test Backend Directly:</strong> Tests if the backend API can save items</li>
          <li><strong>Check Current Orders:</strong> Shows current orders and their item counts</li>
        </ul>
      </div>
    </DebugContainer>
  );
};

export default OrderItemsDebug;

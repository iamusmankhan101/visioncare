import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TestContainer = styled.div`
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
`;

const ApiTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testDirectAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5005/api/orders');
      const data = await response.json();
      setResult(`Direct API Test:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Direct API Error:\n${error.message}\n${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  const testOrderService = async () => {
    setLoading(true);
    try {
      const { getAllOrders } = await import('../services/orderService');
      const orders = await getAllOrders();
      setResult(`Order Service Test:\n${JSON.stringify(orders, null, 2)}`);
    } catch (error) {
      setResult(`Order Service Error:\n${error.message}\n${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  const testOrderApiService = async () => {
    setLoading(true);
    try {
      const { getAllOrders } = await import('../services/orderApiService');
      const data = await getAllOrders();
      setResult(`Order API Service Test:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Order API Service Error:\n${error.message}\n${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TestContainer>
      <h2>🔧 API Debug Test</h2>
      <p>Test different API endpoints to debug the admin panel issue:</p>
      
      <Button onClick={testDirectAPI} disabled={loading}>
        {loading ? '⏳ Testing...' : '🌐 Test Direct API'}
      </Button>
      
      <Button onClick={testOrderApiService} disabled={loading}>
        {loading ? '⏳ Testing...' : '📡 Test Order API Service'}
      </Button>
      
      <Button onClick={testOrderService} disabled={loading}>
        {loading ? '⏳ Testing...' : '🔧 Test Order Service'}
      </Button>

      {result && <ResultBox>{result}</ResultBox>}
    </TestContainer>
  );
};

export default ApiTest;

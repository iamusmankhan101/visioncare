import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import styled from 'styled-components';

const DebugContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: white;
  border: 2px solid #3ABEF9;
  border-radius: 8px;
  padding: 1rem;
  max-width: 400px;
  z-index: 10000;
  font-size: 0.875rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DebugTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #3ABEF9;
  font-size: 1rem;
`;

const DebugItem = styled.div`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 4px;
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.status === 'success' ? '#10b981' : props.status === 'error' ? '#ef4444' : '#f59e0b'};
  margin-right: 0.5rem;
`;

const TestButton = styled.button`
  background: #3ABEF9;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin: 0.25rem 0.25rem 0.25rem 0;
  font-size: 0.75rem;
  
  &:hover {
    background: #2563eb;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #64748b;
  
  &:hover {
    color: #1a202c;
  }
`;

const ApiDebug = ({ onClose }) => {
  const dispatch = useDispatch();
  const { items: reduxProducts, status: reduxStatus, error: reduxError } = useSelector(state => state.products);
  
  const [apiStatus, setApiStatus] = useState('testing');
  const [envVars, setEnvVars] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      REACT_APP_PRODUCTS_API_URL: process.env.REACT_APP_PRODUCTS_API_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
    
    // Test API connection
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      setApiStatus('testing');
      setError(null);
      
      const apiUrl = process.env.REACT_APP_PRODUCTS_API_URL || 'http://localhost:5004/api';
      console.log('🔧 Testing API connection to:', apiUrl);
      
      const response = await fetch(`${apiUrl}/products`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setApiResponse(data);
      setApiStatus('success');
      console.log('✅ API test successful:', data.length, 'products found');
      console.log('📦 Products from API:', data.map(p => ({ id: p.id, name: p.name })));
      
    } catch (err) {
      console.error('❌ API test failed:', err);
      setError(err.message);
      setApiStatus('error');
    }
  };

  const testHealthEndpoint = async () => {
    try {
      const apiUrl = process.env.REACT_APP_PRODUCTS_API_URL || 'http://localhost:5004/api';
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      console.log('Health check:', data);
      alert(`Health check: ${data.status} - ${data.message}`);
    } catch (err) {
      console.error('Health check failed:', err);
      alert(`Health check failed: ${err.message}`);
    }
  };

  return (
    <DebugContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <DebugTitle>🔧 API Debug Panel</DebugTitle>
      
      <DebugItem>
        <strong>Environment Variables:</strong>
        <div>REACT_APP_PRODUCTS_API_URL: {envVars.REACT_APP_PRODUCTS_API_URL || '❌ Not set'}</div>
        <div>NODE_ENV: {envVars.NODE_ENV}</div>
      </DebugItem>
      
      <DebugItem>
        <strong>Redux State:</strong>
        <div>Status: {reduxStatus}</div>
        <div>Products: {reduxProducts?.length || 0}</div>
        {reduxError && <div style={{ color: '#ef4444' }}>Error: {reduxError}</div>}
      </DebugItem>
      
      <DebugItem>
        <strong>API Connection:</strong>
        <div>
          <StatusIndicator status={apiStatus} />
          {apiStatus === 'testing' && 'Testing connection...'}
          {apiStatus === 'success' && `✅ Connected - ${apiResponse?.length || 0} products`}
          {apiStatus === 'error' && `❌ Failed: ${error}`}
        </div>
      </DebugItem>
      
      {apiResponse && (
        <DebugItem>
          <strong>Sample Product:</strong>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {apiResponse[0]?.name} - PKR {apiResponse[0]?.price}
          </div>
        </DebugItem>
      )}
      
      <div>
        <TestButton onClick={testApiConnection}>
          🔄 Test API
        </TestButton>
        <TestButton onClick={testHealthEndpoint}>
          ❤️ Health Check
        </TestButton>
        <TestButton onClick={() => dispatch(fetchProducts())}>
          🔄 Refresh Redux
        </TestButton>
        <TestButton onClick={() => window.location.reload()}>
          🔄 Reload Page
        </TestButton>
      </div>
      
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
        If API URL is not set, restart React server after updating .env file
      </div>
    </DebugContainer>
  );
};

export default ApiDebug;

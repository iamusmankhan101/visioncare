import { useState } from 'react';
import styled from 'styled-components';
import { FiBell, FiCheck, FiX, FiSmartphone } from 'react-icons/fi';

const TestContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #3ABEF9 0%, #3572EF 100%);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const TestCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  color: #1e293b;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const TestTitle = styled.h1`
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 700;
`;

const TestDescription = styled.p`
  margin: 0 0 2rem 0;
  color: #64748b;
  line-height: 1.6;
`;

const TestButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &.primary {
    background: #3ABEF9;
    color: white;
    
    &:hover {
      background: #2AA8E8;
      transform: translateY(-1px);
    }
  }
  
  &.secondary {
    background: #f1f5f9;
    color: #64748b;
    
    &:hover {
      background: #e2e8f0;
    }
  }
  
  &.success {
    background: #10b981;
    color: white;
    
    &:hover {
      background: #059669;
    }
  }
  
  &.danger {
    background: #ef4444;
    color: white;
    
    &:hover {
      background: #dc2626;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatusMessage = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  
  &.success {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
  }
  
  &.error {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
  }
  
  &.info {
    background: #dbeafe;
    color: #1e40af;
    border: 1px solid #bfdbfe;
  }
`;

const MobileTestPage = () => {
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [testing, setTesting] = useState(false);

  const showStatus = (message, type = 'info') => {
    setStatus(message);
    setStatusType(type);
    setTimeout(() => {
      setStatus('');
      setStatusType('');
    }, 5000);
  };

  const testNotificationPermission = async () => {
    if (!('Notification' in window)) {
      showStatus('This browser does not support notifications', 'error');
      return;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      showStatus('Notification permission granted!', 'success');
      
      // Show a test notification
      new Notification('🧪 Test Notification', {
        body: 'Notifications are working correctly!',
        icon: '/logo192.png',
        tag: 'test'
      });
    } else {
      showStatus('Notification permission denied', 'error');
    }
  };

  const testServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      showStatus('Service Worker not supported', 'error');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      showStatus('Service Worker registered successfully!', 'success');
      console.log('SW registered:', registration);
    } catch (error) {
      showStatus(`Service Worker registration failed: ${error.message}`, 'error');
      console.error('SW registration failed:', error);
    }
  };

  const testPushNotificationServer = async () => {
    setTesting(true);
    
    try {
      const response = await fetch('http://localhost:5004/api/health');
      
      if (response.ok) {
        const data = await response.json();
        showStatus(`Push server is running! Subscriptions: ${data.subscriptions}`, 'success');
      } else {
        showStatus('Push server is not responding', 'error');
      }
    } catch (error) {
      showStatus('Cannot connect to push server. Make sure it\'s running on port 5004.', 'error');
    } finally {
      setTesting(false);
    }
  };

  const testPushNotification = async () => {
    setTesting(true);
    
    try {
      const response = await fetch('http://localhost:5004/api/admin/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        showStatus(`${data.message || 'Test notification sent!'}`, 'success');
        console.log('Test notification response:', data);
      } else {
        const errorData = await response.text();
        showStatus(`Failed to send test notification: ${response.status}`, 'error');
        console.error('Test notification error:', errorData);
      }
    } catch (error) {
      showStatus(`Error sending test notification: ${error.message}`, 'error');
      console.error('Test notification error:', error);
    } finally {
      setTesting(false);
    }
  };

  const installPWA = () => {
    showStatus('To install: Tap browser menu → "Add to Home Screen" or "Install App"', 'info');
  };

  return (
    <TestContainer>
      <TestCard>
        <FiSmartphone size={48} style={{ color: '#3ABEF9', marginBottom: '1rem' }} />
        <TestTitle>Mobile App Test Center</TestTitle>
        <TestDescription>
          Test all the mobile app features before using the full admin interface.
        </TestDescription>

        {status && (
          <StatusMessage className={statusType}>
            {status}
          </StatusMessage>
        )}

        <TestButton 
          className="primary" 
          onClick={testNotificationPermission}
        >
          <FiBell />
          Test Notification Permission
        </TestButton>

        <TestButton 
          className="secondary" 
          onClick={testServiceWorker}
        >
          <FiCheck />
          Test Service Worker
        </TestButton>

        <TestButton 
          className="secondary" 
          onClick={testPushNotificationServer}
          disabled={testing}
        >
          <FiCheck />
          {testing ? 'Testing...' : 'Test Push Server'}
        </TestButton>

        <TestButton 
          className="success" 
          onClick={testPushNotification}
          disabled={testing}
        >
          <FiBell />
          {testing ? 'Sending...' : 'Send Test Notification'}
        </TestButton>

        <TestButton 
          className="secondary" 
          onClick={installPWA}
        >
          <FiSmartphone />
          Install as App
        </TestButton>

        <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#64748b' }}>
          <p><strong>Next Steps:</strong></p>
          <p>1. Test all features above</p>
          <p>2. Install the app on your home screen</p>
          <p>3. Go to <strong>/admin/mobile</strong> for the full app</p>
        </div>
      </TestCard>
    </TestContainer>
  );
};

export default MobileTestPage;
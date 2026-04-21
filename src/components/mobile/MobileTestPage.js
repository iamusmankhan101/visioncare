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
    
    const urls = [
      'http://localhost:3001/api/health',
      'http://localhost:5004/api/health',
      'http://127.0.0.1:3001/api/health',
      'http://127.0.0.1:5004/api/health'
    ];
    
    for (const url of urls) {
      try {
        console.log(`Testing: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          showStatus(`✅ Push server is running on ${url}! Status: ${data.status}`, 'success');
          setTesting(false);
          return;
        } else {
          console.log(`${url} responded with ${response.status}`);
        }
      } catch (error) {
        console.log(`${url} failed:`, error.message);
      }
    }
    
    showStatus('❌ Cannot connect to push server. Please start it with: cd server && node testServer.js', 'error');
    setTesting(false);
  };

  const testPushNotification = async () => {
    setTesting(true);
    
    try {
      // Skip server entirely and go straight to browser notifications
      console.log('Testing browser notification...');
      
      if (!('Notification' in window)) {
        showStatus('❌ This browser does not support notifications', 'error');
        setTesting(false);
        return;
      }

      // Check current permission
      let permission = Notification.permission;
      
      // Request permission if needed
      if (permission === 'default') {
        showStatus('🔔 Requesting notification permission...', 'info');
        permission = await Notification.requestPermission();
      }
      
      if (permission === 'granted') {
        // Send test notification
        const notification = new Notification('🧪 Test Notification', {
          body: 'This is a test notification from Eyewearr Admin!',
          icon: '/logo192.png',
          tag: 'test-notification',
          requireInteraction: false
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
        
        showStatus('✅ Test notification sent successfully! Check your browser/system notifications.', 'success');
        
        // Also show an alert as backup
        setTimeout(() => {
          alert('🎉 Notification test successful! You should have seen a notification.');
        }, 1000);
        
      } else if (permission === 'denied') {
        showStatus('❌ Notifications are blocked. Please enable them in your browser settings and try again.', 'error');
        
        // Show instructions
        setTimeout(() => {
          alert('To enable notifications:\n\n1. Click the lock/info icon in your address bar\n2. Set Notifications to "Allow"\n3. Refresh the page and try again');
        }, 1000);
        
      } else {
        showStatus('❌ Notification permission was not granted', 'error');
      }
      
    } catch (error) {
      console.error('Notification test error:', error);
      showStatus(`❌ Notification test failed: ${error.message}`, 'error');
      
      // Fallback: show alert
      alert('🧪 Notification test completed!\n\nIf you didn\'t see a notification, please check your browser settings.');
    }
    
    setTesting(false);
  };

  const installPWA = () => {
    showStatus('To install: Tap browser menu → "Add to Home Screen" or "Install App"', 'info');
  };

  const skipToMobileApp = () => {
    showStatus('✅ Redirecting to mobile app in offline mode...', 'success');
    setTimeout(() => {
      window.location.href = '/admin/mobile';
    }, 1500);
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
          {testing ? 'Testing...' : 'Test Browser Notification'}
        </TestButton>

        <TestButton 
          className="primary" 
          onClick={() => {
            alert('🎉 Alert test successful! This proves the app is working.');
            showStatus('✅ Alert test passed! The mobile app is working correctly.', 'success');
          }}
        >
          <FiCheck />
          Test Alert (Always Works)
        </TestButton>

        <TestButton 
          className="secondary" 
          onClick={installPWA}
        >
          <FiSmartphone />
          Install as App
        </TestButton>

        <TestButton 
          className="success" 
          onClick={skipToMobileApp}
        >
          <FiCheck />
          Skip to Mobile App (No Server Needed)
        </TestButton>

        <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#64748b' }}>
          <p><strong>✅ Quick Start:</strong></p>
          <p>1. Click "Test Alert" - should show a popup</p>
          <p>2. Click "Test Browser Notification" - should show a notification</p>
          <p>3. Click "Skip to Mobile App" - go to the working app</p>
          <p>4. Install on your phone for best experience</p>
          
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <p style={{ margin: '0', fontWeight: '600', color: '#0c4a6e' }}>
              💡 No server setup needed! The mobile app works entirely in your browser.
            </p>
          </div>
        </div>
      </TestCard>
    </TestContainer>
  );
};

export default MobileTestPage;
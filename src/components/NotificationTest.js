import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TestContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const SectionTitle = styled.h3`
  color: #555;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: ${props => props.variant === 'danger' ? '#dc3545' : '#48b2ee'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  margin: 0.5rem 0.5rem 0.5rem 0;
  
  &:hover {
    background: ${props => props.variant === 'danger' ? '#c82333' : '#3a9bd9'};
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Status = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 6px;
  background: ${props => props.type === 'success' ? '#d4edda' : props.type === 'error' ? '#f8d7da' : '#d1ecf1'};
  color: ${props => props.type === 'success' ? '#155724' : props.type === 'error' ? '#721c24' : '#0c5460'};
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : props.type === 'error' ? '#f5c6cb' : '#bee5eb'};
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const StatusCard = styled.div`
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #f8f9fa;
`;

const NotificationTest = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    checkServerStatus();
    checkNotificationStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:5002/health');
      const data = await response.json();
      setServerStatus(data);
    } catch (error) {
      setServerStatus({ error: 'Notification server not running on port 5002' });
    }
  };

  const checkNotificationStatus = () => {
    if (window.notificationInit) {
      const status = window.notificationInit.getStatus();
      setStatus(status);
    } else {
      setStatus({ error: 'Notification services not loaded' });
    }
  };

  const requestPermissions = async () => {
    setLoading(true);
    try {
      if (window.notificationInit) {
        const results = await window.notificationInit.requestPermissions();
        setStatus({ ...status, permissions: results });
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    } finally {
      setLoading(false);
      checkNotificationStatus();
    }
  };

  const sendTestNotification = async () => {
    setLoading(true);
    try {
      if (window.testNotifications) {
        await window.testNotifications();
        alert('Test notifications sent! Check your device.');
      } else {
        alert('Notification services not available');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Failed to send test notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendTestOrder = async () => {
    setLoading(true);
    try {
      if (window.testOrderNotification) {
        await window.testOrderNotification();
        alert('Test order notification sent! Check your device.');
      } else {
        alert('Notification services not available');
      }
    } catch (error) {
      console.error('Error sending test order:', error);
      alert('Failed to send test order notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testServerNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5002/api/admin/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Server test notification sent! Check your device.');
      } else {
        alert('Server test failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error testing server notification:', error);
      alert('Failed to test server notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TestContainer>
      <Title>📱 Push Notification Test Center</Title>
      
      <Section>
        <SectionTitle>🔧 Server Status</SectionTitle>
        {serverStatus ? (
          <StatusCard>
            {serverStatus.error ? (
              <Status type="error">
                <strong>❌ Server Error:</strong> {serverStatus.error}
                <br />
                <small>Make sure to run: <code>npm run dev:notifications</code> in the server directory</small>
              </Status>
            ) : (
              <Status type="success">
                <strong>✅ Notification Server Running:</strong> {serverStatus.service}
                <br />
                <strong>Active Tokens:</strong> {serverStatus.activeTokens}
                <br />
                <strong>Timestamp:</strong> {new Date(serverStatus.timestamp).toLocaleTimeString()}
              </Status>
            )}
          </StatusCard>
        ) : (
          <Status type="info">Checking server status...</Status>
        )}
        
        <Button onClick={checkServerStatus} disabled={loading}>
          🔄 Refresh Server Status
        </Button>
      </Section>

      <Section>
        <SectionTitle>📱 Notification Services Status</SectionTitle>
        {status ? (
          <StatusGrid>
            <StatusCard>
              <h4>📤 Push Notifications</h4>
              <p><strong>Initialized:</strong> {status.initialized ? '✅' : '❌'}</p>
              <p><strong>Has Token:</strong> {status.services?.mobilePush?.hasToken ? '✅' : '❌'}</p>
              <p><strong>Supported:</strong> {status.services?.mobilePush?.isSupported ? '✅' : '❌'}</p>
              {status.error && <p><strong>Error:</strong> {status.error}</p>}
            </StatusCard>
          </StatusGrid>
        ) : (
          <Status type="info">Loading notification status...</Status>
        )}
        
        <Button onClick={checkNotificationStatus} disabled={loading}>
          🔄 Refresh Status
        </Button>
        
        <Button onClick={requestPermissions} disabled={loading}>
          🔐 Request Permissions
        </Button>
      </Section>

      <Section>
        <SectionTitle>🧪 Test Notifications</SectionTitle>
        <p>Test different types of notifications to ensure they're working properly:</p>
        
        <Button onClick={sendTestNotification} disabled={loading}>
          🔔 Test Local Notifications
        </Button>
        
        <Button onClick={testServerNotification} disabled={loading}>
          📤 Test Server Push Notifications
        </Button>
        
        <Button onClick={sendTestOrder} disabled={loading}>
          🛍️ Test Order Notification
        </Button>
      </Section>

      <Section>
        <SectionTitle>📋 Instructions</SectionTitle>
        <Status type="info">
          <strong>To test push notifications:</strong>
          <ol>
            <li>Make sure the server is running (green status above)</li>
            <li>Grant notification permissions when prompted</li>
            <li>Test local notifications first</li>
            <li>Test server push notifications</li>
            <li>Try the order notification test</li>
            <li>Check your mobile device for notifications</li>
          </ol>
          
          <strong>Server Commands:</strong>
          <br />
          <code>cd server && npm run dev:notifications</code> - Start notification server
          <br />
          <strong>Firebase Setup:</strong>
          <br />
          1. Get VAPID key from Firebase Console → Project Settings → Cloud Messaging
          <br />
          2. Replace VAPID key in src/config/firebase.js
          <br />
          3. Download service account key and place in server/firebase-service-account-key.json
        </Status>
      </Section>
    </TestContainer>
  );
};

export default NotificationTest;

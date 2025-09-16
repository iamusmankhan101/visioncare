import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import notificationService from '../../services/notificationService';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
  font-size: 1.8rem;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => props.active ? '#d4edda' : '#f8d7da'};
  color: ${props => props.active ? '#155724' : '#721c24'};
  font-weight: 500;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.active ? '#28a745' : '#dc3545'};
`;

const ControlPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ControlCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const CardTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' ? '#007bff' : props.variant === 'success' ? '#28a745' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const NotificationList = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const NotificationItem = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const NotificationTime = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const NotificationBadge = styled.span`
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const AdminNotificationDashboard = () => {
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    initializeNotifications();
    loadRecentNotifications();
    loadStats();
  }, []);

  const initializeNotifications = async () => {
    const success = await notificationService.initialize();
    setIsNotificationEnabled(success);
  };

  const loadRecentNotifications = () => {
    // Mock data - replace with actual API call
    const mockNotifications = [
      {
        id: 1,
        title: 'New Order #1234',
        message: 'John Doe placed an order for Ray-Ban Aviators',
        time: new Date().toLocaleTimeString(),
        type: 'order'
      },
      {
        id: 2,
        title: 'Payment Received',
        message: 'Payment of $299.99 received for Order #1233',
        time: new Date(Date.now() - 300000).toLocaleTimeString(),
        type: 'payment'
      }
    ];
    setRecentNotifications(mockNotifications);
  };

  const loadStats = () => {
    // Mock data - replace with actual API call
    setStats({
      todayOrders: 12,
      pendingOrders: 5,
      totalRevenue: 2499.99
    });
  };

  const handleTestNotification = async () => {
    await notificationService.sendTestNotification();
  };

  const handleEnableNotifications = async () => {
    console.log('🔔 Enable Notifications button clicked');
    
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('Is mobile device:', isMobile);
    
    // Check current permission status
    const currentPermission = Notification.permission;
    console.log('Current notification permission:', currentPermission);
    
    if (currentPermission === 'denied') {
      const mobileInstructions = isMobile ? `
📱 MOBILE SETUP REQUIRED:

For Android Chrome:
1. Tap the ⋮ menu → "Add to Home screen"
2. Install the app
3. Open the installed app (not browser)
4. Try "Enable Notifications" again
5. Allow permissions when prompted

For iPhone Safari:
1. Tap Share button → "Add to Home Screen"
2. Install the app
3. Open the installed app
4. Try "Enable Notifications" again

Note: Mobile browsers often block notifications, but PWA apps allow them.` : `
🚫 Notifications are blocked in your browser.

To fix this:
1. Click the 🔒 lock icon in your address bar
2. Change Notifications to "Allow"
3. Refresh the page and try again

Or go to browser Settings → Site Settings → Notifications and allow localhost:3000`;

      alert(mobileInstructions);
      return;
    }
    
    try {
      const success = await notificationService.initialize();
      console.log('Notification initialization result:', success);
      setIsNotificationEnabled(success);
      
      if (success) {
        alert('✅ Notifications enabled successfully! You will now receive instant order alerts.');
      } else {
        const errorMsg = isMobile ? 
          '❌ Mobile notifications require PWA installation. Please install this app to your home screen first.' :
          '❌ Failed to enable notifications. Check console for details.';
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error in handleEnableNotifications:', error);
      alert('❌ Error enabling notifications: ' + error.message);
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>Admin Notification Dashboard</Title>
        <StatusIndicator active={isNotificationEnabled}>
          <StatusDot active={isNotificationEnabled} />
          {isNotificationEnabled ? 'Notifications Active' : 'Notifications Disabled'}
        </StatusIndicator>
      </Header>

      <ControlPanel>
        <ControlCard>
          <CardTitle>Notification Settings</CardTitle>
          <Button 
            variant="primary" 
            onClick={handleEnableNotifications}
            disabled={isNotificationEnabled}
          >
            {isNotificationEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
          </Button>
          <Button 
            variant="success" 
            onClick={handleTestNotification}
            disabled={!isNotificationEnabled}
          >
            Send Test Notification
          </Button>
        </ControlCard>

        <ControlCard>
          <CardTitle>Today's Stats</CardTitle>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div>New Orders: <strong>{stats.todayOrders}</strong></div>
            <div>Pending Orders: <strong>{stats.pendingOrders}</strong></div>
            <div>Revenue: <strong>${stats.totalRevenue}</strong></div>
          </div>
        </ControlCard>

        <ControlCard>
          <CardTitle>Quick Actions</CardTitle>
          <Button variant="primary" onClick={() => window.location.href = '/admin/orders'}>
            View All Orders
          </Button>
          <Button onClick={() => window.location.href = '/admin/products'}>
            Manage Products
          </Button>
        </ControlCard>
      </ControlPanel>

      <NotificationList>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
          <h3 style={{ margin: 0, color: '#333' }}>Recent Notifications</h3>
        </div>
        {recentNotifications.length > 0 ? (
          recentNotifications.map(notification => (
            <NotificationItem key={notification.id}>
              <NotificationContent>
                <NotificationTitle>{notification.title}</NotificationTitle>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                  {notification.message}
                </div>
                <NotificationTime>{notification.time}</NotificationTime>
              </NotificationContent>
              <NotificationBadge>{notification.type}</NotificationBadge>
            </NotificationItem>
          ))
        ) : (
          <NotificationItem>
            <NotificationContent>
              <NotificationTitle>No recent notifications</NotificationTitle>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                Notifications will appear here when orders are placed
              </div>
            </NotificationContent>
          </NotificationItem>
        )}
      </NotificationList>
    </DashboardContainer>
  );
};

export default AdminNotificationDashboard;

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiBell, FiPackage, FiTrendingUp, FiUsers, FiSettings, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import { getAllOrders, getOrderStats } from '../../services/orderService';

const MobileContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #3ABEF9 0%, #3572EF 100%);
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
`;

const NotificationButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color || '#3ABEF9'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const RecentOrders = styled.div`
  background: rgba(255, 255, 255, 0.95);
  margin: 1rem;
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 600;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const CustomerName = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

const OrderAmount = styled.div`
  font-weight: 600;
  color: #059669;
  font-size: 1.125rem;
`;

const StatusBadge = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  margin-top: 0.5rem;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return 'background: #fef3c7; color: #92400e;';
      case 'processing':
        return 'background: #dbeafe; color: #1e40af;';
      case 'shipped':
        return 'background: #d1fae5; color: #065f46;';
      case 'delivered':
        return 'background: #dcfce7; color: #166534;';
      case 'cancelled':
        return 'background: #fee2e2; color: #991b1b;';
      default:
        return 'background: #f3f4f6; color: #374151;';
    }
  }}
`;

const RefreshButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #3ABEF9;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(58, 190, 249, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(58, 190, 249, 0.5);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 24px;
    height: 24px;
    animation: ${props => props.spinning ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const NotificationPanel = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const NotificationContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const NotificationTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #1e293b;
`;

const NotificationMessage = styled.p`
  margin: 0 0 2rem 0;
  color: #64748b;
  line-height: 1.5;
`;

const NotificationButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const NotificationButton2 = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #3ABEF9;
    color: white;
    
    &:hover {
      background: #2AA8E8;
    }
  }
  
  &.secondary {
    background: #f1f5f9;
    color: #64748b;
    
    &:hover {
      background: #e2e8f0;
    }
  }
`;

const MobileAdminApp = () => {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showNotificationSetup, setShowNotificationSetup] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    loadData();
    checkNotificationPermission();
    setupServiceWorker();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData] = await Promise.all([
        getOrderStats(),
        getAllOrders()
      ]);
      
      setStats(statsData);
      setRecentOrders(ordersData.slice(0, 5)); // Show last 5 orders
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        setShowNotificationSetup(true);
      }
    }
  };

  const setupServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Request notification permission and subscribe to push notifications
        if (Notification.permission === 'granted') {
          await subscribeToPushNotifications(registration);
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const subscribeToPushNotifications = async (registration) => {
    try {
      // Try to get VAPID public key from server
      const vapidResponse = await fetch('http://localhost:5004/api/vapid-public-key');
      const { publicKey } = await vapidResponse.json();
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });
      
      // Send subscription to push notification server
      await fetch('http://localhost:5004/api/admin/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
      
      console.log('Push notification subscription successful');
    } catch (error) {
      console.warn('Push notification server not available, using offline mode:', error.message);
      
      // Fallback: Use browser notifications instead
      if ('Notification' in window && Notification.permission === 'granted') {
        console.log('Using browser notifications as fallback');
        
        // Simulate a test notification
        setTimeout(() => {
          new Notification('📱 Mobile App Ready', {
            body: 'Your mobile admin app is working in offline mode!',
            icon: '/logo192.png',
            tag: 'app-ready'
          });
        }, 2000);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      setShowNotificationSetup(false);
      
      if (permission === 'granted') {
        // Setup service worker and push notifications
        await setupServiceWorker();
      }
    }
  };

  const formatCurrency = (amount) => {
    return `PKR ${amount?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <MobileContainer>
        <Header>
          <Logo>Eyewearr Admin</Logo>
        </Header>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          color: 'white',
          fontSize: '1.125rem'
        }}>
          Loading...
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <Header>
        <Logo>Eyewearr Admin</Logo>
        <NotificationButton onClick={() => setShowNotificationSetup(true)}>
          <FiBell />
          {unreadNotifications > 0 && (
            <NotificationBadge>{unreadNotifications}</NotificationBadge>
          )}
        </NotificationButton>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="#3ABEF9">
            <FiPackage />
          </StatIcon>
          <StatValue>{stats.total || 0}</StatValue>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon color="#10b981">
            <FiTrendingUp />
          </StatIcon>
          <StatValue>{formatCurrency(stats.totalRevenue)}</StatValue>
          <StatLabel>Revenue</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon color="#f59e0b">
            <FiUsers />
          </StatIcon>
          <StatValue>{stats.pending || 0}</StatValue>
          <StatLabel>Pending</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon color="#8b5cf6">
            <FiCheck />
          </StatIcon>
          <StatValue>{stats.delivered || 0}</StatValue>
          <StatLabel>Delivered</StatLabel>
        </StatCard>
      </StatsGrid>

      <RecentOrders>
        <SectionTitle>Recent Orders</SectionTitle>
        {recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
            No orders yet
          </div>
        ) : (
          recentOrders.map(order => (
            <OrderItem key={order.id}>
              <OrderInfo>
                <OrderNumber>#{order.orderNumber}</OrderNumber>
                <CustomerName>
                  {order.customerInfo.firstName} {order.customerInfo.lastName}
                </CustomerName>
                <StatusBadge status={order.status}>
                  {order.status}
                </StatusBadge>
              </OrderInfo>
              <div style={{ textAlign: 'right' }}>
                <OrderAmount>{formatCurrency(order.total)}</OrderAmount>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {formatDate(order.orderDate)}
                </div>
              </div>
            </OrderItem>
          ))
        )}
      </RecentOrders>

      <RefreshButton onClick={handleRefresh} spinning={refreshing}>
        <FiRefreshCw />
      </RefreshButton>

      {/* Notification Setup Modal */}
      <NotificationPanel show={showNotificationSetup}>
        <NotificationContent>
          <NotificationTitle>
            {notificationPermission === 'default' ? 'Enable Notifications' : 'Notification Settings'}
          </NotificationTitle>
          <NotificationMessage>
            {notificationPermission === 'default' 
              ? 'Get instant notifications when new orders are placed. This helps you respond to customers faster.'
              : notificationPermission === 'granted'
              ? 'Notifications are enabled! You\'ll receive alerts for new orders.'
              : 'Notifications are blocked. Please enable them in your browser settings to receive order alerts.'
            }
          </NotificationMessage>
          <NotificationButtons>
            {notificationPermission === 'default' && (
              <>
                <NotificationButton2 
                  className="primary" 
                  onClick={requestNotificationPermission}
                >
                  Enable Notifications
                </NotificationButton2>
                <NotificationButton2 
                  className="secondary" 
                  onClick={() => setShowNotificationSetup(false)}
                >
                  Maybe Later
                </NotificationButton2>
              </>
            )}
            {notificationPermission !== 'default' && (
              <NotificationButton2 
                className="primary" 
                onClick={() => setShowNotificationSetup(false)}
              >
                Close
              </NotificationButton2>
            )}
          </NotificationButtons>
        </NotificationContent>
      </NotificationPanel>
    </MobileContainer>
  );
};

export default MobileAdminApp;
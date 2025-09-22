import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiHome, FiPackage, FiUsers, FiBarChart3, FiSettings, FiMenu, FiX, 
  FiBell, FiTrendingUp, FiDollarSign, FiShoppingCart, FiEye,
  FiCheck, FiClock, FiTruck, FiAlertCircle, FiRefreshCw
} from 'react-icons/fi';

// Mobile-first responsive design
const MobileContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  
  img {
    width: 32px;
    height: 32px;
    filter: invert(1);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  border: 2px solid white;
`;

// Navigation
const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 0.75rem;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 100;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.button`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${props => props.active ? '#667eea' : '#64748b'};
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  span {
    font-size: 0.7rem;
    font-weight: 500;
  }
`;

// Main Content
const MainContent = styled.main`
  padding: 1rem;
  padding-bottom: 6rem; /* Space for bottom nav */
  
  @media (min-width: 768px) {
    padding-bottom: 2rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: ${props => props.color || '#667eea'};
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
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const StatTrend = styled.div`
  font-size: 0.75rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: ${props => props.positive ? '#059669' : '#dc2626'};
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

// Cards and Sections
const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Order Items
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
  margin-bottom: 0.25rem;
`;

const OrderTime = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
`;

const OrderAmount = styled.div`
  font-weight: 600;
  color: #059669;
  font-size: 1.125rem;
  text-align: right;
`;

const StatusBadge = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  margin-top: 0.5rem;
  display: inline-block;
  
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

// Quick Actions
const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: none;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    width: 24px;
    height: 24px;
    color: #667eea;
  }
  
  span {
    font-weight: 500;
    color: #1e293b;
    font-size: 0.875rem;
  }
`;

// Floating Action Button
const FAB = styled.button`
  position: fixed;
  bottom: 6rem;
  right: 1rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #667eea;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 50;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
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
  
  @media (min-width: 768px) {
    bottom: 2rem;
  }
`;

const MobileAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalOrders: 156,
    totalRevenue: 45230,
    pendingOrders: 12,
    deliveredOrders: 134,
    todayOrders: 8,
    todayRevenue: 2340
  });
  const [recentOrders, setRecentOrders] = useState([
    {
      id: 1,
      orderNumber: 'ORD-001',
      customer: 'John Doe',
      amount: 299.99,
      status: 'pending',
      time: '2 hours ago'
    },
    {
      id: 2,
      orderNumber: 'ORD-002',
      customer: 'Jane Smith',
      amount: 199.99,
      status: 'processing',
      time: '4 hours ago'
    },
    {
      id: 3,
      orderNumber: 'ORD-003',
      customer: 'Mike Johnson',
      amount: 399.99,
      status: 'shipped',
      time: '6 hours ago'
    }
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications] = useState(3);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderDashboard = () => (
    <>
      <StatsGrid>
        <StatCard>
          <StatIcon color="#667eea">
            <FiShoppingCart />
          </StatIcon>
          <StatValue>{stats.totalOrders}</StatValue>
          <StatLabel>Total Orders</StatLabel>
          <StatTrend positive>
            <FiTrendingUp />
            +12%
          </StatTrend>
        </StatCard>

        <StatCard>
          <StatIcon color="#10b981">
            <FiDollarSign />
          </StatIcon>
          <StatValue>{formatCurrency(stats.totalRevenue)}</StatValue>
          <StatLabel>Revenue</StatLabel>
          <StatTrend positive>
            <FiTrendingUp />
            +8%
          </StatTrend>
        </StatCard>

        <StatCard>
          <StatIcon color="#f59e0b">
            <FiClock />
          </StatIcon>
          <StatValue>{stats.pendingOrders}</StatValue>
          <StatLabel>Pending</StatLabel>
          <StatTrend>
            <FiAlertCircle />
            Urgent
          </StatTrend>
        </StatCard>

        <StatCard>
          <StatIcon color="#8b5cf6">
            <FiCheck />
          </StatIcon>
          <StatValue>{stats.deliveredOrders}</StatValue>
          <StatLabel>Delivered</StatLabel>
          <StatTrend positive>
            <FiTrendingUp />
            +15%
          </StatTrend>
        </StatCard>
      </StatsGrid>

      <QuickActions>
        <ActionButton onClick={() => setActiveTab('orders')}>
          <FiPackage />
          <span>View Orders</span>
        </ActionButton>
        <ActionButton onClick={() => setActiveTab('customers')}>
          <FiUsers />
          <span>Customers</span>
        </ActionButton>
        <ActionButton onClick={() => setActiveTab('analytics')}>
          <FiBarChart3 />
          <span>Analytics</span>
        </ActionButton>
        <ActionButton onClick={() => setActiveTab('settings')}>
          <FiSettings />
          <span>Settings</span>
        </ActionButton>
      </QuickActions>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <ViewAllButton onClick={() => setActiveTab('orders')}>
            View All
          </ViewAllButton>
        </CardHeader>
        
        {recentOrders.map(order => (
          <OrderItem key={order.id}>
            <OrderInfo>
              <OrderNumber>#{order.orderNumber}</OrderNumber>
              <CustomerName>{order.customer}</CustomerName>
              <OrderTime>{order.time}</OrderTime>
              <StatusBadge status={order.status}>
                {order.status}
              </StatusBadge>
            </OrderInfo>
            <OrderAmount>
              {formatCurrency(order.amount)}
            </OrderAmount>
          </OrderItem>
        ))}
      </Card>
    </>
  );

  const renderOrders = () => (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
        <ViewAllButton>Filter</ViewAllButton>
      </CardHeader>
      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
        Orders management interface coming soon...
      </div>
    </Card>
  );

  const renderCustomers = () => (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <ViewAllButton>Search</ViewAllButton>
      </CardHeader>
      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
        Customer management interface coming soon...
      </div>
    </Card>
  );

  const renderAnalytics = () => (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <ViewAllButton>Export</ViewAllButton>
      </CardHeader>
      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
        Analytics dashboard coming soon...
      </div>
    </Card>
  );

  const renderSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
        Settings panel coming soon...
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'orders':
        return renderOrders();
      case 'customers':
        return renderCustomers();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <MobileContainer>
      <Header>
        <Logo>
          <img src="/images/logo2.png" alt="Eyewearr" />
          Eyewearr Admin
        </Logo>
        <HeaderActions>
          <IconButton>
            <FiBell />
            {notifications > 0 && (
              <NotificationBadge>{notifications}</NotificationBadge>
            )}
          </IconButton>
        </HeaderActions>
      </Header>

      <MainContent>
        {renderContent()}
      </MainContent>

      <BottomNav>
        <NavItem 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
        >
          <FiHome />
          <span>Dashboard</span>
        </NavItem>
        <NavItem 
          active={activeTab === 'orders'} 
          onClick={() => setActiveTab('orders')}
        >
          <FiPackage />
          <span>Orders</span>
        </NavItem>
        <NavItem 
          active={activeTab === 'customers'} 
          onClick={() => setActiveTab('customers')}
        >
          <FiUsers />
          <span>Customers</span>
        </NavItem>
        <NavItem 
          active={activeTab === 'analytics'} 
          onClick={() => setActiveTab('analytics')}
        >
          <FiBarChart3 />
          <span>Analytics</span>
        </NavItem>
        <NavItem 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings />
          <span>Settings</span>
        </NavItem>
      </BottomNav>

      <FAB onClick={handleRefresh} spinning={refreshing}>
        <FiRefreshCw />
      </FAB>
    </MobileContainer>
  );
};

export default MobileAdminDashboard;

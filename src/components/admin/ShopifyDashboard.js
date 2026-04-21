import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FiHome, FiUsers, FiShoppingCart, FiDollarSign, FiTrendingUp, FiPackage, FiSettings, FiPlus } from 'react-icons/fi';
import { fetchOrders } from '../../redux/slices/orderSlice';
import { fetchVendors } from '../../redux/slices/vendorSlice';
import StoreBuilder from './StoreBuilder';
import VendorManagement from './VendorManagement';
import OrderManagement from './OrderManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import InventoryManagement from './InventoryManagement';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
`;

const Sidebar = styled.div`
  width: 280px;
  background: #fff;
  border-right: 1px solid #e9ecef;
  padding: 2rem 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  padding: 0 2rem 2rem;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 2rem;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavItem = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  background: ${props => props.active ? '#007bff' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#6c757d'};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;

  &:hover {
    background: ${props => props.active ? '#007bff' : '#f8f9fa'};
    color: ${props => props.active ? '#fff' : '#495057'};
  }
`;

const MainContent = styled.div`
  margin-left: 280px;
  flex: 1;
  padding: 2rem;
`;

const Header = styled.div`
  background: #fff;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  display: flex;
  justify-content: between;
  align-items: center;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 1.75rem;
  font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: ${props => props.color || '#007bff'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.25rem;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
`;

const CreateStoreButton = styled.button`
  background: #28a745;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: #218838;
  }
`;

const ShopifyDashboard = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  const [showStoreBuilder, setShowStoreBuilder] = useState(false);
  
  const { orders, orderStats } = useSelector(state => state.order);
  const { vendors, vendorStats } = useSelector(state => state.vendor);
  const { stores, analytics } = useSelector(state => state.store);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchVendors());
  }, [dispatch]);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'stores', label: 'Store Builder', icon: FiHome },
    { id: 'orders', label: 'Orders', icon: FiShoppingCart },
    { id: 'vendors', label: 'Vendors', icon: FiUsers },
    { id: 'products', label: 'Products', icon: FiPackage },
    { id: 'analytics', label: 'Analytics', icon: FiTrendingUp },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <StatsGrid>
              <StatCard>
                <StatIcon color="#007bff">
                  <FiDollarSign />
                </StatIcon>
                <StatContent>
                  <StatValue>${analytics.totalSales?.toLocaleString() || '0'}</StatValue>
                  <StatLabel>Total Sales</StatLabel>
                </StatContent>
              </StatCard>
              
              <StatCard>
                <StatIcon color="#28a745">
                  <FiShoppingCart />
                </StatIcon>
                <StatContent>
                  <StatValue>{orderStats.totalOrders || 0}</StatValue>
                  <StatLabel>Total Orders</StatLabel>
                </StatContent>
              </StatCard>
              
              <StatCard>
                <StatIcon color="#17a2b8">
                  <FiUsers />
                </StatIcon>
                <StatContent>
                  <StatValue>{vendorStats.totalVendors || 0}</StatValue>
                  <StatLabel>Active Vendors</StatLabel>
                </StatContent>
              </StatCard>
              
              <StatCard>
                <StatIcon color="#ffc107">
                  <FiHome />
                </StatIcon>
                <StatContent>
                  <StatValue>{stores?.length || 0}</StatValue>
                  <StatLabel>Active Stores</StatLabel>
                </StatContent>
              </StatCard>
            </StatsGrid>
            <AnalyticsDashboard />
          </>
        );
      case 'stores':
        return <StoreBuilder />;
      case 'orders':
        return <OrderManagement />;
      case 'vendors':
        return <VendorManagement />;
      case 'products':
        return <InventoryManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <div>Coming Soon...</div>;
    }
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <SidebarHeader>
          <Logo>
            <FiHome />
            ShopifyClone
          </Logo>
        </SidebarHeader>
        
        {navigationItems.map(item => (
          <NavItem
            key={item.id}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon />
            {item.label}
          </NavItem>
        ))}
      </Sidebar>

      <MainContent>
        <Header>
          <HeaderTitle>
            {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </HeaderTitle>
          {activeTab === 'stores' && (
            <CreateStoreButton onClick={() => setShowStoreBuilder(true)}>
              <FiPlus />
              Create New Store
            </CreateStoreButton>
          )}
        </Header>
        
        {renderContent()}
      </MainContent>
    </DashboardContainer>
  );
};

export default ShopifyDashboard;

import { useState } from 'react';
import styled from 'styled-components';
import OrderManagement from './OrderManagement';
import OrderAnalytics from './OrderAnalytics';
import OrderTracking from './OrderTracking';
import { FiList, FiBarChart2, FiTruck } from 'react-icons/fi';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const DashboardTitle = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
`;

const TabNavigation = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? '#3b82f6' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#2563eb' : '#f8fafc'};
    color: ${props => props.active ? 'white' : '#374151'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const TabContent = styled.div`
  background: transparent;
`;



const OrderDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');

  const tabs = [
    {
      id: 'orders',
      label: 'Order Management',
      icon: <FiList />,
      component: <OrderManagement />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <FiBarChart2 />,
      component: <OrderAnalytics />
    },
    {
      id: 'tracking',
      label: 'Order Tracking',
      icon: <FiTruck />,
      component: <OrderTracking />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Order Management System</DashboardTitle>
        <TabNavigation>
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </TabButton>
          ))}
        </TabNavigation>
      </DashboardHeader>

      <TabContent>
        {activeTabData?.component}
      </TabContent>
    </DashboardContainer>
  );
};

export default OrderDashboard;
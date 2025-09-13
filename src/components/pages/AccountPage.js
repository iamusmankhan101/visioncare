import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiUser, FiShoppingBag, FiHeart, FiEdit3, FiMapPin, FiPhone, FiMail, FiCalendar } from 'react-icons/fi';

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Montserrat', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Breadcrumb = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  
  a {
    color: #48b2ee;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: fit-content;
`;

const SidebarTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0.5rem;
`;

const NavButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: ${props => props.active ? '#48b2ee' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover {
    background: ${props => props.active ? '#3a9de8' : '#f0f0f0'};
  }
`;

const MainContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PersonalDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const DetailCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: #fafafa;
`;

const DetailTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: #48b2ee;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    background: #f0f8ff;
  }
`;

const DetailItem = styled.div`
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: #666;
  min-width: 80px;
`;

const DetailValue = styled.span`
  color: #333;
`;

const OrdersGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const OrderCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: #fafafa;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderNumber = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
`;

const OrderDate = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

const OrderStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'delivered': return '#d4edda';
      case 'shipped': return '#d1ecf1';
      case 'processing': return '#fff3cd';
      default: return '#f8d7da';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'delivered': return '#155724';
      case 'shipped': return '#0c5460';
      case 'processing': return '#856404';
      default: return '#721c24';
    }
  }};
`;

const OrderTotal = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
`;

const WishlistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const WishlistItem = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const WishlistImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const WishlistContent = styled.div`
  padding: 1rem;
`;

const WishlistTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const WishlistPrice = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
  color: #48b2ee;
  margin: 0 0 0.75rem 0;
`;

const WishlistActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #48b2ee;
  border-radius: 4px;
  background: ${props => props.primary ? '#48b2ee' : 'white'};
  color: ${props => props.primary ? 'white' : '#48b2ee'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.primary ? '#3a9de8' : '#f0f8ff'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const AccountPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('personal');
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  // Use actual user data from Redux store, with fallbacks for missing data
  const userInfo = {
    firstName: user?.firstName || 'Not provided',
    lastName: user?.lastName || 'Not provided',
    email: user?.email || 'Not provided',
    phone: user?.phone || 'Not provided',
    birthDate: user?.birthDate || 'Not provided',
    address: user?.address || 'Not provided'
  };

  // Get orders and wishlist from Redux store
  const orders = useSelector(state => state.orders?.items || []);
  const wishlistItems = useSelector(state => state.wishlist?.items || []);

  useEffect(() => {
    // Check if user is authenticated using Redux state
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const renderPersonalDetails = () => (
    <div>
      <SectionTitle>
        <FiUser />
        Personal Details
      </SectionTitle>
      <PersonalDetailsGrid>
        <DetailCard>
          <DetailTitle>
            Personal Information
            <EditButton>
              <FiEdit3 />
            </EditButton>
          </DetailTitle>
          <DetailItem>
            <FiUser />
            <DetailLabel>Name:</DetailLabel>
            <DetailValue>{userInfo.firstName} {userInfo.lastName}</DetailValue>
          </DetailItem>
          <DetailItem>
            <FiMail />
            <DetailLabel>Email:</DetailLabel>
            <DetailValue>{userInfo.email}</DetailValue>
          </DetailItem>
          <DetailItem>
            <FiPhone />
            <DetailLabel>Phone:</DetailLabel>
            <DetailValue>{userInfo.phone}</DetailValue>
          </DetailItem>
          <DetailItem>
            <FiCalendar />
            <DetailLabel>Birth Date:</DetailLabel>
            <DetailValue>{userInfo.birthDate}</DetailValue>
          </DetailItem>
        </DetailCard>
        
        <DetailCard>
          <DetailTitle>
            Address Information
            <EditButton>
              <FiEdit3 />
            </EditButton>
          </DetailTitle>
          <DetailItem>
            <FiMapPin />
            <DetailLabel>Address:</DetailLabel>
            <DetailValue>{userInfo.address}</DetailValue>
          </DetailItem>
        </DetailCard>
      </PersonalDetailsGrid>
    </div>
  );

  const renderOrders = () => (
    <div>
      <SectionTitle>
        <FiShoppingBag />
        My Orders
      </SectionTitle>
      {orders.length > 0 ? (
        <OrdersGrid>
          {orders.map(order => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <OrderInfo>
                  <OrderNumber>Order #{order.id}</OrderNumber>
                  <OrderDate>Placed on {new Date(order.date).toLocaleDateString()}</OrderDate>
                </OrderInfo>
                <OrderStatus status={order.status}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </OrderStatus>
                <OrderTotal>${order.total}</OrderTotal>
              </OrderHeader>
              <DetailItem>
                <DetailLabel>Items:</DetailLabel>
                <DetailValue>{order.items.join(', ')}</DetailValue>
              </DetailItem>
            </OrderCard>
          ))}
        </OrdersGrid>
      ) : (
        <EmptyState>
          <EmptyStateIcon>📦</EmptyStateIcon>
          <h3>No orders yet</h3>
          <p>When you place your first order, it will appear here.</p>
        </EmptyState>
      )}
    </div>
  );

  const renderWishlist = () => (
    <div>
      <SectionTitle>
        <FiHeart />
        Wishlist
      </SectionTitle>
      {wishlistItems.length > 0 ? (
        <WishlistGrid>
          {wishlistItems.map(item => (
            <WishlistItem key={item.id}>
              <WishlistImage 
                src={item.image} 
                alt={item.name}
                onError={(e) => {
                  e.target.src = '/images/placeholder-eyewear.jpg';
                }}
              />
              <WishlistContent>
                <WishlistTitle>{item.name}</WishlistTitle>
                <WishlistPrice>PKR {item.price}</WishlistPrice>
                <WishlistActions>
                  <ActionButton primary>Add to Cart</ActionButton>
                  <ActionButton>Remove</ActionButton>
                </WishlistActions>
              </WishlistContent>
            </WishlistItem>
          ))}
        </WishlistGrid>
      ) : (
        <EmptyState>
          <EmptyStateIcon>💝</EmptyStateIcon>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love to your wishlist.</p>
        </EmptyState>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalDetails();
      case 'orders':
        return renderOrders();
      case 'wishlist':
        return renderWishlist();
      default:
        return renderPersonalDetails();
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <FiUser />
          My Account
        </PageTitle>
        <Breadcrumb>
          <a href="/">Homepage</a> / My Account
        </Breadcrumb>
      </PageHeader>

      <ContentGrid>
        <Sidebar>
          <SidebarTitle>My details</SidebarTitle>
          <NavList>
            <NavItem>
              <NavButton 
                active={activeSection === 'personal'}
                onClick={() => setActiveSection('personal')}
              >
                <FiUser />
                Personal Details
              </NavButton>
            </NavItem>
            <NavItem>
              <NavButton 
                active={activeSection === 'orders'}
                onClick={() => setActiveSection('orders')}
              >
                <FiShoppingBag />
                My Orders
              </NavButton>
            </NavItem>
            <NavItem>
              <NavButton 
                active={activeSection === 'wishlist'}
                onClick={() => setActiveSection('wishlist')}
              >
                <FiHeart />
                Wishlist
              </NavButton>
            </NavItem>
          </NavList>
        </Sidebar>

        <MainContent>
          {renderContent()}
        </MainContent>
      </ContentGrid>
    </PageContainer>
  );
};

export default AccountPage;

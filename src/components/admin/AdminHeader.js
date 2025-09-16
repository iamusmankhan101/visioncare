import React from 'react';
import styled from 'styled-components';
import { FiBell, FiSettings, FiUser, FiShoppingBag, FiUsers, FiLogOut } from 'react-icons/fi';

// Styled Components for Header Dropdowns
const DropdownContainer = styled.div`
  position: relative;
`;

const HeaderIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 10;
  
  &:hover {
    background: #f1f5f9;
    color: #475569;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    background: #e2e8f0;
  }
  
  svg {
    width: 18px;
    height: 18px;
    pointer-events: none;
  }
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #3ABEF9 0%, #3572EF 100%);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
  position: relative;
  z-index: 10;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(53, 114, 239, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
    pointer-events: none;
  }
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 16px;
    width: 12px;
    height: 12px;
    background: white;
    border: 1px solid #e2e8f0;
    border-bottom: none;
    border-right: none;
    transform: rotate(45deg);
  }
`;

const NotificationHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
`;

const NotificationBadge = styled.span`
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
`;

const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const NotificationIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.type === 'order' ? '#dbeafe' : props.type === 'user' ? '#dcfce7' : '#fef3c7'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.type === 'order' ? '#3b82f6' : props.type === 'user' ? '#22c55e' : '#f59e0b'};
  }
`;

const NotificationText = styled.div`
  flex: 1;
`;

const NotificationMessage = styled.p`
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.4;
`;

const NotificationTime = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const ProfileDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 240px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  margin-top: 8px;
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 16px;
    width: 12px;
    height: 12px;
    background: white;
    border: 1px solid #e2e8f0;
    border-bottom: none;
    border-right: none;
    transform: rotate(45deg);
  }
`;

const ProfileHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
`;

const ProfileName = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
`;

const ProfileEmail = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
`;

const ProfileMenu = styled.div`
  padding: 0.5rem 0;
`;

const ProfileMenuItem = styled.button`
  width: 100%;
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  
  &:hover {
    background: #f8fafc;
  }
  
  svg {
    width: 16px;
    height: 16px;
    color: #6b7280;
  }
`;

const AdminHeader = ({ 
  showNotifications, 
  setShowNotifications, 
  showProfileMenu, 
  setShowProfileMenu,
  notifications,
  unreadNotifications,
  handleLogout,
  setActiveTab
}) => {
  const handleNotificationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
    setShowNotifications(false);
  };

  return (
    <>
      <DropdownContainer className="dropdown-container">
        <HeaderIconButton onClick={handleNotificationClick}>
          <FiBell />
          {unreadNotifications > 0 && (
            <div style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              background: '#ef4444',
              borderRadius: '50%',
              border: '2px solid white'
            }} />
          )}
        </HeaderIconButton>
        {showNotifications && (
          <NotificationDropdown>
            <NotificationHeader>
              <NotificationTitle>Notifications</NotificationTitle>
              {unreadNotifications > 0 && (
                <NotificationBadge>{unreadNotifications}</NotificationBadge>
              )}
            </NotificationHeader>
            <NotificationList>
              {notifications.map((notification) => (
                <NotificationItem key={notification.id}>
                  <NotificationContent>
                    <NotificationIcon type={notification.type}>
                      {notification.type === 'order' && <FiShoppingBag />}
                      {notification.type === 'user' && <FiUsers />}
                      {notification.type === 'system' && <FiBell />}
                    </NotificationIcon>
                    <NotificationText>
                      <NotificationMessage>{notification.message}</NotificationMessage>
                      <NotificationTime>{notification.time}</NotificationTime>
                    </NotificationText>
                  </NotificationContent>
                </NotificationItem>
              ))}
            </NotificationList>
          </NotificationDropdown>
        )}
      </DropdownContainer>
      
      <DropdownContainer className="dropdown-container">
        <ProfileButton onClick={handleProfileClick}>
          <FiUser />
        </ProfileButton>
        {showProfileMenu && (
          <ProfileDropdown>
            <ProfileHeader>
              <ProfileName>Usman Khan</ProfileName>
              <ProfileEmail>iamusmankhan101@gmail.com</ProfileEmail>
            </ProfileHeader>
            <ProfileMenu>
              <ProfileMenuItem onClick={() => setActiveTab('settings')}>
                <FiSettings />
                Settings
              </ProfileMenuItem>
              <ProfileMenuItem onClick={() => setActiveTab('profile')}>
                <FiUser />
                My Profile
              </ProfileMenuItem>
              <ProfileMenuItem onClick={handleLogout}>
                <FiLogOut />
                Sign Out
              </ProfileMenuItem>
            </ProfileMenu>
          </ProfileDropdown>
        )}
      </DropdownContainer>
    </>
  );
};

export default AdminHeader;

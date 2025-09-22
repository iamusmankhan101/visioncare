import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext({});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children, expoPushToken }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);

  // Mock functions for demo
  const loadNotifications = async () => {
    // Mock notifications
    const mockNotifications = [
      {
        id: 1,
        title: 'New Order',
        message: 'Order #ORD-001 received from John Doe',
        type: 'order',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Low Stock Alert',
        message: 'Blue Light Glasses stock is running low',
        type: 'inventory',
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const toggleNotifications = (enabled) => {
    setIsEnabled(enabled);
  };

  const sendTestNotification = () => {
    const newNotification = {
      id: Date.now(),
      title: 'Test Notification',
      message: 'This is a test notification!',
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const value = {
    notifications,
    unreadCount,
    isEnabled,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleNotifications,
    sendTestNotification,
    loadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

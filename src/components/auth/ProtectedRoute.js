import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import authService from '../../services/authService';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8fafc;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3ABEF9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-left: 1rem;
  color: #64748b;
  font-size: 1rem;
`;

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Validate current session
        const sessionValid = authService.validateSession();
        const authenticated = authService.isAuthenticated();
        const adminRole = authService.isAdmin();

        // If session is invalid, clear everything and redirect
        if (!sessionValid || !authenticated) {
          authService.logout();
          setIsAuthenticated(false);
          setIsAdmin(false);
        } else {
          setIsAuthenticated(true);
          setIsAdmin(adminRole);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Verifying authentication...</LoadingText>
      </LoadingContainer>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && !isAdmin) {
    // Clear any invalid session data
    authService.logout();
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated and authorized, render the protected component
  return children;
};

export default ProtectedRoute;

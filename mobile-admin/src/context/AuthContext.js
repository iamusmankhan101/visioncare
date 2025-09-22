import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing session on app start
    checkAuthState();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session, profile) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setUserProfile(profile);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          setError(null);
        } else if (event === 'TOKEN_REFRESHED') {
          // Session refreshed, update user data
          const currentSession = await authService.getCurrentSession();
          if (currentSession) {
            setUser(currentSession.user);
            setUserProfile(currentSession.profile);
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      setLoading(true);
      const session = await authService.getCurrentSession();
      
      if (session?.user && session?.profile) {
        // Verify user has required role
        if (authService.hasRequiredRole(session.profile.role)) {
          setUser(session.user);
          setUserProfile(session.profile);
        } else {
          // User doesn't have required role, sign them out
          await authService.signOut();
          setError('Access denied. Admin or staff role required.');
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setError(error.message);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.signIn(email, password);
      
      setUser(result.user);
      setUserProfile(result.profile);
      
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setUserProfile(null);
      setError(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const updatedProfile = await authService.updateProfile(updates);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message);
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      await authService.updatePassword(newPassword);
    } catch (error) {
      console.error('Update password error:', error);
      setError(error.message);
      throw error;
    }
  };

  const hasPermission = (permission) => {
    return authService.hasPermission(permission);
  };

  const isAdmin = () => {
    return authService.isAdmin();
  };

  const isManagerOrAdmin = () => {
    return authService.isManagerOrAdmin();
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    hasPermission,
    isAdmin,
    isManagerOrAdmin,
    clearError,
    refreshAuth: checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Mock Authentication Service for Demo
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CUSTOMER: 'customer'
};

// Mock users for demo
const MOCK_USERS = {
  'admin@eyewearr.com': {
    id: '1',
    email: 'admin@eyewearr.com',
    password: 'admin123',
    profile: {
      id: '1',
      name: 'Admin User',
      role: USER_ROLES.ADMIN,
      is_active: true,
      last_seen: new Date().toISOString()
    }
  },
  'manager@eyewearr.com': {
    id: '2',
    email: 'manager@eyewearr.com',
    password: 'manager123',
    profile: {
      id: '2',
      name: 'Manager User',
      role: USER_ROLES.MANAGER,
      is_active: true,
      last_seen: new Date().toISOString()
    }
  },
  'staff@eyewearr.com': {
    id: '3',
    email: 'staff@eyewearr.com',
    password: 'staff123',
    profile: {
      id: '3',
      name: 'Staff User',
      role: USER_ROLES.STAFF,
      is_active: true,
      last_seen: new Date().toISOString()
    }
  }
};

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userProfile = null;
    this.authListeners = [];
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUser = MOCK_USERS[email.toLowerCase()];
      
      if (!mockUser || mockUser.password !== password) {
        throw new Error('Invalid email or password');
      }

      if (!mockUser.profile.is_active) {
        throw new Error('Account is deactivated. Please contact administrator.');
      }

      // Check if user has admin/staff role
      if (!this.hasRequiredRole(mockUser.profile.role)) {
        throw new Error('Access denied. Admin or staff role required.');
      }

      this.currentUser = {
        id: mockUser.id,
        email: mockUser.email,
        created_at: new Date().toISOString()
      };
      
      this.userProfile = mockUser.profile;

      // Store session
      await AsyncStorage.setItem('userSession', JSON.stringify({
        user: this.currentUser,
        profile: this.userProfile
      }));

      // Notify listeners
      this.notifyAuthListeners('SIGNED_IN', {
        user: this.currentUser,
        session: { user: this.currentUser }
      });

      return {
        user: this.currentUser,
        profile: this.userProfile,
        session: { user: this.currentUser },
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      this.currentUser = null;
      this.userProfile = null;
      
      // Clear any cached data
      await AsyncStorage.multiRemove([
        'userSession',
        'userProfile',
        'dashboardCache',
        'ordersCache'
      ]);

      // Notify listeners
      this.notifyAuthListeners('SIGNED_OUT', null);

      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const sessionData = await AsyncStorage.getItem('userSession');
      
      if (sessionData) {
        const { user, profile } = JSON.parse(sessionData);
        this.currentUser = user;
        this.userProfile = profile;

        return {
          user: user,
          profile: profile,
          session: { user: user },
        };
      }

      return null;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      // In mock service, return the stored profile
      return this.userProfile;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      if (!this.currentUser) throw new Error('No authenticated user');

      this.userProfile = { ...this.userProfile, ...updates };
      
      // Update stored session
      await AsyncStorage.setItem('userSession', JSON.stringify({
        user: this.currentUser,
        profile: this.userProfile
      }));

      return this.userProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Update last seen timestamp
  async updateLastSeen() {
    try {
      if (!this.currentUser) return;
      // Mock implementation - just update in memory
      this.userProfile.last_seen = new Date().toISOString();
    } catch (error) {
      console.error('Update last seen error:', error);
    }
  }

  // Check if user has required role for admin access
  hasRequiredRole(role) {
    const allowedRoles = [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF];
    return allowedRoles.includes(role);
  }

  // Check if user is admin
  isAdmin() {
    return this.userProfile?.role === USER_ROLES.ADMIN;
  }

  // Check if user is manager or admin
  isManagerOrAdmin() {
    return [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(this.userProfile?.role);
  }

  // Check if user has specific permission
  hasPermission(permission) {
    const role = this.userProfile?.role;
    
    const permissions = {
      [USER_ROLES.ADMIN]: [
        'view_orders', 'edit_orders', 'delete_orders',
        'view_products', 'edit_products', 'delete_products',
        'view_customers', 'edit_customers',
        'view_analytics', 'manage_users', 'manage_settings'
      ],
      [USER_ROLES.MANAGER]: [
        'view_orders', 'edit_orders',
        'view_products', 'edit_products',
        'view_customers', 'edit_customers',
        'view_analytics'
      ],
      [USER_ROLES.STAFF]: [
        'view_orders', 'edit_orders',
        'view_products',
        'view_customers'
      ]
    };

    return permissions[role]?.includes(permission) || false;
  }

  // Notify auth listeners
  notifyAuthListeners(event, session) {
    this.authListeners.forEach(callback => {
      callback(event, session, this.userProfile);
    });
  }

  // Listen for auth state changes
  onAuthStateChange(callback) {
    this.authListeners.push(callback);
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.authListeners.indexOf(callback);
            if (index > -1) {
              this.authListeners.splice(index, 1);
            }
          }
        }
      }
    };
  }

  // Reset password
  async resetPassword(email) {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!MOCK_USERS[email.toLowerCase()]) {
        throw new Error('Email not found');
      }
      
      // In real app, would send email
      console.log('Password reset email sent to:', email);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }
      
      // In real app, would update password
      console.log('Password updated for user:', this.currentUser.email);
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  // Get current user info
  getCurrentUser() {
    return {
      user: this.currentUser,
      profile: this.userProfile,
    };
  }
}

// Export singleton instance
export default new AuthService();

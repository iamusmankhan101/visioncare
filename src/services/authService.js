// Admin Authentication Service
class AuthService {
  constructor() {
    this.tokenKey = 'adminToken';
    this.userKey = 'adminUser';
  }

  // Login admin user
  async login(email, password) {
    try {
      // In a real application, this would be an API call
      // For now, we'll use the hardcoded admin credentials
      if (email === 'Visioncareoptometryclinic@gmail.com' && password === 'admin123') {
        const userData = {
          email: email,
          name: 'Vision Care Optometry Clinic',
          role: 'admin',
          loginTime: new Date().toISOString()
        };

        // Store authentication data
        localStorage.setItem(this.tokenKey, 'admin-authenticated');
        localStorage.setItem(this.userKey, JSON.stringify(userData));

        return {
          success: true,
          user: userData,
          token: 'admin-authenticated'
        };
      } else {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  // Logout admin user
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    return true;
  }

  // Check if admin is authenticated
  isAuthenticated() {
    const token = localStorage.getItem(this.tokenKey);
    return token === 'admin-authenticated';
  }

  // Get current admin user data
  getCurrentUser() {
    try {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // Get authentication token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Check if user has admin role
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  // Validate session (check if token is still valid)
  validateSession() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    if (!token || !user) {
      this.logout();
      return false;
    }

    // In a real app, you might check token expiration here
    return true;
  }

  // Auto logout after inactivity (optional)
  setupAutoLogout(timeoutMinutes = 60) {
    let timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.logout();
        window.location.href = '/admin/login';
      }, timeoutMinutes * 60 * 1000);
    };

    // Reset timeout on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    // Initial timeout
    resetTimeout();

    return () => {
      clearTimeout(timeout);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;

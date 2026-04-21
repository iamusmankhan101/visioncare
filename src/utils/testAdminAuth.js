// Test utility to verify admin authentication protection
import authService from '../services/authService';

const testAdminAuth = () => {
  console.log('🔐 Testing Admin Authentication Protection...\n');

  // Test 1: Check if admin routes are accessible without authentication
  console.log('Test 1: Authentication Status');
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();
  const currentUser = authService.getCurrentUser();
  
  console.log('- Is Authenticated:', isAuthenticated);
  console.log('- Is Admin:', isAdmin);
  console.log('- Current User:', currentUser);
  
  if (!isAuthenticated) {
    console.log('✅ PASS: User is not authenticated - admin routes should be blocked');
  } else {
    console.log('⚠️  WARNING: User appears to be authenticated');
  }

  // Test 2: Check localStorage for any auth tokens
  console.log('\nTest 2: Local Storage Check');
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  
  console.log('- Admin Token:', adminToken);
  console.log('- Admin User Data:', adminUser);
  
  if (!adminToken && !adminUser) {
    console.log('✅ PASS: No authentication data in localStorage');
  } else {
    console.log('⚠️  WARNING: Authentication data found in localStorage');
  }

  // Test 3: Validate session
  console.log('\nTest 3: Session Validation');
  const sessionValid = authService.validateSession();
  console.log('- Session Valid:', sessionValid);
  
  if (!sessionValid) {
    console.log('✅ PASS: Session validation failed - user should be redirected to login');
  } else {
    console.log('⚠️  WARNING: Session appears to be valid');
  }

  // Test 4: Test logout functionality
  console.log('\nTest 4: Logout Functionality');
  authService.logout();
  const afterLogout = {
    isAuthenticated: authService.isAuthenticated(),
    isAdmin: authService.isAdmin(),
    currentUser: authService.getCurrentUser(),
    token: localStorage.getItem('adminToken'),
    userData: localStorage.getItem('adminUser')
  };
  
  console.log('- After logout - Authenticated:', afterLogout.isAuthenticated);
  console.log('- After logout - Admin:', afterLogout.isAdmin);
  console.log('- After logout - User:', afterLogout.currentUser);
  console.log('- After logout - Token:', afterLogout.token);
  console.log('- After logout - User Data:', afterLogout.userData);
  
  if (!afterLogout.isAuthenticated && !afterLogout.isAdmin && !afterLogout.currentUser && !afterLogout.token && !afterLogout.userData) {
    console.log('✅ PASS: Logout successfully cleared all authentication data');
  } else {
    console.log('❌ FAIL: Logout did not clear all authentication data');
  }

  console.log('\n🔐 Admin Authentication Test Complete');
  
  return {
    authenticationBlocked: !isAuthenticated,
    sessionInvalid: !sessionValid,
    logoutWorking: !afterLogout.isAuthenticated,
    overallSecure: !isAuthenticated && !sessionValid && !afterLogout.isAuthenticated
  };
};

// Add to window for manual testing
if (typeof window !== 'undefined') {
  window.testAdminAuth = testAdminAuth;
}

export default testAdminAuth;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const AdminRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and is admin
    const isAuthenticated = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();

    if (isAuthenticated && isAdmin) {
      // If authenticated admin, redirect to admin dashboard
      navigate('/admin', { replace: true });
    } else {
      // If not authenticated or not admin, redirect to login
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  // Return null as this component only handles redirects
  return null;
};

export default AdminRedirect;

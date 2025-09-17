import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAdminApp from '../components/mobile/MobileAdminApp';
import { useSelector } from 'react-redux';

const MobileAdminPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth || {});

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    if (user && !user.isAdmin) {
      navigate('/');
      return;
    }

    // Set mobile viewport meta tag for better mobile experience
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    // Add mobile-specific styles
    document.body.style.overflow = 'auto';
    document.body.style.touchAction = 'manipulation';

    return () => {
      // Cleanup on unmount
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isAuthenticated, user, navigate]);

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #3ABEF9 0%, #3572EF 100%)',
        color: 'white',
        fontSize: '1.125rem'
      }}>
        Redirecting to login...
      </div>
    );
  }

  return <MobileAdminApp />;
};

export default MobileAdminPage;
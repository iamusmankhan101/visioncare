import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import React from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import ScrollToTop from './components/common/ScrollToTop';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';
import MobileAdminPage from './pages/MobileAdminPage';
import MobileTestPage from './components/mobile/MobileTestPage';
import AdminNotificationDashboard from './components/admin/AdminNotificationDashboard';
import ShopifyDashboard from './components/admin/ShopifyDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EmailTest from './components/EmailTest';
import NotificationTest from './components/NotificationTest';
import OrderTest from './components/OrderTest';
import ApiTest from './components/ApiTest';
import AdminDebug from './components/AdminDebug';
import OrderItemsDebug from './components/OrderItemsDebug';
import SlugTest from './components/SlugTest';
import LensesPage from './pages/LensesPage';
import LensProductDetailPage from './pages/LensProductDetailPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage'; // Import the new LoginPage component
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import WishlistPage from './pages/WishlistPage';
import NotFoundPage from './pages/NotFoundPage';
import ExchangeReturnPage from './pages/ExchangeReturnPage';
import FAQPage from './pages/FAQPage';
import CommentsPage from './components/CommentsPage';
import ProductDetailTest from './components/ProductDetailTest';
import debugOrders from './utils/debugOrders';
import testAdminAuth from './utils/testAdminAuth';
import { testEmailJSConnection, debugEmailJSConfig } from './services/emailService';
import notificationInit from './services/notificationInit';

// Add debug function to window
window.debugOrders = debugOrders;
window.testAdminAuth = testAdminAuth;
window.testEmailJS = testEmailJSConnection;
window.debugEmailJS = debugEmailJSConfig;

// Initialize notification services when app loads
notificationInit.init().then(success => {
  if (success) {
    console.log('🎉 App loaded with notification services enabled');
  } else {
    console.warn('⚠️ App loaded but notification services failed to initialize');
  }
}).catch(error => {
  console.error('❌ Error initializing notification services:', error);
});

// Add notification functions to window for debugging
window.notificationInit = notificationInit;
window.testNotifications = () => notificationInit.sendTestNotification();
window.testOrderNotification = () => notificationInit.triggerOrderNotification();

// Component to conditionally render layout
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/mobile" element={
          <ProtectedRoute requireAdmin={true}>
            <MobileAdminPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/mobile/test" element={<MobileTestPage />} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminNotificationDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/shopify" element={
          <ProtectedRoute requireAdmin={true}>
            <ShopifyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPage />
          </ProtectedRoute>
        } />
      </Routes>
    );
  }

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/lenses" element={<LensesPage />} />
          <Route path="/lenses/:id" element={<LensProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help/exchange-return" element={<ExchangeReturnPage />} />
          <Route path="/help/faq" element={<FAQPage />} />
          <Route path="/comments" element={<CommentsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/email-test" element={<EmailTest />} />
          <Route path="/notification-test" element={<NotificationTest />} />
          <Route path="/order-test" element={<OrderTest />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/admin-debug" element={<AdminDebug />} />
          <Route path="/order-items-debug" element={<OrderItemsDebug />} />
          <Route path="/slug-test" element={<SlugTest />} />
          <Route path="/product-detail-test" element={<ProductDetailTest />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <ScrollToTopButton />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="App">
            <AppContent />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

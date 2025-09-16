import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import React from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';
import AdminNotificationDashboard from './components/admin/AdminNotificationDashboard';
import ShopifyDashboard from './components/admin/ShopifyDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LensesPage from './pages/LensesPage';
import LensProductDetailPage from './pages/LensProductDetailPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage'; // Import the new LoginPage component
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import WishlistPage from './pages/WishlistPage';
import NotFoundPage from './pages/NotFoundPage';
import debugOrders from './utils/debugOrders';
import testAdminAuth from './utils/testAdminAuth';

// Add debug function to window
window.debugOrders = debugOrders;
window.testAdminAuth = testAdminAuth;

// Component to conditionally render layout
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
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
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/lenses" element={<LensesPage />} />
          <Route path="/lenses/:id" element={<LensProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth" element={<AuthPage />} />
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
          <div className="App">
            <AppContent />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

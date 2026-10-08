import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Topbar from './Topbar';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import AuthModal from '../auth/AuthModal';
import ToastContainer from '../common/ToastContainer';
import { useUIStore } from '../../store/uiStore';
import { GET_CURRENT_USER } from '../../graphql/auth';

const MainLayout = () => {
  const { setUser, logout } = useUIStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Auto-fetch current user on load if token is stored
  const { data, error } = useQuery(GET_CURRENT_USER, {
    skip: !token,
  });

  useEffect(() => {
    if (data?.getCurrentUser) {
      setUser(data.getCurrentUser);
    } else if (error) {
      // If token expired or invalid, log out safely
      logout();
    }
  }, [data, error, setUser, logout]);

  return (
    <div className="min-h-screen flex flex-col relative bg-background text-secondary">
      <Topbar />
      <Header />

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />

      {/* Global Modals, Drawers & Notifications */}
      <CartDrawer />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default MainLayout;

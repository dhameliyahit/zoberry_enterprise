import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';

const MainLayout = () => {
  return (
    // min-h-screen ensures the footer sticks to the bottom if the page content is short
    <div className="min-h-screen flex flex-col relative">
      <Topbar />
      <Header />
      
      {/* main wraps the Outlet which acts as a placeholder for our actual pages */}
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
      
      {/* Global UI Components */}
      <CartDrawer />
    </div>
  );
};

export default MainLayout;

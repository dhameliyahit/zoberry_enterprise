import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All routes inside MainLayout will automatically have the Topbar, Header, and Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          {/* We will add more routes like <Route path="/cart" element={<CartPage />} /> here later */}
          
        </Route>

        {/* Admin Routes - Completely Separate Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          {/* We will add more admin sub-routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

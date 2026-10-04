import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All routes inside MainLayout will automatically have the Topbar, Header, and Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          {/* We will add more routes like <Route path="/cart" element={<CartPage />} /> here later */}
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

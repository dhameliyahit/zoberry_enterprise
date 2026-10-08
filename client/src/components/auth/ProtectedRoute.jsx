import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useUIStore();
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // If no token or user, redirect to home or open auth
  if (!token && !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireAdmin && user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

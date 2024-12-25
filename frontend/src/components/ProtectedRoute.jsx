import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, adminRoute = false }) => {
  const token = adminRoute 
    ? localStorage.getItem('userToken') 
    : localStorage.getItem('token');

  // If no token, redirect to appropriate login page
  if (!token) {
    return adminRoute 
      ? <Navigate to="/login/admin" replace /> 
      : <Navigate to="/login" replace />;
  }
  return element;
};

export default ProtectedRoute;
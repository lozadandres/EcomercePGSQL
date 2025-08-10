import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || !user.isAdmin) {
    // If user is not an admin, redirect to the login page.
    return <Navigate to="/login" replace />;
  }

  // If user is an admin, render the child components.
  return children;
};

export default ProtectedRoute;

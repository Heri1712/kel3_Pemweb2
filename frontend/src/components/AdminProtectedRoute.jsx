import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects admin-only routes.
 * Redirects to /admin/login if not authenticated or if the user is not an admin.
 */
export default function AdminProtectedRoute({ children }) {
  const { isAuth, user } = useAuth();

  if (!isAuth || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

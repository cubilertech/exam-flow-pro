
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/lib/hooks';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === "admin" && !user?.isAdmin) {
    // Redirect to home if authenticated but not admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

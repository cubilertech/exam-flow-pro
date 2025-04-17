
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/lib/hooks';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.isAdmin) {
    // Redirect to home if authenticated but not admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};


import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/lib/hooks';

interface StudentRouteProps {
  children: React.ReactNode;
}

export const StudentRoute = ({ children }: StudentRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

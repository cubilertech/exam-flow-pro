
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/lib/hooks';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    // Redirect to home if already authenticated
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

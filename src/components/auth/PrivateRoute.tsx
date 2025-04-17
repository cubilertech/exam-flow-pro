
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/lib/hooks';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const PrivateRoute = ({ children, requireAdmin = false }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !user?.isAdmin) {
    // Redirect non-admin users to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

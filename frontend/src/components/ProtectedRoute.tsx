import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: JSX.Element;
  requireAdmin?: boolean;
  requireCfo?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin, requireCfo }: ProtectedRouteProps) => {
  const { user, loading, isAdmin, isCfo } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader message="Authenticating..." />;
  }

  if (!user) {
    // Redirect them to the /auth page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireCfo && !isCfo) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

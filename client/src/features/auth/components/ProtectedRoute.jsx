import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/useAuthStore.js';
import LoadingSpinner from '@components/LoadingSpinner';
import { APP_PATHS } from '@/constants';

/**
 * Route guard that protects admin routes.
 * - While session is loading, renders a loading spinner.
 * - If not authenticated, redirects to the login page.
 * - If authenticated, renders the child routes.
 */
export function ProtectedRoute() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isLoading) {
    return <LoadingSpinner className="mt-20" size="lg" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_PATHS.LOGIN} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

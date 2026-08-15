import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { APP_PATHS } from '../../../constants';

/**
 * Route guard that protects Writer routes.
 * - While session is loading, renders a loading spinner.
 * - If not authenticated or not a writer/admin, redirects to login page.
 * - If authenticated as writer/admin, renders the child routes.
 */
export function WriterRoute() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isLoading) {
    return <LoadingSpinner className="mt-20" size="lg" />;
  }

  if (!isAuthenticated || !user || !['writer', 'admin'].includes(user.role)) {
    return <Navigate to={APP_PATHS.LOGIN} replace />;
  }

  return <Outlet />;
}

export default WriterRoute;

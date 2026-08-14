import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/useAuthStore.js';
import LoadingSpinner from '@components/LoadingSpinner';
import { APP_PATHS } from '@/constants';

/**
 * Route guard that prevents authenticated users from accessing guest-only pages.
 * - While session is loading, renders a loading spinner.
 * - If authenticated, redirects to the admin dashboard.
 * - If not authenticated, renders the child routes.
 */
export function GuestRoute() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isLoading) {
    return <LoadingSpinner className="mt-20" size="lg" />;
  }

  if (isAuthenticated) {
    return <Navigate to={APP_PATHS.ADMIN} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;

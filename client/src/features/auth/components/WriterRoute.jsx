import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { APP_PATHS } from '../../../constants';

/**
 * Dedicated Route guard for Writer Portal routes (/writer-portal/*).
 * - While session is loading, renders a loading spinner.
 * - If unauthenticated, redirects to /writer-portal/login.
 * - If authenticated as admin, redirects to /portal-master.
 * - If authenticated as writer and status is approved & active, renders child routes.
 * - If pending/rejected/deactivated writer, redirects to /writer-portal/login.
 */
export function WriterRoute() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isLoading) {
    return <LoadingSpinner className="mt-20" size="lg" />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={APP_PATHS.WRITER_PORTAL_LOGIN} replace />;
  }

  // Admins must remain isolated in Admin Portal (/portal-master)
  if (user.role === 'admin') {
    return <Navigate to={APP_PATHS.ADMIN} replace />;
  }

  // Enforce writer status & active state
  if (user.role === 'writer') {
    if (user.writerStatus === 'approved' && user.isActive !== false) {
      return <Outlet />;
    }
  }

  return <Navigate to={APP_PATHS.WRITER_PORTAL_LOGIN} replace />;
}

export default WriterRoute;

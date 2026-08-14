import { lazy, Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PublicLayout from '../layouts/PublicLayout';
import ErrorLayout from '../layouts/ErrorLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../features/auth/components/ProtectedRoute.jsx';
import GuestRoute from '../features/auth/components/GuestRoute.jsx';

// Lazy-loaded page components
const HomePage = lazy(() => import('../pages/HomePage'));
const ArticlesPage = lazy(() => import('../pages/ArticlesPage'));
const SnippetsPage = lazy(() => import('../pages/SnippetsPage'));
const DevToolsPage = lazy(() => import('../pages/DevToolsPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Suspense component wrapper
const withSuspense = (Component) => (
  <Suspense fallback={<LoadingSpinner className="mt-20" size="lg" />}>
    <Component />
  </Suspense>
);

export function AppRoutes() {
  const routes = [
    // Main website shell layout routes (public — no auth required)
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: withSuspense(HomePage),
        },
        {
          path: 'articles',
          element: withSuspense(ArticlesPage),
        },
        {
          path: 'snippets',
          element: withSuspense(SnippetsPage),
        },
        {
          path: 'devtools',
          element: withSuspense(DevToolsPage),
        },
      ],
    },
    // Guest-only admin sign in route (redirect to /portal-master if already authenticated)
    {
      path: 'portal-master',
      element: <GuestRoute />,
      children: [
        {
          element: <PublicLayout />,
          children: [
            {
              path: 'login',
              element: withSuspense(LoginPage),
            },
          ],
        },
      ],
    },
    // Protected admin routes (redirect to /portal-master/login if not authenticated)
    {
      path: 'portal-master',
      element: <ProtectedRoute />,
      children: [
        {
          index: true,
          element: withSuspense(AdminDashboard),
        },
      ],
    },
    // Standalone Error views / 404 Catch-All layout routes
    {
      element: <ErrorLayout />,
      children: [
        {
          path: '*',
          element: withSuspense(NotFound),
        },
      ],
    },
  ];

  return useRoutes(routes);
}

export default AppRoutes;

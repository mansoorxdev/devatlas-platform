import { lazy, Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PublicLayout from '../layouts/PublicLayout';
import ErrorLayout from '../layouts/ErrorLayout';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy-loaded page components
const HomePage = lazy(() => import('../pages/HomePage'));
const ArticlesPage = lazy(() => import('../pages/ArticlesPage'));
const SnippetsPage = lazy(() => import('../pages/SnippetsPage'));
const DevToolsPage = lazy(() => import('../pages/DevToolsPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Suspense component wrapper
const withSuspense = (Component) => (
  <Suspense fallback={<LoadingSpinner className="mt-20" size="lg" />}>
    <Component />
  </Suspense>
);

export function AppRoutes() {
  const routes = [
    // Main website shell layout routes
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
    // Guest shell (Sign In / Register) layout routes
    {
      path: '/',
      element: <PublicLayout />,
      children: [
        {
          path: 'login',
          element: withSuspense(LoginPage),
        },
        {
          path: 'register',
          element: withSuspense(RegisterPage),
        },
      ],
    },
    // Standalone Error views / 404 Catch-All layout routes
    {
      path: '*',
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

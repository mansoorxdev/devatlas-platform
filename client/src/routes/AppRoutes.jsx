import { lazy, Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PublicLayout from '../layouts/PublicLayout';
import ErrorLayout from '../layouts/ErrorLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../features/auth/components/ProtectedRoute.jsx';
import WriterRoute from '../features/auth/components/WriterRoute.jsx';
import GuestRoute from '../features/auth/components/GuestRoute.jsx';

// Lazy-loaded page components
const HomePage = lazy(() => import('../pages/HomePage'));
const ArticlesPage = lazy(() => import('../pages/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('../pages/ArticleDetailPage'));
const SnippetsPage = lazy(() => import('../pages/SnippetsPage'));
const SnippetDetailPage = lazy(() => import('../pages/SnippetDetailPage'));
const ErrorsPage = lazy(() => import('../pages/ErrorsPage'));
const ErrorDetailPage = lazy(() => import('../pages/ErrorDetailPage'));
const DevToolsPage = lazy(() => import('../pages/DevToolsPage'));
const TermsPage = lazy(() => import('../pages/TermsPage'));
const PrivacyPage = lazy(() => import('../pages/PrivacyPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const AdminArticlesPage = lazy(() => import('../pages/AdminArticlesPage'));
const AdminArticleEditorPage = lazy(() => import('../pages/AdminArticleEditorPage'));
const AdminReviewQueuePage = lazy(() => import('../pages/AdminReviewQueuePage'));
const WriterDashboardPage = lazy(() => import('../pages/WriterDashboardPage'));
const WriterArticleEditorPage = lazy(() => import('../pages/WriterArticleEditorPage'));
const AdminSnippetsPage = lazy(() => import('../pages/AdminSnippetsPage'));
const AdminSnippetEditorPage = lazy(() => import('../pages/AdminSnippetEditorPage'));
const AdminErrorsPage = lazy(() => import('../pages/AdminErrorsPage'));
const AdminErrorEditorPage = lazy(() => import('../pages/AdminErrorEditorPage'));
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
          path: 'articles/:slug',
          element: withSuspense(ArticleDetailPage),
        },
        {
          path: 'snippets',
          element: withSuspense(SnippetsPage),
        },
        {
          path: 'snippets/:slug',
          element: withSuspense(SnippetDetailPage),
        },
        {
          path: 'errors',
          element: withSuspense(ErrorsPage),
        },
        {
          path: 'errors/:slug',
          element: withSuspense(ErrorDetailPage),
        },
        {
          path: 'devtools',
          element: withSuspense(DevToolsPage),
        },
        {
          path: 'terms',
          element: withSuspense(TermsPage),
        },
        {
          path: 'privacy',
          element: withSuspense(PrivacyPage),
        },
      ],
    },
    // Guest-only sign in route
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
    // Protected Writer portal routes
    {
      path: 'writer',
      element: <WriterRoute />,
      children: [
        {
          element: <MainLayout />,
          children: [
            {
              index: true,
              element: withSuspense(WriterDashboardPage),
            },
            {
              path: 'articles',
              element: withSuspense(WriterDashboardPage),
            },
            {
              path: 'articles/new',
              element: withSuspense(WriterArticleEditorPage),
            },
            {
              path: 'articles/:id/edit',
              element: withSuspense(WriterArticleEditorPage),
            },
          ],
        },
      ],
    },
    // Protected Admin routes (redirect to /portal-master/login if not authenticated)
    {
      path: 'portal-master',
      element: <ProtectedRoute />,
      children: [
        {
          index: true,
          element: withSuspense(AdminDashboard),
        },
        {
          path: 'articles',
          element: withSuspense(AdminArticlesPage),
        },
        {
          path: 'articles/new',
          element: withSuspense(AdminArticleEditorPage),
        },
        {
          path: 'articles/:id/edit',
          element: withSuspense(AdminArticleEditorPage),
        },
        {
          path: 'articles/review',
          element: withSuspense(AdminReviewQueuePage),
        },
        {
          path: 'snippets',
          element: withSuspense(AdminSnippetsPage),
        },
        {
          path: 'snippets/new',
          element: withSuspense(AdminSnippetEditorPage),
        },
        {
          path: 'snippets/:id/edit',
          element: withSuspense(AdminSnippetEditorPage),
        },
        {
          path: 'errors',
          element: withSuspense(AdminErrorsPage),
        },
        {
          path: 'errors/new',
          element: withSuspense(AdminErrorEditorPage),
        },
        {
          path: 'errors/:id/edit',
          element: withSuspense(AdminErrorEditorPage),
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

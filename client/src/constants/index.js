export const APP_PATHS = {
  HOME: '/',
  LOGIN: '/portal-master/login',
  ARTICLES: '/articles',
  ARTICLE_DETAIL: '/articles/:slug',
  SNIPPETS: '/snippets',
  SNIPPET_DETAIL: '/snippets/:slug',
  DEVTOOLS: '/devtools',
  ERRORS: '/errors',
  ERROR_DETAIL: '/errors/:slug',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  ADMIN: '/portal-master',
  ADMIN_ARTICLES: '/portal-master/articles',
  ADMIN_ARTICLE_NEW: '/portal-master/articles/new',
  ADMIN_ARTICLE_EDIT: '/portal-master/articles/:id/edit',
  ADMIN_SNIPPETS: '/portal-master/snippets',
  ADMIN_SNIPPET_NEW: '/portal-master/snippets/new',
  ADMIN_SNIPPET_EDIT: '/portal-master/snippets/:id/edit',
  ADMIN_ERRORS: '/portal-master/errors',
  ADMIN_ERROR_NEW: '/portal-master/errors/new',
  ADMIN_ERROR_EDIT: '/portal-master/errors/:id/edit',
  ADMIN_REVIEW_QUEUE: '/portal-master/articles/review',
  WRITER: '/writer',
  WRITER_ARTICLES: '/writer/articles',
  WRITER_ARTICLE_NEW: '/writer/articles/new',
  WRITER_ARTICLE_EDIT: '/writer/articles/:id/edit',
};

export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  ARTICLES: '/articles',
  SNIPPETS: '/snippets',
  ERRORS: '/errors',
  SEARCH: '/search',
};

export const STORAGE_KEYS = {
  THEME: 'devatlas_theme',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

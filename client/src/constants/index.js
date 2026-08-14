export const APP_PATHS = {
  HOME: '/',
  LOGIN: '/portal-master/login',
  ARTICLES: '/articles',
  ARTICLE_DETAIL: '/articles/:slug',
  SNIPPETS: '/snippets',
  DEVTOOLS: '/devtools',
  ERRORS: '/errors',
  ADMIN: '/portal-master',
  ADMIN_ARTICLES: '/portal-master/articles',
  ADMIN_ARTICLE_NEW: '/portal-master/articles/new',
  ADMIN_ARTICLE_EDIT: '/portal-master/articles/:id/edit',
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
};

export const STORAGE_KEYS = {
  THEME: 'devatlas_theme',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

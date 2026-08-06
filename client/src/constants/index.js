export const APP_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ARTICLES: '/articles',
  SNIPPETS: '/snippets',
  DEVTOOLS: '/devtools',
  ERRORS: '/errors',
  ADMIN: '/admin',
};

export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  ARTICLES: '/articles',
  SNIPPETS: '/snippets',
};

export const STORAGE_KEYS = {
  THEME: 'devatlas_theme',
  AUTH_TOKEN: 'devatlas_access_token',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

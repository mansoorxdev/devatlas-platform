import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { STORAGE_KEYS, THEMES } from '../constants';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    // Dark mode by default as per requirements
    return savedTheme === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Reacting to theme class toggles (Tailwind v4 detects dark mode via class "dark" on root)
    if (theme === THEMES.DARK) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Memoize toggleTheme to prevent recreation on every render
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  }, []);

  // Memoize context value to prevent unnecessary consumer re-renders
  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    isDark: theme === THEMES.DARK
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Terminal, LogOut, User } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';
import { useAuthStore } from '@features/auth/store/useAuthStore.js';
import { APP_PATHS } from '../constants';
import Container from './Container';

export function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navLinks = [
    { name: 'Articles', path: APP_PATHS.ARTICLES },
    { name: 'Snippets', path: APP_PATHS.SNIPPETS },
    { name: 'DevTools', path: APP_PATHS.DEVTOOLS },
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate(APP_PATHS.HOME, { replace: true });
  };

  return (
    <nav className="border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 hover:opacity-90">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Terminal size={18} />
            </div>
            DevAtlas
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-brand-500 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <hr className="w-px h-5 bg-slate-200 dark:bg-slate-800 border-none" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>

            {/* Render Admin Profile & Logout only when authenticated */}
            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <Link
                  to={APP_PATHS.ADMIN}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  <User size={16} />
                  {user?.name || 'Admin'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Actions (Menu + Theme toggle) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>

            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-900 py-4 space-y-3 flex flex-col transition-all">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-base font-medium px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 ${
                  isActive(link.path)
                    ? 'text-brand-500 font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Render Admin Profile & Logout only when authenticated */}
            {isAuthenticated && (
              <>
                <Link
                  to={APP_PATHS.ADMIN}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 flex items-center gap-2"
                >
                  <User size={18} />
                  {user?.name || 'Admin'} Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center px-4 py-2.5 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </Container>
    </nav>
  );
}

export default Navbar;
